import crypto from 'crypto'
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
 * Generate a secure signature/token for 1-click order approval
 */
export function generateOrderApprovalToken(orderId: string, secret?: string): string {
  const hmacKey =
    secret || process.env.ADMIN_PASSCODE || process.env.TELEGRAM_BOT_TOKEN || 'soniq-approval-secret-salt-2026'
  return crypto.createHmac('sha256', hmacKey).update(orderId).digest('hex').substring(0, 32)
}

/**
 * Verify a 1-click order approval token
 */
export function verifyOrderApprovalToken(orderId: string, token: string, secret?: string): boolean {
  if (!token || !orderId) return false
  try {
    const expected = generateOrderApprovalToken(orderId, secret)
    const tokenBuf = Buffer.from(token)
    const expBuf = Buffer.from(expected)
    if (tokenBuf.length !== expBuf.length) return false
    return crypto.timingSafeEqual(tokenBuf, expBuf)
  } catch {
    return false
  }
}

/**
 * Low-level Telegram sendMessage API caller
 */
export async function sendTelegramMessage(params: {
  botToken: string
  chatId: string | number
  text: string
  parseMode?: 'HTML' | 'Markdown'
  replyMarkup?: any
}): Promise<TelegramSendResult> {
  const { botToken, chatId, text, parseMode = 'HTML', replyMarkup } = params

  if (!botToken || !String(botToken).trim()) {
    return { success: false, error: 'Telegram Bot Token тохируулаагүй байна.' }
  }
  if (!chatId || !String(chatId).trim()) {
    return { success: false, error: 'Telegram Chat ID тохируулаагүй байна.' }
  }

  const cleanToken = String(botToken).trim()
  const cleanChatId = String(chatId).trim()

  try {
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`
    const bodyPayload: any = {
      chat_id: cleanChatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    }

    if (replyMarkup) {
      bodyPayload.reply_markup = replyMarkup
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
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
 * Low-level Telegram answerCallbackQuery API caller
 */
export async function answerTelegramCallbackQuery(params: {
  botToken: string
  callbackQueryId: string
  text?: string
  showAlert?: boolean
}) {
  try {
    const url = `https://api.telegram.org/bot${params.botToken.trim()}/answerCallbackQuery`
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: params.callbackQueryId,
        text: params.text || '',
        show_alert: Boolean(params.showAlert),
      }),
    })
  } catch (err) {
    console.error('answerTelegramCallbackQuery error:', err)
  }
}

/**
 * Low-level Telegram editMessageText API caller
 */
export async function editTelegramMessageText(params: {
  botToken: string
  chatId: string | number
  messageId: number
  text: string
  parseMode?: 'HTML' | 'Markdown'
  replyMarkup?: any
}) {
  try {
    const url = `https://api.telegram.org/bot${params.botToken.trim()}/editMessageText`
    const bodyPayload: any = {
      chat_id: params.chatId,
      message_id: params.messageId,
      text: params.text,
      parse_mode: params.parseMode || 'HTML',
      disable_web_page_preview: true,
    }
    if (params.replyMarkup) {
      bodyPayload.reply_markup = params.replyMarkup
    }
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    })
  } catch (err) {
    console.error('editTelegramMessageText error:', err)
  }
}

/**
 * Format an order notification text in HTML for Telegram
 */
