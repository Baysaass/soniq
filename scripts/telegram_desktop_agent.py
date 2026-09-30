"""
Soniq Desktop RPA & Telegram Mouse Controller
Allows the admin to remotely view desktop screen, move mouse cursor, 
drag-and-drop files, and download/upload files directly via Telegram Bot!

Features:
- /screenshot : Capture screen with red mouse crosshair
- /click X Y  : Move and left click
- /doubleclick X Y : Double click
- /rightclick X Y : Right click context menu
- /drag X1 Y1 X2 Y2 : Smooth drag-and-drop files or windows
- /pos        : Get screen size and current cursor position
- /type text  : Type text into active window
- /hotkey k1 k2 : Send keyboard shortcuts (e.g. ctrl v)
- /open url   : Open website or file path
- Send File   : Directly download files to Desktop/Soniq_Uploads
"""

import os
import sys
import time
import json
import traceback
from pathlib import Path

# Dependency check
try:
    import requests
    from PIL import Image, ImageDraw, ImageGrab
    import pyautogui
except ImportError:
    print("\n[!] Шаардлагатай сангууд суугаагүй байна.")
    print("[*] Суулгах тушаал: pip install requests pillow pyautogui\n")
    sys.exit(1)

# PyAutoGUI Safety Settings
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.25

SCRIPT_DIR = Path(__file__).resolve().parent
CONFIG_FILE = SCRIPT_DIR / "desktop_agent_config.json"
UPLOADS_DIR = Path.home() / "Desktop" / "Soniq_Uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

def load_config():
    config = {
        "bot_token": "",
        "admin_chat_id": ""
    }
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                config.update(saved)
        except Exception as e:
            print(f"[!] Тохиргооны файл уншихад алдаа: {e}")
    return config

def save_config(config):
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        print(f"[+] Тохиргоо хадгалагдлаа: {CONFIG_FILE}")
    except Exception as e:
        print(f"[!] Тохиргоо хадгалахад алдаа: {e}")

