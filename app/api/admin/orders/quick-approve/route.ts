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

    // 1. If already approved, show approved info + option to revert
    if (order.status === 'APPROVED') {
      return new NextResponse(renderHtmlResponse({
        type: 'info',
        title: 'Өмнө нь баталгаажсан захиалга',
        message: `Энэхүү захиалга аль хэдийн баталгаажсан байна. Татах холбоос хэрэглэгчид идэвхтэй байна.`,
        order,
        token,
        settings,
        siteUrl,
      }), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // 2. If cancelled, show cancelled info
    if (order.status === 'CANCELLED') {
      return new NextResponse(renderHtmlResponse({
        type: 'error',
        title: 'Захиалга цуцлагдсан байна',
        message: `<code>${orderId}</code> захиалга өмнө нь цуцлагдсан байна.`,
        order,
        token,
        settings,
        siteUrl,
      }), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // 3. For PENDING orders: DO NOT APPROVE AUTOMATICALLY ON GET!
    // Show a secure confirmation screen to prevent crawlers / prefetch engines from auto-approving!
    return new NextResponse(renderHtmlResponse({
      type: 'confirm',
      title: 'Захиалга баталгаажуулах уу?',
      message: 'Хаан банкны дансандаа гүйлгээний дүнг шалгаад доорх товч дээр дарж баталгаажуулна уу.',
      order,
      token,
      settings,
      siteUrl,
    }), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err: any) {
    console.error('Quick approve GET route exception:', err)
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
  const siteUrl = new URL(request.url).origin
  let orderId = ''
  let token = ''
  let action = 'APPROVE'
  let isFormSubmit = false

  try {
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}))
      orderId = body.orderId || ''
      token = body.token || ''
      action = body.action || 'APPROVE'
    } else {
      isFormSubmit = true
      const formData = await request.formData()
      orderId = String(formData.get('orderId') || '')
      token = String(formData.get('token') || '')
      action = String(formData.get('action') || 'APPROVE')
    }

    if (!orderId || !token) {
      if (isFormSubmit) {
        return new NextResponse(renderHtmlResponse({
          type: 'error',
          title: 'Хүсэлт буруу байна',
          message: 'Захиалгын дугаар эсвэл токен дутуу байна.',
          siteUrl,
        }), { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      }
      return NextResponse.json({ success: false, error: 'Захиалгын дугаар эсвэл токен дутуу' }, { status: 400 })
    }

    const settings = await db.getSettings().catch(() => null)
    const secret =
      process.env.TELEGRAM_BOT_TOKEN ||
      settings?.bankInfo?.telegramBotToken ||
      settings?.telegramBotToken ||
      settings?.adminPasscode ||
      process.env.ADMIN_PASSCODE

    if (!verifyOrderApprovalToken(orderId, token, secret)) {
      if (isFormSubmit) {
        return new NextResponse(renderHtmlResponse({
          type: 'error',
          title: 'Хандах эрх хүчингүй байна',
          message: 'Хамгаалалтын токен буруу эсвэл хуучирсан байна.',
          siteUrl,
        }), { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      }
      return NextResponse.json({ success: false, error: 'Хүчингүй токен' }, { status: 403 })
    }

    if (action === 'REVERT_PENDING') {
      const updated = await db.revertOrderToPending(orderId, 'Админ quick-approve хуудаснаас PENDING болгов.')
      if (!updated) {
        if (isFormSubmit) {
          return new NextResponse(renderHtmlResponse({
            type: 'error',
            title: 'Захиалга олдсонгүй',
            message: `<code>${orderId}</code> захиалга олдсонгүй.`,
            siteUrl,
          }), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
        }
        return NextResponse.json({ success: false, error: 'Захиалга олдсонгүй' }, { status: 404 })
      }

      if (isFormSubmit) {
        return new NextResponse(renderHtmlResponse({
          type: 'info',
          title: 'Захиалга түгжигдлээ (PENDING)',
          message: 'Хэрэглэгчийн файл татах эрх амжилттай түгжигдлээ. Төлбөр дансанд орж ирснийг шалгасны дараа дахин баталгаажуулах боломжтой.',
          order: updated,
          token,
          settings,
          siteUrl,
        }), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      }

      return NextResponse.json({
        success: true,
        message: 'Захиалга PENDING төлөвт шилжлээ.',
        order: updated,
      })
    }

    // Default: APPROVE
    const updated = await db.approveOrder(orderId)
    if (!updated) {
      if (isFormSubmit) {
        return new NextResponse(renderHtmlResponse({
          type: 'error',
          title: 'Захиалга олдсонгүй',
          message: `<code>${orderId}</code> захиалга олдсонгүй.`,
          siteUrl,
        }), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      }
      return NextResponse.json({ success: false, error: 'Захиалга олдсонгүй' }, { status: 404 })
    }

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
    sendTelegramOrderApprovedNotification(updated, emailSuccess, siteUrl).catch(() => {})

    if (isFormSubmit) {
      return new NextResponse(renderHtmlResponse({
        type: 'success',
        title: 'Захиалга амжилттай баталгаажлаа!',
        message: 'Хэрэглэгчийн татах эрх нээгдэж, татах холбоос бүхий и-мэйл амжилттай илгээгдлээ.',
        order: updated,
        token,
        settings,
        emailSuccess,
        emailError: emailResult?.error,
        siteUrl,
      }), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Захиалга амжилттай баталгаажлаа.',
      order: updated,
      emailResult,
    })
  } catch (err: any) {
    console.error('Quick approve POST route exception:', err)
    if (isFormSubmit) {
      return new NextResponse(renderHtmlResponse({
        type: 'error',
        title: 'Серверийн алдаа гарлаа',
        message: err?.message || 'Үл мэдэгдэх алдаа гарлаа.',
        siteUrl,
      }), { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 })
  }
}

function renderHtmlResponse(params: {
  type: 'confirm' | 'success' | 'info' | 'error'
  title: string
  message: string
  order?: any
  token?: string
  settings?: any
  emailSuccess?: boolean
  emailError?: string
  siteUrl: string
}): string {
  const { type, title, message, order, token, settings, emailSuccess, emailError, siteUrl } = params

  const isConfirm = type === 'confirm'
  const isSuccess = type === 'success'
  const isInfo = type === 'info'

  const iconColor =
    type === 'success'
      ? '#22c55e'
      : type === 'confirm'
      ? '#eab308'
      : type === 'info'
      ? '#3b82f6'
      : '#ef4444'

  const iconSvg =
    type === 'success'
      ? `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
      : type === 'confirm'
      ? `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`
      : type === 'info'
      ? `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
      : `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`

  const totalFormatted = order
    ? order.currency === 'USD'
      ? `$${(order.totalAmountUSD || 0).toFixed(2)}`
      : `${(order.totalAmountMNT || 0).toLocaleString()}₮`
    : ''

  const bank = settings?.bankInfo || {}
  const bankAccountDisplay = `${bank.bankName || 'Хаан Банк'} ${bank.accountNumber || '5608120471'} (${bank.accountHolder || 'Өсөхбаяр'})`

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
      padding: 32px 24px;
      width: 100%;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px -10px ${iconColor}22;
    }
    .icon-wrap {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: ${iconColor}15;
      border: 1px solid ${iconColor}33;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    h1 {
      font-size: 21px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }
    p.desc {
      font-size: 13px;
      color: #9ca3af;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .info-box {
      background: #1b1c20;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 20px;
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
    .info-label { color: #9ca3af; font-weight: 500; font-size: 12px; }
    .info-val { color: #f3f4f6; font-weight: 600; text-align: right; font-size: 13px; }
    .badge-code {
      font-family: monospace;
      background: rgba(255, 255, 255, 0.08);
      padding: 2px 8px;
      border-radius: 6px;
      color: #fbbf24;
      font-size: 13px;
      font-weight: 700;
    }
    .badge-note {
      font-family: monospace;
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);
      padding: 2px 8px;
      border-radius: 6px;
      color: #60a5fa;
      font-size: 13px;
      font-weight: 700;
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
      padding: 14px 20px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.15s ease;
      cursor: pointer;
      border: none;
      width: 100%;
    }
    .btn-approve {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
    }
    .btn-approve:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: translateY(-1px);
    }
    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.25);
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
    .alert-banner {
      background: rgba(234, 179, 8, 0.1);
      border: 1px solid rgba(234, 179, 8, 0.25);
      border-radius: 12px;
      padding: 10px 14px;
      margin-bottom: 16px;
      font-size: 12px;
      color: #fde047;
      text-align: left;
      line-height: 1.45;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrap">${iconSvg}</div>
    <h1>${title}</h1>
    <p class="desc">${message}</p>

    ${isConfirm ? `
      <div class="alert-banner">
        ⚠️ <b>Анхаар:</b> Автомат ботууд төлөв өөрчлөхөөс сэргийлж, баталгаажуулах товчийг гараар дарах шаардлагатай болгов.
      </div>
    ` : ''}

    ${order ? `
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Захиалгын код</span>
          <span class="info-val"><span class="badge-code">${order.id}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Захиалагч</span>
          <span class="info-val">${order.customerName || 'Нэргүй'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Утасны дугаар</span>
          <span class="info-val">${order.customerPhone || 'Утасгүй'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Gmail / Хүргэх хаяг</span>
          <span class="info-val">${order.customerEmail || '—'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Төлбөрийн дүн</span>
          <span class="info-val" style="color: #fbbf24; font-size: 15px; font-weight: 800;">${totalFormatted}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Гүйлгээний утга</span>
          <span class="info-val"><span class="badge-note">${order.receiptNote || order.transferReference || order.id}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Хүлээн авах данс</span>
          <span class="info-val" style="font-size: 11px;">${bankAccountDisplay}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Бүтээгдэхүүн</span>
          <span class="info-val" style="max-width: 220px; font-size: 12px;">${(order.items || []).map((i: any) => i.title).join(', ') || 'Дижитал багц'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Одоогийн төлөв</span>
          <span class="info-val" style="color: ${order.status === 'APPROVED' ? '#22c55e' : order.status === 'PENDING' ? '#fbbf24' : '#ef4444'};">
            ${order.status === 'APPROVED' ? 'Баталгаажсан ✓' : order.status === 'PENDING' ? 'Хүлээгдэж буй (Шалгах)' : 'Цуцлагдсан'}
          </span>
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
      ${isConfirm && order && token ? `
        <form method="POST" action="${siteUrl}/api/admin/orders/quick-approve">
          <input type="hidden" name="orderId" value="${order.id}">
          <input type="hidden" name="token" value="${token}">
          <input type="hidden" name="action" value="APPROVE">
          <button type="submit" class="btn btn-approve">
            ✅ ДАНСАА ШАЛГАСАН · БАТАЛГААЖУУЛАХ
          </button>
        </form>
      ` : ''}

      ${order && order.status === 'APPROVED' && token ? `
        <form method="POST" action="${siteUrl}/api/admin/orders/quick-approve" onsubmit="return confirm('Энэ захиалгын татах эрхийг түр түгжиж, PENDING төлөвт буцаахдаа итгэлтэй байна уу?')">
          <input type="hidden" name="orderId" value="${order.id}">
          <input type="hidden" name="token" value="${token}">
          <input type="hidden" name="action" value="REVERT_PENDING">
          <button type="submit" class="btn btn-danger">
            🔒 Буцаан түгжих (Хүлээгдэж буй PENDING болгох)
          </button>
        </form>
      ` : ''}

      ${order && order.status === 'APPROVED' ? `
        <a href="${siteUrl}/order/${order.id}" class="btn btn-primary" target="_blank">
          👁 Хэрэглэгчийн захиалгын хуудас үзэх
        </a>
      ` : ''}

      <a href="${siteUrl}/admin" class="btn btn-secondary">
        ⚙️ Админ самбар руу очих
      </a>
    </div>
  </div>
</body>
</html>`
}
