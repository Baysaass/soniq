@echo off
title Soniq Telegram Desktop RPA Agent
color 0b

echo ========================================================
echo   SONIQ TELEGRAM DESKTOP MOUSE & FILE RPA AGENT
echo ========================================================
echo.

echo [*] Python сангуудыг шалгаж байна (requests, pillow, pyautogui)...
pip install -r requirements-desktop.txt

echo.
echo [*] Agent ажиллаж эхэлж байна...
python telegram_desktop_agent.py

pause
