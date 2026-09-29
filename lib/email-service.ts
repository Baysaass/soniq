import fs from 'fs'
import path from 'path'
import type { Order } from './orders-db'
import { getStoreSettings } from './settings-db'
import { isR2Configured, generatePresignedDownloadUrl } from './r2-client'

export interface EmailSendResult {
  success: boolean
  provider: 'resend' | 'smtp' | 'simulated'
  messageId?: string
  recipient: string
  error?: string
  previewHtml?: string
}

export interface EmailLogEntry {
  id: string
  orderId: string
  recipient: string
  subject: string
  sentAt: string
  provider: 'resend' | 'smtp' | 'simulated'
  success: boolean
  error?: string
  html: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const EMAIL_LOGS_FILE = path.join(DATA_DIR, 'email-logs.json')

function saveEmailLog(entry: EmailLogEntry) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    let logs: EmailLogEntry[] = []
    if (fs.existsSync(EMAIL_LOGS_FILE)) {
      const content = fs.readFileSync(EMAIL_LOGS_FILE, 'utf-8').trim()
      if (content) logs = JSON.parse(content)
    }
    logs.unshift(entry)
    // Keep max 50 logs
    if (logs.length > 50) logs = logs.slice(0, 50)
    fs.writeFileSync(EMAIL_LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to write email log:', err)
  }
}

export function getEmailLogs(): EmailLogEntry[] {
  try {
    if (fs.existsSync(EMAIL_LOGS_FILE)) {
      const content = fs.readFileSync(EMAIL_LOGS_FILE, 'utf-8').trim()
      if (content) return JSON.parse(content)
    }
  } catch (err) {
    console.error('Failed to read email logs:', err)
  }
  return []
}

export function getEmailLogByOrderId(orderId: string): EmailLogEntry | null {
  const logs = getEmailLogs()
  return logs.find((l) => l.orderId.toLowerCase() === orderId.toLowerCase()) || null
}

/**
 * Builds responsive, sleek HTML email template for SONIQ STORE product delivery
 */