export function formatOrderNotificationText(order: Order, siteUrl: string = 'https://shop.soniq.click'): string {
  const isFree =
    (Number(order.totalAmountMNT || 0) === 0 && Number(order.totalAmountUSD || 0) === 0) ||
    order.paymentMethod === 'FREE_DOWNLOAD'

  const itemsText = (order.items || [])
    .map((item) => `  • <b>${escapeHtml(item.title)}</b> (${isFree ? 'ҮНЭГҮЙ' : item.price ? Number(item.price).toLocaleString() + '₮' : ''})`)
    .join('\n')

  const totalFormatted = isFree
    ? '🎁 ҮНЭГҮЙ (0₮)'
    : order.currency === 'USD'
    ? `$${(order.totalAmountUSD || 0).toFixed(2)}`
    : `${(order.totalAmountMNT || 0).toLocaleString()}₮`

  const dateStr = new Date(order.createdAt || Date.now()).toLocaleString('mn-MN', {
    timeZone: 'Asia/Ulaanbaatar',
    hour12: false,
  })

  if (isFree) {
    return `🎁 <b>ҮНЭГҮЙ БҮТЭЭГДЭХҮҮН ТАТАЖ АВЛАА!</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Захиалга:</b> <code>${escapeHtml(order.id)}</code>
📅 <b>Огноо:</b> ${escapeHtml(dateStr)}

👤 <b>Хэрэглэгч:</b> ${escapeHtml(order.customerName || 'Зочин')}
📧 <b>Gmail / И-мэйл:</b> <code>${escapeHtml(order.customerEmail)}</code>
${order.customerPhone && order.customerPhone !== 'Үнэгүй таталт' ? `📞 <b>Утас:</b> <code>${escapeHtml(order.customerPhone)}</code>\n` : ''}
💰 <b>Төлбөр:</b> <b>ҮНЭГҮЙ (0₮)</b>
📥 <b>Татах суваг:</b> ${order.r2Key && order.weTransferLink ? 'Cloudflare R2 + Google Drive' : order.r2Key ? '☁️ Cloudflare R2' : '📁 Google Drive / Линк'}
🔓 <b>Татах эрх:</b> Шууд баталгаажсан (Идэвхтэй ✓)
🛒 <b>Татаж авсан бүтээгдэхүүн:</b>
${itemsText || '  • Үнэгүй багц'}
━━━━━━━━━━━━━━━━━━━━
👉 Доорх товчоор захиалгын хуудсыг харна уу:`
  }

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
👉 Доорх товчоор шууд баталгаажуулна уу:`
}

/**
 * Format an order confirmation / approval notification text in HTML for Telegram
 */
export function formatOrderApprovedNotificationText(
  order: Order,
  emailSent?: boolean,
  siteUrl: string = 'https://shop.soniq.click'
): string {
  const itemsText = (order.items || [])
    .map((item) => `  • <b>${escapeHtml(item.title)}</b>`)
    .join('\n')

  const totalFormatted =
    order.currency === 'USD'
      ? `$${(order.totalAmountUSD || 0).toFixed(2)}`
      : `${(order.totalAmountMNT || 0).toLocaleString()}₮`

  const dateStr = new Date(order.approvedAt || Date.now()).toLocaleString('mn-MN', {
    timeZone: 'Asia/Ulaanbaatar',
    hour12: false,
  })

  const emailStatusText =
    emailSent === undefined
      ? 'Илгээгдсэн'
      : emailSent
      ? 'Амжилттай хүргэгдсэн ✓'
      : '⚠️ И-мэйл илгээгдсэнгүй (Resend шалгах)'

  return `✅ <b>ЗАХИАЛГА БАТАЛГААЖЛАА!</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Захиалга:</b> <code>${escapeHtml(order.id)}</code>
📅 <b>Баталгаажсан:</b> ${escapeHtml(dateStr)}

👤 <b>Захиалагч:</b> ${escapeHtml(order.customerName)}
📞 <b>Утас:</b> <code>${escapeHtml(order.customerPhone || 'Утасгүй')}</code>
📧 <b>Gmail (Drive):</b> <code>${escapeHtml(order.customerEmail)}</code>
💰 <b>Төлбөр:</b> <b>${totalFormatted}</b> (${escapeHtml(order.paymentMethod || 'Хаан Банк')})
📥 <b>Татах суваг:</b> ${order.r2Key && order.weTransferLink ? 'Cloudflare R2 + Google Drive' : order.r2Key ? '☁️ Cloudflare R2' : '📁 Google Drive / Линк'}

🚀 <b>И-мэйл хүргэлт:</b> ${emailStatusText}
🔓 <b>Татах эрх:</b> Нээгдсэн (Идэвхтэй ✓)
🛒 <b>Бүтээгдэхүүн:</b>
${itemsText || '  • Дижитал багц'}
━━━━━━━━━━━━━━━━━━━━
👉 <a href="${siteUrl}/order/${escapeHtml(order.id)}">Хэрэглэгчийн татах хуудсыг нээх</a>`
}

/**
 * High-level order notification dispatcher with 1-Click Approve buttons
 * Automatically reads bot credentials from Environment or DB Settings
 */
export async function sendTelegramOrderNotification(
  order: Order,
  customSiteUrl?: string
): Promise<TelegramSendResult> {
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

    const siteUrl =
      customSiteUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.SITE_URL ||
      'https://shop.soniq.click'

    const secret = botToken || settings?.adminPasscode || process.env.ADMIN_PASSCODE
    const approvalToken = generateOrderApprovalToken(order.id, secret)
    const text = formatOrderNotificationText(order, siteUrl)

    const isFree =
      (Number(order.totalAmountMNT || 0) === 0 && Number(order.totalAmountUSD || 0) === 0) ||
      order.paymentMethod === 'FREE_DOWNLOAD'

    const replyMarkup = isFree
      ? {
          inline_keyboard: [
            [
              {
                text: '👁 Хэрэглэгчийн татах хуудас',
                url: `${siteUrl}/order/${encodeURIComponent(order.id)}`,
              },
              {
                text: '⚙️ Админ самбар',
                url: `${siteUrl}/admin`,
              },
            ],
          ],
        }
      : {
          inline_keyboard: [
            [
              {
                text: '⚡ Шууд баталгаажуулах (1-Click Approve)',
                url: `${siteUrl}/api/admin/orders/quick-approve?orderId=${encodeURIComponent(order.id)}&token=${approvalToken}`,
              },
            ],
            [
              {
                text: '👤 Захиалга харах',
                url: `${siteUrl}/order/${encodeURIComponent(order.id)}`,
              },
              {
                text: '⚙️ Админ самбар',
                url: `${siteUrl}/admin`,
              },
            ],
          ],
        }

    return await sendTelegramMessage({
      botToken,
      chatId,
      text,
      replyMarkup,
    })
  } catch (err: any) {
    console.error('Failed to dispatch Telegram order notification:', err)
    return { success: false, error: err?.message }
  }
}

/**
 * Dispatch confirmation notification to Telegram when an order is approved
 */
export async function sendTelegramOrderApprovedNotification(
  order: Order,
  emailSent?: boolean,
  customSiteUrl?: string
): Promise<TelegramSendResult> {
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

    const siteUrl =
      customSiteUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.SITE_URL ||
      'https://shop.soniq.click'

    const text = formatOrderApprovedNotificationText(order, emailSent, siteUrl)

    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: '👁 Хэрэглэгчийн татах хуудас',
            url: `${siteUrl}/order/${encodeURIComponent(order.id)}`,
          },
          {
            text: '⚙️ Админ самбар',
            url: `${siteUrl}/admin`,
          },
        ],
      ],
    }

    return await sendTelegramMessage({
      botToken,
      chatId,
      text,
      replyMarkup,
    })
  } catch (err: any) {
    console.error('Failed to dispatch Telegram order approved notification:', err)
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

Цаашид хэрэглэгч вэбсайт дээр захиалга өгөх бүрд энэ чатад захиалагчийн мэдээлэл болон шууд баталгаажуулах <b>[⚡ Шууд баталгаажуулах]</b> товч бүхий мэдэгдэл ирэх болно! 🎉`

  return await sendTelegramMessage({
    botToken,
    chatId,
    text,
  })
}
