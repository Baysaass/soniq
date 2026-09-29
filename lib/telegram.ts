import type { Order } from './orders-db'
import { db } from './db'

export interface TelegramSendResult {
  success: boolean
  messageId?: number
  error?: string
}

function escapeHtml(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Low-level Telegram sendMessage API caller
 */
export async function sendTelegramMessage(params: {
  botToken: string
  chatId: string
  text: string
  parseMode?: 'HTML' | 'Markdown'
}): Promise<TelegramSendResult> {
  const { botToken, chatId, text, parseMode = 'HTML' } = params

  if (!botToken || !botToken.trim()) {
    return { success: false, error: 'Telegram Bot Token тохируулаагүй байна.' }
  }
  if (!chatId || !chatId.trim()) {
    return { success: false, error: 'Telegram Chat ID тохируулаагүй байна.' }
  }

  const cleanToken = botToken.trim()
  const cleanChatId = chatId.trim()

  try {
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok || !data?.ok) {
      console.error('Telegram API error response:', data)
      const errorMsg = data?.description || `HTTP ${res.status}: Telegram мессеж илгээж чадсангүй.`
      return { success: false, error: errorMsg }
    }

    return { success: true, messageId: data.result?.message_id }
  } catch (err: any) {
    console.error('Telegram API fetch exception:', err)
    return { success: false, error: err?.message || 'Сүлжээний холболтын алдаа.' }
  }
}

/**
 * Format an order notification text in HTML for Telegram
 */
export function formatOrderNotificationText(order: Order, siteUrl: string = 'https://shop.soniq.click'): string {
  const itemsText = (order.items || [])
    .map((item) => `  • <b>${escapeHtml(item.title)}</b> (${item.price ? Number(item.price).toLocaleString() + '₮' : ''})`)
    .join('\n')

  const totalFormatted = order.currency === 'USD'
    ? `$${(order.totalAmountUSD || 0).toFixed(2)}`
    : `${(order.totalAmountMNT || 0).toLocaleString()}₮`

  const dateStr = new Date(order.createdAt || Date.now()).toLocaleString('mn-MN', {
    timeZone: 'Asia/Ulaanbaatar',
    hour12: false,
  })

  return `🔔 <b>ШИНЭ ЗАХИАЛГА ИРЛЭЭ!</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Захиалга:</b> <code>${escapeHtml(order.id)}</code>
📅 <b>Огноо:</b> ${escapeHtml(dateStr)}

👤 <b>Захиалагч:</b> ${escapeHtml(order.customerName)}
📞 <b>Утас:</b> <code>${escapeHtml(order.customerPhone || 'Утасгүй')}</code>
📧 <b>Gmail (Drive):</b> <code>${escapeHtml(order.customerEmail)}</code>

💰 <b>Төлсөн дүн:</b> <b>${totalFormatted}</b>
💳 <b>Төлбөр:</b> ${escapeHtml(order.paymentMethod || 'Хаан Банк')}
${order.receiptNote ? `📝 <b>Гүйлгээний утга:</b> <code>${escapeHtml(order.receiptNote)}</code>\n` : ''}
🛒 <b>Захиалсан бүтээгдэхүүн:</b>
${itemsText || '  • Дижитал багц'}
━━━━━━━━━━━━━━━━━━━━
👉 <a href="${siteUrl}/admin">Админ самбарт шалгаж Drive эрх нээх</a>`
}

/**
 * High-level order notification dispatcher
 * Automatically reads bot credentials from Environment or DB Settings
 */
export async function sendTelegramOrderNotification(order: Order): Promise<TelegramSendResult> {
  try {
    const settings = await db.getSettings().catch(() => null)

    const botToken =
      process.env.TELEGRAM_BOT_TOKEN ||
      settings?.bankInfo?.telegramBotToken ||
      settings?.telegramBotToken ||
      ''

    const chatId =
      process.env.TELEGRAM_CHAT_ID ||
      settings?.bankInfo?.telegramChatId ||
      settings?.telegramChatId ||
      ''

    if (!botToken.trim() || !chatId.trim()) {
      return { success: false, error: 'Telegram bot credentials not configured' }
    }

    const text = formatOrderNotificationText(order)
    return await sendTelegramMessage({
      botToken,
      chatId,
      text,
    })
  } catch (err: any) {
    console.error('Failed to dispatch Telegram order notification:', err)
    return { success: false, error: err?.message }
  }
}

/**
 * Send a verification test message
 */
export async function sendTelegramTestMessage(botToken: string, chatId: string): Promise<TelegramSendResult> {
  const text = `🤖 <b>SONIQ STORE — Telegram Бот амжилттай холбогдлоо!</b>
━━━━━━━━━━━━━━━━━━━━
Энэхүү тест мессеж нь таны Telegram тохиргоо зөв ажиллаж байгааг баталгаажуулж байна.

Цаашид хэрэглэгч вэбсайт дээр захиалга өгөх бүрд энэ чатад захиалагчийн мэдээлэл болон Gmail шуурхай мэдэгдэл болон ирэх болно! 🎉`

  return await sendTelegramMessage({
    botToken,
    chatId,
    text,
  })
}