export function buildOrderDeliveryEmailHtml(params: {
  order: Order
  siteUrl: string
  directDownloadUrl?: string
  r2DownloadUrl?: string
  weTransferUrl?: string
}): string {
  const { order, siteUrl, directDownloadUrl, r2DownloadUrl, weTransferUrl } = params
  const primaryDownloadUrl =
    directDownloadUrl ||
    r2DownloadUrl ||
    weTransferUrl ||
    `${siteUrl}/order/${order.id}`

  const orderPageUrl = `${siteUrl}/order/${order.id}`

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #27272a;">
        <td style="padding: 12px 0; color: #f4f4f5; font-size: 14px; font-weight: 600;">
          ${escapeHtml(item.title)}
          <div style="font-size: 12px; color: #a1a1aa; font-weight: normal; margin-top: 2px;">
            ${item.quantity > 1 ? `Тоо хэмжээ: ${item.quantity} · ` : ''}Лиценз: 100% Commercial Royalty-Free
          </div>
        </td>
        <td style="padding: 12px 0; color: #f4f4f5; font-size: 14px; text-align: right; font-family: monospace; font-weight: bold;">
          ${order.currency === 'USD' ? `$${(item.priceUSD || 0).toFixed(2)}` : `${(item.price || 0).toLocaleString()}₮`}
        </td>
      </tr>
    `
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Таны захиалга баталгаажлаа — SONIQ STORE</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background: #18191b; border: 1px solid #27272a; margin-bottom: 16px;">
        <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.08em; color: #00B0FF; text-transform: uppercase;">
          ⚡ SONIQ DIGITAL STORE
        </span>
      </div>
      <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0; letter-spacing: -0.02em;">
        Таны захиалга баталгаажлаа! 🎉
      </h1>
      <p style="font-size: 14px; color: #a1a1aa; margin: 0; line-height: 1.5;">
        Сайн байна уу, <strong style="color: #ffffff;">${escapeHtml(order.customerName)}</strong>? Таны захиалсан дижитал багцууд бэлэн боллоо.
      </p>
    </div>

    <!-- Main Card -->
    <div style="background: #141517; border: 1px solid #27272a; border-radius: 16px; padding: 28px 24px; margin-bottom: 24px;">
      
      <!-- Order Code Banner -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid #27272a; margin-bottom: 20px;">
        <div>
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; font-weight: 700;">
            Захиалгын дугаар
          </span>
          <div style="font-size: 18px; font-weight: 800; color: #00B0FF; font-family: monospace; margin-top: 2px;">
            ${order.id}
          </div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; font-weight: 700;">
            Төлөв
          </span>
          <div style="font-size: 13px; font-weight: 700; color: #10b981; margin-top: 2px;">
            ✓ БАТАЛГААЖСАН
          </div>
        </div>
      </div>

      <!-- Hero Call To Action Button -->
      <div style="text-align: center; margin: 28px 0 24px 0;">
        <a href="${primaryDownloadUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #00B0FF 0%, #0088CC 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 800; padding: 16px 28px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 176, 255, 0.35); text-align: center; letter-spacing: 0.01em;">
          ${weTransferUrl && weTransferUrl.includes('drive.google.com') ? '📁 Google Drive-аар нээж татах' : '📥 Бүтээгдэхүүнийг шууд татах'}
        </a>
        <div style="font-size: 12px; color: #a1a1aa; margin-top: 10px; line-height: 1.5;">
          ${
            weTransferUrl && weTransferUrl.includes('drive.google.com')
              ? `Таны бүртгүүлсэн <strong style="color: #ffffff;">${escapeHtml(order.customerEmail)}</strong> Gmail хаягт хандах эрх нээгдсэн тул шууд татах эсвэл өөрийн Drive-даа хадгална уу.`
              : 'Татах холбоос дээр дарж дижитал файлуудаа бүрэн эхээр нь татаж авна уу.'
          }
        </div>
      </div>

      <!-- Multiple Download Options if present -->
      <div style="background: #18191b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: 700; color: #e4e4e7; margin-bottom: 12px;">
          Холбоосууд ба татах замууд:
        </div>
        
        ${
          r2DownloadUrl
            ? `
          <div style="margin-bottom: 10px;">
            <a href="${r2DownloadUrl}" target="_blank" rel="noopener noreferrer" style="color: #00B0FF; font-size: 13px; text-decoration: none; font-weight: 600;">
              ☁️ Cloudflare R2 Өндөр хурдны линкээр татах &rarr;
            </a>
          </div>
        `
            : ''
        }

        ${
          weTransferUrl
            ? `
          <div style="margin-bottom: 10px;">
            <a href="${weTransferUrl}" target="_blank" rel="noopener noreferrer" style="color: ${weTransferUrl.includes('drive.google.com') ? '#38bdf8' : '#a78bfa'}; font-size: 13px; text-decoration: none; font-weight: 600;">
              ${weTransferUrl.includes('drive.google.com') ? '📁 Google Drive шууд татах холбоос &rarr;' : '⚡ WeTransfer шууд татах холбоос &rarr;'}
            </a>
          </div>
        `
            : ''
        }

        <div>
          <a href="${orderPageUrl}" target="_blank" rel="noopener noreferrer" style="color: #d4d4d8; font-size: 13px; text-decoration: none; font-weight: 500;">
            📄 Захиалгын дэлгэрэнгүй баримт & Онлайн хуудас &rarr;
          </a>
        </div>
      </div>

      <!-- Order Items Summary Table -->
      <div style="margin-top: 20px;">
        <div style="font-size: 12px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
          Захиалсан багцууд
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 14px 0 0 0; color: #a1a1aa; font-size: 14px; font-weight: bold;">
                Нийт төлсөн дүн:
              </td>
              <td style="padding: 14px 0 0 0; color: #10b981; font-size: 16px; text-align: right; font-family: monospace; font-weight: 900;">
                ${order.currency === 'USD' ? `$${(order.totalAmountUSD || 0).toFixed(2)}` : `${(order.totalAmountMNT || 0).toLocaleString()}₮`}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>

    <!-- Instructions & Licensing Banner -->
    <div style="background: #141517; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-bottom: 24px; font-size: 13px; line-height: 1.6; color: #a1a1aa;">
      <div style="color: #ffffff; font-weight: 700; margin-bottom: 6px; font-size: 14px;">
        💡 Ашиглах заавар & Лиценз:
      </div>
      <ul style="margin: 0; padding-left: 20px; color: #a1a1aa;">
        <li style="margin-bottom: 4px;">Google Drive дээрээс файлыг шууд татах эсвэл <strong>"Add shortcut to Drive"</strong> сонголтоор өөрийн Drive-даа хадгалж болно.</li>
        <li style="margin-bottom: 4px;">Файлууд <strong>.ZIP</strong> форматаар ирэх бөгөөд татаж аваад задалж ашиглана уу.</li>
        <li style="margin-bottom: 4px;"><strong>100% Commercial Royalty-Free:</strong> Та өөрийн бүх захиалагч, видео реклам, кино, YouTube, сошиал медиа контентдоо зохиогчийн эрхийн асуудалгүй ашиглах эрхтэй.</li>
        <li>Файлыг өөрийн хард диск болон Cloud дээрээ хадгалж авахыг зөвлөж байна.</li>
      </ul>
    </div>

    <!-- Support & Footer -->
    <div style="text-align: center; color: #71717a; font-size: 12px; line-height: 1.6;">
      <p style="margin: 0 0 8px 0;">
        Хэрэв татаж авахад ямар нэгэн асуудал гарвал бидэнтэй холбогдоорой:
      </p>
      <p style="margin: 0 0 16px 0;">
        Instagram: <a href="https://www.instagram.com/_baysaa_notfound/" style="color: #00B0FF; text-decoration: none;">@_baysaa_notfound</a> · 
        Telegram: <a href="https://t.me/baysaa_vfx" style="color: #00B0FF; text-decoration: none;">@baysaa_vfx</a>
      </p>
      <p style="margin: 0; color: #52525b; font-size: 11px;">
        © 2026 SONIQ STORE (shop.soniq.click). Бүх эрх хуулиар хамгаалагдсан.
      </p>
    </div>

  </div>
</body>
</html>
`
}