class TelegramDesktopAgent:
    def __init__(self, bot_token: str, admin_chat_id: str = ""):
        self.bot_token = bot_token.strip()
        self.admin_chat_id = str(admin_chat_id).strip()
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"
        self.last_update_id = 0
        self.screen_width, self.screen_height = pyautogui.size()

    def send_message(self, chat_id: str, text: str, reply_markup=None):
        try:
            payload = {
                "chat_id": chat_id,
                "text": text,
                "parse_mode": "HTML"
            }
            if reply_markup:
                payload["reply_markup"] = reply_markup
            res = requests.post(f"{self.base_url}/sendMessage", json=payload, timeout=15)
            return res.json()
        except Exception as e:
            print(f"[!] Мэдэгдэл илгээхэд алдаа: {e}")
            return None

    def send_photo(self, chat_id: str, photo_path: str, caption: str = ""):
        try:
            with open(photo_path, "rb") as f:
                res = requests.post(
                    f"{self.base_url}/sendPhoto",
                    data={"chat_id": chat_id, "caption": caption, "parse_mode": "HTML"},
                    files={"photo": f},
                    timeout=25
                )
            return res.json()
        except Exception as e:
            print(f"[!] Зураг илгээхэд алдаа: {e}")
            return None

    def capture_screenshot_with_cursor(self) -> str:
        temp_img_path = SCRIPT_DIR / "temp_screenshot.jpg"
        screenshot = ImageGrab.grab()
        
        # Draw red cursor crosshair on screenshot
        mx, my = pyautogui.position()
        draw = ImageDraw.Draw(screenshot)
        r = 14
        draw.ellipse([mx - r, my - r, mx + r, my + r], outline="red", width=3)
        draw.line([mx - r - 8, my, mx + r + 8, my], fill="red", width=2)
        draw.line([mx, my - r - 8, mx, my + r + 8], fill="red", width=2)
        
        # Save compressed JPEG for high speed Telegram delivery
        screenshot.convert("RGB").save(temp_img_path, "JPEG", quality=75)
        return str(temp_img_path)

    def download_telegram_file(self, file_id: str, file_name: str) -> str:
        try:
            # Get file path from telegram
            res = requests.get(f"{self.base_url}/getFile?file_id={file_id}", timeout=15).json()
            if not res.get("ok"):
                return ""
            
            tg_file_path = res["result"]["file_path"]
            download_url = f"https://api.telegram.org/file/bot{self.bot_token}/{tg_file_path}"
            
            destination = UPLOADS_DIR / file_name
            with requests.get(download_url, stream=True, timeout=60) as r:
                r.raise_for_status()
                with open(destination, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
            return str(destination)
        except Exception as e:
            print(f"[!] Файл татахад алдаа: {e}")
            return ""

    def handle_message(self, message: dict):
        chat_id = str(message.get("chat", {}).get("id", ""))
        user_name = message.get("from", {}).get("first_name", "User")
        text = (message.get("text") or message.get("caption") or "").strip()

        # If admin_chat_id not set yet, automatically pair with first /start
        if not self.admin_chat_id:
            if text == "/start":
                self.admin_chat_id = chat_id
                save_config({"bot_token": self.bot_token, "admin_chat_id": self.admin_chat_id})
                self.send_message(
                    chat_id,
                    f"🎉 <b>Сайн байна уу, {user_name}!</b>\n"
                    f"Таны Telegram ID (<code>{chat_id}</code>) амжилттай <b>Админ удирдлагаар холбогдлоо</b>.\n\n"
                    f"Одоо та утсан дээрээсээ энэ компьютер дээр хулгана удирдах болон файл татаж оруулах боломжтой боллоо."
                )
                self.send_help(chat_id)
                return
            else:
                self.send_message(chat_id, "⚠️ Холбогдохын тулд <code>/start</code> гэж бичнэ үү.")
                return

        # Security Check: Ignore messages from unauthorized users
        if chat_id != self.admin_chat_id:
            print(f"[!] Unauthorized access attempt from chat_id: {chat_id}")
            self.send_message(chat_id, "⛔ <b>Хандах эрхгүй байна.</b> Зөвхөн эрх бүхий админ удирдах эрхтэй.")
            return

        # Handle Incoming Document/File
        if "document" in message:
            doc = message["document"]
            file_name = doc.get("file_name", f"file_{int(time.time())}.dat")
            file_id = doc.get("file_id")
            file_size_mb = round(doc.get("file_size", 0) / (1024 * 1024), 2)

            self.send_message(chat_id, f"⏳ <b>{file_name}</b> ({file_size_mb} MB) файлыг компьютер руу татаж байна...")
            saved_path = self.download_telegram_file(file_id, file_name)
            
            if saved_path:
                self.send_message(
                    chat_id,
                    f"✅ <b>Файл амжилттай хадгалагдлаа!</b>\n"
                    f"📁 Байршил: <code>{saved_path}</code>\n\n"
                    f"💡 Та одоо <code>/drag X1 Y1 X2 Y2</code> ашиглан уг файлыг хөтөч рүү чирч оруулж болно."
                )
            else:
                self.send_message(chat_id, "❌ Файл татахад алдаа гарлаа.")
            return

        # Handle Commands
        parts = text.split()
        cmd = parts[0].lower() if parts else ""

        if cmd in ["/start", "/help"]:
            self.send_help(chat_id)

        elif cmd in ["/screenshot", "/ss", "📸"]:
            self.take_and_send_screenshot(chat_id, "📸 Одоогийн дэлгэцийн байдал:")

        elif cmd == "/pos":
            x, y = pyautogui.position()
            self.send_message(
                chat_id,
                f"📍 <b>Хулганы байршил:</b> X: <code>{x}</code>, Y: <code>{y}</code>\n"
                f"🖥️ <b>Дэлгэцийн нягтрал:</b> <code>{self.screen_width}x{self.screen_height}</code>"
            )

        elif cmd in ["/click", "/c"]:
            if len(parts) >= 3:
                x, y = int(parts[1]), int(parts[2])
                pyautogui.click(x, y)
                time.sleep(0.3)
                self.take_and_send_screenshot(chat_id, f"✅ Товшилт хийгдлээ: ({x}, {y})")
            elif len(parts) == 1:
                pyautogui.click()
                self.take_and_send_screenshot(chat_id, "✅ Одоогийн байршилд дарлаа.")
            else:
                self.send_message(chat_id, "⚠️ Ашиглах: <code>/click X Y</code> (Жишээ: <code>/click 500 300</code>)")

        elif cmd in ["/doubleclick", "/dc"]:
            if len(parts) >= 3:
                x, y = int(parts[1]), int(parts[2])
                pyautogui.doubleClick(x, y)
                time.sleep(0.5)
                self.take_and_send_screenshot(chat_id, f"✅ Давхар товшилт: ({x}, {y})")
            else:
                pyautogui.doubleClick()
                self.take_and_send_screenshot(chat_id, "✅ Давхар дарлаа.")

        elif cmd in ["/rightclick", "/rc"]:
            if len(parts) >= 3:
                x, y = int(parts[1]), int(parts[2])
                pyautogui.rightClick(x, y)
            else:
                pyautogui.rightClick()
            time.sleep(0.3)
            self.take_and_send_screenshot(chat_id, "✅ Баруун товшилт (Context Menu)")

        elif cmd in ["/drag", "/d"]:
            if len(parts) >= 5:
                x1, y1, x2, y2 = int(parts[1]), int(parts[2]), int(parts[3]), int(parts[4])
                duration = float(parts[5]) if len(parts) > 5 else 1.2
                self.send_message(chat_id, f"🖱️ Чирч байна: ({x1},{y1}) ➡️ ({x2},{y2})...")
                pyautogui.moveTo(x1, y1)
                pyautogui.dragTo(x2, y2, duration=duration, button="left")
                time.sleep(0.5)
                self.take_and_send_screenshot(chat_id, f"✅ Чирч дууслаа: ({x1},{y1}) ➡️ ({x2},{y2})")
            else:
                self.send_message(chat_id, "⚠️ Ашиглах: <code>/drag X1 Y1 X2 Y2 [хугацаа]</code>\nЖишээ: <code>/drag 300 200 800 500</code>")

        elif cmd in ["/type", "/t"]:
            content = text[len(cmd):].strip()
            if content:
                pyautogui.write(content, interval=0.03)
                time.sleep(0.3)
                self.take_and_send_screenshot(chat_id, f"⌨️ Бичлээ: <code>{content}</code>")
            else:
                self.send_message(chat_id, "⚠️ Ашиглах: <code>/type бичих_текст</code>")

        elif cmd in ["/press", "/p"]:
            if len(parts) >= 2:
                key = parts[1].lower()
                pyautogui.press(key)
                time.sleep(0.3)
                self.take_and_send_screenshot(chat_id, f"⌨️ Товч дарагдлаа: <code>{key}</code>")
            else:
                self.send_message(chat_id, "⚠️ Ашиглах: <code>/press enter</code> (enter, tab, esc, backspace...)")

        elif cmd == "/hotkey":
            if len(parts) >= 2:
                keys = parts[1:]
                pyautogui.hotkey(*keys)
                time.sleep(0.3)
                self.take_and_send_screenshot(chat_id, f"⌨️ Товчлол: <code>{'+'.join(keys)}</code>")
            else:
                self.send_message(chat_id, "⚠️ Ашиглах: <code>/hotkey ctrl v</code> эсвэл <code>/hotkey alt f4</code>")

        elif cmd == "/open":
            target = text[len(cmd):].strip()
            if target:
                os.system(f'start "" "{target}"')
                time.sleep(2.0)
                self.take_and_send_screenshot(chat_id, f"🚀 Нээгдлээ: <code>{target}</code>")
            else:
                self.send_message(chat_id, "⚠️ Ашиглах: <code>/open https://drive.google.com</code>")

        elif cmd == "/open_uploads":
            os.system(f'explorer "{UPLOADS_DIR}"')
            time.sleep(1.0)
            self.take_and_send_screenshot(chat_id, f"📁 Хавтас нээгдлээ: <code>{UPLOADS_DIR}</code>")

        else:
            self.send_message(
                chat_id,
                f"❓ Үл мэдэгдэх тушаал: <code>{text}</code>\n"
                f"Тусламж харах: <code>/help</code> эсвэл зураг харах: <code>/screenshot</code>"
            )

    def take_and_send_screenshot(self, chat_id: str, caption: str):
        try:
            img_path = self.capture_screenshot_with_cursor()
            x, y = pyautogui.position()
            full_caption = f"{caption}\n📍 Хулгана: ({x}, {y}) | 🖥️ {self.screen_width}x{self.screen_height}"
            self.send_photo(chat_id, img_path, full_caption)
        except Exception as e:
            self.send_message(chat_id, f"❌ Дэлгэцийн зураг авахад алдаа: {e}")

    def send_help(self, chat_id: str):
        help_text = (
            "🤖 <b>SONIQ DESKTOP MOUSE & RPA УДИРДЛАГА</b>\n\n"
            "📸 <b>Дэлгэц харах:</b>\n"
            "• <code>/screenshot</code> эсвэл <code>/ss</code> — Дэлгэцийн одоогийн байдал ба хулганы байрлалыг зургаар харах\n"
            "• <code>/pos</code> — Хулганы одоогийн X, Y координатыг харах\n\n"
            "🖱️ <b>Хулгана удирдах:</b>\n"
            "• <code>/click X Y</code> — X, Y цэг дээр очиж 1 товших\n"
            "• <code>/doubleclick X Y</code> — Файл/хавтас нээх давхар товшилт\n"
            "• <code>/rightclick X Y</code> — Баруун цэс (Context menu) нээх\n"
            "• <code>/drag X1 Y1 X2 Y2</code> — <b>Файл чирч татах (Drag & Drop)</b>. Жишээ: <code>/drag 300 200 800 600</code>\n\n"
            "⌨️ <b>Гар & Товчлол:</b>\n"
            "• <code>/type текст</code> — Одоо идэвхтэй цонхонд бичих\n"
            "• <code>/press enter</code> — Enter, Tab, Esc г.м. товч дарах\n"
            "• <code>/hotkey ctrl v</code> — Хуулсан линк буулгах (Paste)\n\n"
            "📁 <b>Файл татах & Байршуулах:</b>\n"
            "• Чат руу дурын <b>Файл/Баримт илгээхэд</b> автоматаар Компьютерын <code>Desktop/Soniq_Uploads</code> хавтас руу татагдана.\n"
            "• <code>/open https://drive.google.com</code> — Google Drive шууд хөтөч дээр нээх\n"
            "• <code>/open_uploads</code> — Татсан файлуудын хавтсыг дэлгэц дээр нээх\n\n"
            "🛡️ <b>Failsafe хамгаалалт:</b>\n"
            "Хэрэв хулганы үйлдэл буруу болбол компьютер дээрээ хулганаа дэлгэцийн 4 буланд хүргэхэд тушаал тэр даруй цуцлагдана."
        )
        self.send_message(chat_id, help_text)

    def start_polling(self):
        print(f"\n=======================================================")
        print(f"  SONIQ DESKTOP RPA & TELEGRAM AGENT АЖИЛЛАЖ БАЙНА")
        print(f"=======================================================")
        print(f"[*] Дэлгэцийн нягтрал: {self.screen_width}x{self.screen_height}")
        print(f"[*] Хадгалах хавтас: {UPLOADS_DIR}")
        if self.admin_chat_id:
            print(f"[*] Холбогдсон Админ Chat ID: {self.admin_chat_id}")
        else:
            print(f"[*] Боттойгоо Telegram дээр /start гэж бичиж холбогдоно уу.")
        print(f"[*] Гарах бол Ctrl+C дарна уу.\n")

        while True:
            try:
                url = f"{self.base_url}/getUpdates?offset={self.last_update_id + 1}&timeout=30"
                resp = requests.get(url, timeout=40)
                if resp.status_code != 200:
                    time.sleep(3)
                    continue

                data = resp.json()
                if not data.get("ok"):
                    time.sleep(3)
                    continue

                for update in data.get("result", []):
                    self.last_update_id = update["update_id"]
                    if "message" in update:
                        self.handle_message(update["message"])

            except KeyboardInterrupt:
                print("\n[+] Desktop Agent амжилттай зогслоо.")
                break
            except Exception as e:
                print(f"[!] Polling алдаа (3 сек дараа дахин оролдоно): {e}")
                time.sleep(3)

def main():
    config = load_config()
    bot_token = config.get("bot_token") or os.environ.get("TELEGRAM_BOT_TOKEN", "")

    if not bot_token:
        print("\n" + "=" * 55)
        print("  TELEGRAM BOT ТОХИРГОО ШААРДЛАГАТАЙ")
        print("=" * 55)
        print("1. Telegram дээр @BotFather руу орж /newbot тушаалаар бот үүсгэнэ.")
        print("2. Гарч ирсэн 'API Token'-оо доор оруулна уу:\n")
        bot_token = input("Telegram Bot Token-оо оруулна уу: ").strip()
        if not bot_token:
            print("[!] Token оруулаагүй тул зогслоо.")
            sys.exit(1)
        config["bot_token"] = bot_token
        save_config(config)

    agent = TelegramDesktopAgent(bot_token, config.get("admin_chat_id", ""))
    agent.start_polling()

if __name__ == "__main__":
    main()
