import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifyBonumWebhookSignature,
  parseBonumWebhookPayload,
  getBonumCredentials,
} from '@/lib/bonum'
import { sendOrderApprovedEmail } from '@/lib/email-service'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(request: Request) {
  try {
    const checksumHeader =
      request.headers.get('x-checksum-v2') ||
      request.headers.get('x-checksum') ||
      ''

    // CRITICAL: Read the raw body as text for HMAC-SHA256 signature verification
    const rawBody = await request.text()

    if (!rawBody) {
      return NextResponse.json({ error: 'Хоосон хүсэлт' }, { status: 400 })
    }

    const creds = getBonumCredentials()
    const isValid = verifyBonumWebhookSignature(rawBody, checksumHeader)

    if (!isValid) {
      console.warn('[Bonum Webhook] Signature verification failed! Header:', checksumHeader)
      return NextResponse.json(
        { error: 'Хүчингүй гарын үсэг (Invalid checksum signature)' },
        { status: 401 }
      )
    }

    const event = parseBonumWebhookPayload(rawBody)
    console.log('[Bonum Webhook Event]:', event.type, event.status, event.body)

    const siteUrl = new URL(request.url).origin

    // -------------------------------------------------------------
    // 1. PAYMENT EVENT
    // -------------------------------------------------------------
    if (event.type === 'PAYMENT') {
      const body = event.body as any
      const transactionId = body?.transactionId || body?.orderId
      const invoiceId = body?.invoiceId

      if (event.status === 'SUCCESS') {
        if (!transactionId && !invoiceId) {
          console.warn('[Bonum Webhook] Missing transactionId and invoiceId')
          return NextResponse.json({ status: 'IGNORED_NO_ID' }, { status: 200 })
        }

        // Find the matching order by exact ID, or strip retry suffix (SQ-xxxxx_yyy), or match by bonumInvoiceId
        const rawTxId = (transactionId || '').toString().trim()
        const baseOrderId = rawTxId.includes('_') ? rawTxId.split('_')[0] : rawTxId

        let order = rawTxId ? await db.getOrderById(rawTxId) : null
        if (!order && baseOrderId) {
          order = await db.getOrderById(baseOrderId)
        }
        if (!order && invoiceId) {
          const allOrders = await db.getOrders(true)
          order = allOrders.find((o) => o.bonumInvoiceId === invoiceId) || null
        }

        if (!order) {
          console.warn(`[Bonum Webhook] Order not found for tx: ${transactionId}, inv: ${invoiceId}`)
          return NextResponse.json({ status: 'ORDER_NOT_FOUND' }, { status: 200 })
        }

        // Idempotency: If already approved, do not double-process
        if (order.status === 'APPROVED') {
          return NextResponse.json({ status: 'ALREADY_APPROVED' }, { status: 200 })
        }

        // Mark order as APPROVED
        const approvedOrder = await db.approveOrder(
          order.id,
          order.weTransferLink,
          `Bonum-ээр төлбөр баталгаажсан (Нэхэмжлэх: ${invoiceId || 'N/A'})`,
          order.r2Key
        )

        const finalOrder = approvedOrder || {
          ...order,
          status: 'APPROVED' as const,
          approvedAt: new Date().toISOString(),
        }

        // 1. Send customer immediate approval email with download links
        sendOrderApprovedEmail({
          order: finalOrder,
          siteUrl,
        }).catch((err) => {
          console.error('[Bonum Webhook] sendOrderApprovedEmail failed:', err)
        })

        // 2. Dispatch Telegram notification to admin
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

          if (botToken && chatId) {
            const amountFormatted = `${(finalOrder.totalAmountMNT || 0).toLocaleString()}₮`
            const tgMessage = `🎉 <b>BONUM — ТӨЛБӨР АМЖИЛТТАЙ!</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Захиалга:</b> <code>${finalOrder.id}</code>
💳 <b>Суваг:</b> Bonum (QPay / Карт)
💰 <b>Төлөгдсөн:</b> <b>${amountFormatted}</b>
👤 <b>Харилцагч:</b> ${finalOrder.customerName}
📧 <b>И-мэйл:</b> <code>${finalOrder.customerEmail}</code>
📞 <b>Утас:</b> <code>${finalOrder.customerPhone || 'N/A'}</code>
🧾 <b>Нэхэмжлэх ID:</b> <code>${invoiceId || 'N/A'}</code>

🚀 <i>Хэрэглэгчид татах холбоосыг и-мэйлээр автоматаар илгээлээ.</i>
━━━━━━━━━━━━━━━━━━━━
👉 <a href="${siteUrl}/order/${finalOrder.id}">Захиалгын хуудас үзэх</a>`

            sendTelegramMessage({
              botToken,
              chatId,
              text: tgMessage,
            }).catch((e) => console.warn('[Bonum Webhook] Telegram warning:', e))
          }
        } catch (tgErr) {
          console.warn('[Bonum Webhook] Telegram alert error:', tgErr)
        }

        return NextResponse.json({ status: 'SUCCESS_APPROVED', orderId: order.id }, { status: 200 })
      } else {
        console.warn(`[Bonum Webhook] Payment failed or cancelled for tx: ${transactionId}`)
        return NextResponse.json({ status: 'PAYMENT_FAILED' }, { status: 200 })
      }
    }

    // -------------------------------------------------------------
    // 2. CARD-TOKEN EVENT (Tokenization)
    // -------------------------------------------------------------
    if (event.type === 'CARD-TOKEN') {
      const body = event.body as any
      console.log(`[Bonum Webhook] Card tokenized successfully:`, body?.transactionId)
      return NextResponse.json({ status: 'CARD_TOKEN_PROCESSED' }, { status: 200 })
    }

    // -------------------------------------------------------------
    // 3. SUBSCRIPTION-PAYMENT EVENT
    // -------------------------------------------------------------
    if (event.type === 'SUBSCRIPTION-PAYMENT') {
      const body = event.body as any
      console.log(`[Bonum Webhook] Subscription charge processed:`, body)
      return NextResponse.json({ status: 'SUBSCRIPTION_PROCESSED' }, { status: 200 })
    }

    return NextResponse.json({ status: 'EVENT_ACKNOWLEDGED' }, { status: 200 })
  } catch (error: any) {
    console.error('[Bonum Webhook Fatal Error]:', error)
    return NextResponse.json(
      { error: error?.message || 'Серверийн алдаа' },
      { status: 500 }
    )
  }
}