function escapeHtml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Builds responsive HTML email template for initial Order Creation (Payment Instructions)
 */
export function buildOrderCreatedEmailHtml(params: {
  order: Order
  siteUrl: string
}): string {
  const { order, siteUrl } = params
  const orderPageUrl = `${siteUrl}/order/${order.id}`

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #27272a;">
        <td style="padding: 12px 0; color: #f4f4f5; font-size: 14px; font-weight: 600;">
          ${escapeHtml(item.title)}
          <div style="font-size: 12px; color: #a1a1aa; font-weight: normal; margin-top: 2px;">
            ${item.quantity > 1 ? `Тоо хэмжээ: ${item.quantity} · ` : ''}Лиценз: 100% Commercial Royalty-Free
          </div>
        </td>
        <td style="padding: 12px 0; color: #f4f4f5; font-size: 14px; text-align: right; font-family: monospace; font-weight: bold;">
          ${order.currency === 'USD' ? `$${(item.priceUSD || 0).toFixed(2)}` : `${(item.price || 0).toLocaleString()}₮`}
        </td>
      </tr>
    `
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Захиалга хүлээн авлаа — SONIQ STORE</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background: #18191b; border: 1px solid #27272a; margin-bottom: 16px;">
        <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.08em; color: #00B0FF; text-transform: uppercase;">
          ⚡ SONIQ DIGITAL STORE
        </span>
      </div>
      <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0; letter-spacing: -0.02em;">
        Захиалгыг хүлээн авлаа! 📥
      </h1>
      <p style="font-size: 14px; color: #a1a1aa; margin: 0; line-height: 1.5;">
        Сайн байна уу, <strong style="color: #ffffff;">${escapeHtml(order.customerName)}</strong>? Таны захиалгыг системд амжилттай бүртгэлээ.
      </p>
    </div>

    <!-- Main Card -->
    <div style="background: #141517; border: 1px solid #27272a; border-radius: 16px; padding: 28px 24px; margin-bottom: 24px;">
      
      <!-- Order Code Banner -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid #27272a; margin-bottom: 20px;">
        <div>
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; font-weight: 700;">
            Захиалгын дугаар
          </span>
          <div style="font-size: 18px; font-weight: 800; color: #00B0FF; font-family: monospace; margin-top: 2px;">
            ${order.id}
          </div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; font-weight: 700;">
            Төлөв
          </span>
          <div style="font-size: 13px; font-weight: 700; color: #f59e0b; margin-top: 2px;">
            ⏳ ТӨЛБӨР ШАЛГАГДАЖ БАЙНА
          </div>
        </div>
      </div>

      <!-- Bank Transfer Box -->
      <div style="background: #1c1d21; border: 1px solid #3f3f46; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: 800; color: #00B0FF; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
          🏦 Дансаар шилжүүлэх заавар:
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa;">Банк:</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: 700; text-align: right;">Хаан Банк (Khan Bank)</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa;">Дансны дугаар:</td>
            <td style="padding: 6px 0; color: #00B0FF; font-family: monospace; font-size: 15px; font-weight: 900; text-align: right;">5608120471</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa;">Хүлээн авагч:</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: 700; text-align: right;">Өсөхбаяр</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa;">Гүйлгээний утга:</td>
            <td style="padding: 6px 0; color: #f59e0b; font-family: monospace; font-size: 14px; font-weight: 900; text-align: right;">${order.transferReference || order.id}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa;">Нийт дүн:</td>
            <td style="padding: 6px 0; color: #10b981; font-family: monospace; font-size: 16px; font-weight: 900; text-align: right;">
              ${order.currency === 'USD' ? `$${(order.totalAmountUSD || 0).toFixed(2)}` : `${(order.totalAmountMNT || 0).toLocaleString()}₮`}
            </td>
          </tr>
        </table>
        
        <div style="font-size: 11px; color: #71717a; margin-top: 12px; border-top: 1px dashed #3f3f46; padding-top: 10px; line-height: 1.4;">
          ⚠️ Анхаар: Гүйлгээний утга дээр зөвхөн захиалгын код болох <strong style="color: #ffffff;">${order.transferReference || order.id}</strong> утгыг бичиж шилжүүлнэ үү.
        </div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 24px 0 20px 0;">
        <a href="${orderPageUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #00B0FF 0%, #0088CC 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 800; padding: 15px 24px; border-radius: 12px; text-align: center;">
          🔍 Захиалгын төлөв харах
        </a>
      </div>

      <!-- Order Items Summary Table -->
      <div style="margin-top: 20px;">
        <div style="font-size: 12px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
          Захиалсан багцууд
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

    </div>

    <!-- Instructions Banner -->
    <div style="background: #141517; border: 1px solid #27272a; border-radius: 12px; padding: 18px; margin-bottom: 24px; font-size: 13px; line-height: 1.6; color: #a1a1aa;">
      <div style="color: #ffffff; font-weight: 700; margin-bottom: 4px; font-size: 13px;">
        💡 Төлбөр төлсний дараа:
      </div>
      <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
        Манай админ таны Хаан банкны гүйлгээг шалгаж баталгаажуулмагц таны энэхүү <strong style="color: #ffffff;">${escapeHtml(order.customerEmail)}</strong> и-мэйл рүү <strong>Google Drive татах холбоос</strong> автоматаар очих болно. Мөн та дээрх товч дээр дарж захиалгынхаа хуудаснаас шууд татах боломжтой.
      </p>
    </div>

    <!-- Support & Footer -->
    <div style="text-align: center; color: #71717a; font-size: 12px; line-height: 1.6;">
      <p style="margin: 0 0 8px 0;">
        Холбоо барих:
        Instagram: <a href="https://www.instagram.com/_baysaa_notfound/" style="color: #00B0FF; text-decoration: none;">@_baysaa_notfound</a> · 
        Telegram: <a href="https://t.me/baysaa_vfx" style="color: #00B0FF; text-decoration: none;">@baysaa_vfx</a>
      </p>
      <p style="margin: 0; color: #52525b; font-size: 11px;">
        © 2026 SONIQ STORE (shop.soniq.click). Бүх эрх хуулиар хамгаалагдсан.
      </p>
    </div>

  </div>
</body>
</html>
`
}

