import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifyBonumWebhookSignature,
  parseBonumWebhookPayload,
  getBonumCredentials,
} from '@/lib/bonum'
import { sendOrderApprovedEmail } from '@/lib/email-service'
import { sendTelegramOrderApprovedNotification, sendTelegramMessage } from '@/lib/telegram'

/**
 * GET handler: Allows browser checks, uptime monitors, and portal verification
 * Prevents HTTP 405 Method Not Allowed when opened in browser or checked by GET probes.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const siteUrl = url.origin

  // If a browser was redirected here after payment with orderId or txn:
  const orderId =
    url.searchParams.get('orderId') ||
    url.searchParams.get('order_id') ||
    url.searchParams.get('transactionId') ||
    url.searchParams.get('txn') ||
    url.searchParams.get('id')

  if (orderId) {
    const cleanId = orderId.includes('_') ? orderId.split('_')[0] : orderId
    return NextResponse.redirect(`${siteUrl}/order/${encodeURIComponent(cleanId)}?paid=1`)
  }

  return NextResponse.json({
    status: 'ONLINE',
    service: 'SONIQ Bonum Webhook Receiver',
    endpoint: `${siteUrl}/api/bonum/webhook`,
    methods: ['POST', 'GET', 'HEAD'],
    message: 'Bonum төлбөрийн webhook хүлээн авагч хэвийн ажиллаж байна. Bonum-оос ирэх POST мэдэгдлийг хүлээн авахад бэлэн.',
    timestamp: new Date().toISOString(),
  })
}

export async function HEAD() {
  return new Response(null, { status: 200 })
}

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
      const body = (event.body || {}) as any
      const transactionId =
        body?.transactionId ||
        body?.orderId ||
        body?.c_transaction_id ||
        body?.merchant_transaction_id
      const invoiceId = body?.invoiceId || body?.c_invoice_id

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
        if (!order && rawTxId) {
          const allOrders = await db.getOrders(true)
          order =
            allOrders.find(
              (o) =>
                o.id.toLowerCase() === rawTxId.toLowerCase() ||
                o.id.toLowerCase() === baseOrderId.toLowerCase() ||
                o.transferReference?.toLowerCase() === rawTxId.toLowerCase() ||
                o.transferReference?.toLowerCase() === baseOrderId.toLowerCase()
            ) || null
        }

        if (!order) {
          console.warn(`[Bonum Webhook] Order not found for tx: ${transactionId}, inv: ${invoiceId}`)
          return NextResponse.json({ status: 'ORDER_NOT_FOUND' }, { status: 200 })
        }

        // Idempotency: If already approved, do not double-process
        if (order.status === 'APPROVED') {
          return NextResponse.json({ status: 'ALREADY_APPROVED' }, { status: 200 })
        }

        // Fallback WeTransfer link from settings if missing
        const settings = await db.getSettings().catch(() => null)
        const resolvedDownloadLink =
          order.weTransferLink || settings?.defaultBundleWeTransfer || ''

        // Mark order as APPROVED
        const approvedOrder = await db.approveOrder(
          order.id,
          resolvedDownloadLink,
          `Bonum-ээр төлбөр баталгаажсан (Нэхэмжлэх: ${invoiceId || 'N/A'})`,
          order.r2Key
        )

        const finalOrder = approvedOrder || {
          ...order,
          weTransferLink: resolvedDownloadLink,
          status: 'APPROVED' as const,
          approvedAt: new Date().toISOString(),
        }

        // 1. Send customer immediate approval email with download links
        let emailSuccess = false
        try {
          const emailRes = await sendOrderApprovedEmail({
            order: finalOrder,
            siteUrl,
          })
          emailSuccess = Boolean(emailRes.success)
        } catch (err) {
          console.error('[Bonum Webhook] sendOrderApprovedEmail failed:', err)
        }

        // 2. Dispatch complete Telegram notification to admin
        try {
          await sendTelegramOrderApprovedNotification(finalOrder, emailSuccess, siteUrl)
        } catch (tgErr) {
          console.warn('[Bonum Webhook] Telegram alert error:', tgErr)
        }

        return NextResponse.json(
          { success: true, status: 'SUCCESS_APPROVED', orderId: order.id },
          { status: 200 }
        )
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

