import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendOrderApprovedEmail } from '@/lib/email-service'
import {
  verifyOrderApprovalToken,
  sendTelegramOrderApprovedNotification,
} from '@/lib/telegram'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId') || ''
  const token = searchParams.get('token') || ''
  const siteUrl = new URL(request.url).origin

  if (!orderId || !token) {
    return new NextResponse(renderHtmlResponse({
      type: 'error',
      title: 'Хүсэлт буруу байна',
      message: 'Захиалгын дугаар эсвэл хамгаалалтын токен дутуу байна.',
      siteUrl,
    }), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  try {
    const settings = await db.getSettings().catch(() => null)
    const secret =
      process.env.TELEGRAM_BOT_TOKEN ||
      settings?.bankInfo?.telegramBotToken ||
      settings?.telegramBotToken ||
      settings?.adminPasscode ||
      process.env.ADMIN_PASSCODE

    const isValid = verifyOrderApprovalToken(orderId, token, secret)
    if (!isValid) {
      return new NextResponse(renderHtmlResponse({
        type: 'error',
        title: 'Хандах эрх хүчингүй байна',
        message: 'Аюулгүй байдлын шалгалт амжилтгүй боллоо. Токен буруу эсвэл хуучирсан байна.',
        siteUrl,
      }), {
        status: 403,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const order = await db.getOrderById(orderId)
    if (!order) {
      return new NextResponse(renderHtmlResponse({
        type: 'error',
        title: 'Захиалга олдсонгүй',
        message: `<code>${orderId}</code> дугаартай захиалга системд бүртгэгдээгүй байна.`,
        siteUrl,
      }), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // If already approved
    if (order.status === 'APPROVED') {
      return new NextResponse(renderHtmlResponse({
        type: 'info',
        title: 'Өмнө нь баталгаажсан захиалга',
        message: `Энэхүү захиалга аль хэдийн баталгаажсан байна. Татах холбоос хэрэглэгчид идэвхтэй байна.`,
        order,
        siteUrl,
      }), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // Approve the order in DB
    const updated = await db.approveOrder(orderId)
    if (!updated) {
      return new NextResponse(renderHtmlResponse({
        type: 'error',
        title: 'Баталгаажуулахад алдаа гарлаа',
        message: 'Өгөгдлийн санд шинэчлэхэд алдаа гарлаа. Дахин оролдоно уу.',
        siteUrl,
      }), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // Send customer approved email
    let emailResult = null
    try {
      emailResult = await sendOrderApprovedEmail({
        order: updated,
        siteUrl,
      })
    } catch (mailErr) {
      console.error('Quick approve email dispatch error:', mailErr)
    }

    const emailSuccess = Boolean(emailResult?.success)

    // Notify Telegram about successful approval
    sendTelegramOrderApprovedNotification(updated, emailSuccess, siteUrl).catch((tgErr) => {
      console.warn('Quick approve Telegram alert warning:', tgErr)
    })

    return new NextResponse(renderHtmlResponse({
      type: 'success',
      title: 'Захиалга амжилттай баталгаажлаа!',
      message: 'Хэрэглэгчийн татах эрх нээгдэж, татах холбоос бүхий и-мэйл амжилттай илгээгдлээ.',
      order: updated,
      emailSuccess,
      emailError: emailResult?.error,
      siteUrl,
    }), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err: any) {
    console.error('Quick approve route exception:', err)
    return new NextResponse(renderHtmlResponse({
      type: 'error',
      title: 'Серверийн алдаа гарлаа',
      message: err?.message || 'Үл мэдэгдэх алдаа гарлаа.',
      siteUrl,
    }), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, token } = body
    const siteUrl = new URL(request.url).origin

    const settings = await db.getSettings().catch(() => null)
    const secret =
      process.env.TELEGRAM_BOT_TOKEN ||
      settings?.bankInfo?.telegramBotToken ||
      settings?.telegramBotToken ||
      settings?.adminPasscode ||
      process.env.ADMIN_PASSCODE

    if (!verifyOrderApprovalToken(orderId, token, secret)) {
      return NextResponse.json({ success: false, error: 'Хүчингүй токен' }, { status: 403 })
    }

    const updated = await db.approveOrder(orderId)
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Захиалга олдсонгүй' }, { status: 404 })
    }

    let emailResult = null
    try {
      emailResult = await sendOrderApprovedEmail({
        order: updated,
        siteUrl,
      })
    } catch {}

    const emailSuccess = Boolean(emailResult?.success)
    sendTelegramOrderApprovedNotification(updated, emailSuccess, siteUrl).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Захиалга амжилттай баталгаажлаа.',
      order: updated,
      emailResult,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}

function renderHtmlResponse(params: {
  type: 'success' | 'info' | 'error'
  title: string
  message: string
  order?: any
  emailSuccess?: boolean
  emailError?: string
  siteUrl: string
}): string {
  const { type, title, message, order, emailSuccess, emailError, siteUrl } = params

  const isSuccess = type === 'success' || type === 'info'
  const iconColor = type === 'success' ? '#22c55e' : type === 'info' ? '#3b82f6' : '#ef4444'
  const iconSvg =
    type === 'success'
      ? `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
      : type === 'info'
      ? `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
      : `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`

  const totalFormatted = order
    ? order.currency === 'USD'
      ? `$${(order.totalAmountUSD || 0).toFixed(2)}`
      : `${(order.totalAmountMNT || 0).toLocaleString()}₮`
    : ''

  return `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — SONIQ STORE</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0c0d0e;
      color: #f3f4f6;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: #141518;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 36px 28px;
      width: 100%;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px -10px ${iconColor}22;
    }
    .icon-wrap {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: ${iconColor}15;
      border: 1px solid ${iconColor}33;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 10px;
      letter-spacing: -0.02em;
    }
    p.desc {
      font-size: 14px;
      color: #9ca3af;
      line-height: 1.55;
      margin-bottom: 24px;
    }
    .info-box {
      background: #1b1c20;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 24px;
      text-align: left;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 13px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6b7280; font-weight: 500; }
    .info-val { color: #f3f4f6; font-weight: 600; text-align: right; }
    .badge-code {
      font-family: monospace;
      background: rgba(255, 255, 255, 0.08);
      padding: 2px 8px;
      border-radius: 6px;
      color: #fbbf24;
      font-size: 13px;
    }
    .email-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: ${emailSuccess ? '#22c55e' : '#f97316'};
      font-weight: 600;
    }
    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 13px 20px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .btn-primary {
      background: #fbbf24;
      color: #000000;
    }
    .btn-primary:hover {
      background: #f59e0b;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      color: #d1d5db;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.09);
      color: #ffffff;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrap">${iconSvg}</div>
    <h1>${title}</h1>
    <p class="desc">${message}</p>

    ${order ? `
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Захиалга</span>
          <span class="info-val"><span class="badge-code">${order.id}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Захиалагч</span>
          <span class="info-val">${order.customerName || 'Нэргүй'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Gmail / И-мэйл</span>
          <span class="info-val">${order.customerEmail || '—'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Төлбөрийн дүн</span>
          <span class="info-val" style="color: #fbbf24; font-size: 15px;">${totalFormatted}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Татах эрх</span>
          <span class="info-val" style="color: #22c55e;">Нээгдсэн ✓</span>
        </div>
        ${emailSuccess !== undefined ? `
          <div class="info-row">
            <span class="info-label">И-мэйл хүргэлт</span>
            <span class="info-val email-badge">
              ${emailSuccess ? '✓ Амжилттай илгээгдсэн' : (emailError || 'Илгээгдсэнгүй')}
            </span>
          </div>
        ` : ''}
      </div>
    ` : ''}

    <div class="btn-group">
      ${order ? `
        <a href="${siteUrl}/order/${order.id}" class="btn btn-primary" target="_blank">
          👁 Хэрэглэгчийн захиалгын хуудас үзэх
        </a>
      ` : ''}
      <a href="${siteUrl}/admin" class="btn btn-secondary">
        ⚙️ Админ самбар руу орох
      </a>
    </div>
  </div>
</body>
</html>`
}