/**
 * Resilient Resend delivery helper with automatic domain fallback
 */
async function sendViaResend(params: {
  apiKey: string
  to: string
  subject: string
  html: string
}): Promise<{ success: boolean; messageId?: string; error?: string; fromUsed?: string }> {
  const configuredFrom = process.env.EMAIL_FROM?.trim()
  // Candidates in priority order:
  // If user configured EMAIL_FROM, try it first, then fallback to onboarding@resend.dev if unverified domain error occurs
  const candidates: string[] = []
  if (configuredFrom) {
    candidates.push(configuredFrom)
  }
  if (!candidates.includes('SONIQ STORE <onboarding@resend.dev>')) {
    candidates.push('SONIQ STORE <onboarding@resend.dev>')
  }
  if (!candidates.includes('SONIQ STORE <order@soniq.click>')) {
    candidates.push('SONIQ STORE <order@soniq.click>')
  }

  let lastError = ''
  for (const fromAddress of candidates) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${params.apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [params.to.trim()],
          subject: params.subject,
          html: params.html,
        }),
      })

      const resData = await res.json()
      if (res.ok && resData.id) {
        return { success: true, messageId: resData.id, fromUsed: fromAddress }
      }

      lastError = resData?.message || resData?.error || `HTTP ${res.status}`
      console.warn(`Resend attempt failed with from="${fromAddress}":`, lastError)

      // If the error indicates domain is not verified, try next candidate (onboarding@resend.dev)
      const isDomainIssue =
        lastError.toLowerCase().includes('domain') ||
        lastError.toLowerCase().includes('not verified') ||
        lastError.toLowerCase().includes('verify')

      if (!isDomainIssue && candidates.indexOf(fromAddress) === 0 && !configuredFrom) {
        // If not domain issue and no custom config, continue trying
        continue
      }
    } catch (e: any) {
      lastError = e?.message || 'Network error'
    }
  }

  return { success: false, error: lastError }
}

/**
 * Dispatcher to send Order Created (Confirmation & Bank Instructions) Email immediately upon checkout
 */
export async function sendOrderCreatedEmail(params: {
  order: Order
  siteUrl?: string
}): Promise<EmailSendResult> {
  const { order } = params

  if (!order.customerEmail || !order.customerEmail.includes('@')) {
    return {
      success: false,
      provider: 'simulated',
      recipient: order.customerEmail || 'unknown',
      error: 'Хэрэглэгчийн и-мэйл хаяг тодорхойгүй байна.',
    }
  }

  const siteUrl =
    params.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://shop.soniq.click' : 'http://localhost:3000')

  const html = buildOrderCreatedEmailHtml({ order, siteUrl })
  const subject = `[SONIQ STORE] Захиалга хүлээн авлаа — Төлбөрийн заавар (#${order.id})`

  const resendApiKey = process.env.RESEND_API_KEY
  if (resendApiKey && resendApiKey.trim().length > 0) {
    const res = await sendViaResend({
      apiKey: resendApiKey,
      to: order.customerEmail,
      subject,
      html,
    })

    if (res.success && res.messageId) {
      saveEmailLog({
        id: res.messageId,
        orderId: order.id,
        recipient: order.customerEmail,
        subject,
        sentAt: new Date().toISOString(),
        provider: 'resend',
        success: true,
        html,
      })
      return {
        success: true,
        provider: 'resend',
        messageId: res.messageId,
        recipient: order.customerEmail,
        previewHtml: html,
      }
    } else {
      const errorMsg = res.error || 'Resend и-мэйл илгээхэд алдаа буцаалаа.'
      saveEmailLog({
        id: `err_${Date.now()}`,
        orderId: order.id,
        recipient: order.customerEmail,
        subject,
        sentAt: new Date().toISOString(),
        provider: 'resend-failed',
        success: false,
        error: errorMsg,
        html,
      })
      return {
        success: false,
        provider: 'resend-failed',
        error: errorMsg,
        recipient: order.customerEmail,
        previewHtml: html,
      }
    }
  }

  const mockId = `sim_${Date.now()}`
  return {
    success: false,
    provider: 'not-configured',
    error: 'RESEND_API_KEY тохируулагдаагүй байна.',
    messageId: mockId,
    recipient: order.customerEmail,
    previewHtml: html,
  }
}

/**
 * Main dispatcher to send Order Approved Email with download links
 */
export async function sendOrderApprovedEmail(params: {
  order: Order
  siteUrl?: string
  customWeTransferLink?: string
  customR2Key?: string
}): Promise<EmailSendResult> {
  const { order, customWeTransferLink, customR2Key } = params

  if (!order.customerEmail || !order.customerEmail.includes('@')) {
    return {
      success: false,
      provider: 'simulated',
      recipient: order.customerEmail || 'unknown',
      error: 'Хэрэглэгчийн и-мэйл хаяг тодорхойгүй байна.',
    }
  }

  // Determine site URL (defaults to production subdomain or localhost)
  const siteUrl =
    params.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://shop.soniq.click' : 'http://localhost:3000')

  // Resolve WeTransfer / Google Drive link
  const weTransferUrl =
    customWeTransferLink ||
    order.weTransferLink ||
    (order.items && order.items[0]?.weTransferLink) ||
    ''

  // Resolve R2 download URL if key exists
  const r2Key =
    customR2Key ||
    order.r2Key ||
    (order.items && order.items.find((i) => i.r2Key)?.r2Key) ||
    ''

  let r2DownloadUrl = ''
  if (r2Key && isR2Configured()) {
    try {
      const presigned = await generatePresignedDownloadUrl({
        key: r2Key,
        downloadFilename: `${order.items[0]?.title || 'soniq-pack'}.zip`,
        expiresInSeconds: 604800, // 7 days valid
      })
      r2DownloadUrl = presigned.downloadUrl
    } catch (err) {
      console.warn('Could not generate presigned R2 url for email:', err)
    }
  }

  // Direct download route on the site
  const directDownloadUrl = `${siteUrl}/api/orders/${order.id}/download`

  const html = buildOrderDeliveryEmailHtml({
    order,
    siteUrl,
    directDownloadUrl,
    r2DownloadUrl: r2DownloadUrl || undefined,
    weTransferUrl: weTransferUrl || undefined,
  })

  const subject = `[SONIQ STORE] Таны захиалга баталгаажлаа! — Татах холбоос (#${order.id})`

  // 1. Try Resend if RESEND_API_KEY is configured
  const resendApiKey = process.env.RESEND_API_KEY
  if (resendApiKey && resendApiKey.trim().length > 0) {
    const res = await sendViaResend({
      apiKey: resendApiKey,
      to: order.customerEmail,
      subject,
      html,
    })

    if (res.success && res.messageId) {
      saveEmailLog({
        id: res.messageId,
        orderId: order.id,
        recipient: order.customerEmail,
        subject,
        sentAt: new Date().toISOString(),
        provider: 'resend',
        success: true,
        html,
      })
      return {
        success: true,
        provider: 'resend',
        messageId: res.messageId,
        recipient: order.customerEmail,
        previewHtml: html,
      }
    } else {
      const errorMsg = res.error || 'Resend и-мэйл илгээхэд алдаа буцаалаа.'
      console.error('Resend API rejected email delivery:', errorMsg)
      saveEmailLog({
        id: `err_${Date.now()}`,
        orderId: order.id,
        recipient: order.customerEmail,
        subject,
        sentAt: new Date().toISOString(),
        provider: 'resend-failed',
        success: false,
        error: errorMsg,
        html,
      })
      return {
        success: false,
        provider: 'resend-failed',
        error: errorMsg,
        recipient: order.customerEmail,
        previewHtml: html,
      }
    }
  }

  // 2. Fallback when RESEND_API_KEY is not configured
  const mockId = `sim_${Date.now()}`
  saveEmailLog({
    id: mockId,
    orderId: order.id,
    recipient: order.customerEmail,
    subject,
    sentAt: new Date().toISOString(),
    provider: 'not-configured',
    success: false,
    error: 'RESEND_API_KEY тохируулагдаагүй байна.',
    html,
  })

  return {
    success: false,
    provider: 'not-configured',
    error: 'Vercel Settings -> Environment Variables дээр RESEND_API_KEY болон EMAIL_FROM тохируулагдаагүй байна.',
    messageId: mockId,
    recipient: order.customerEmail,
    previewHtml: html,
  }
}
