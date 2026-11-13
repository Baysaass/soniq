import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  getBonumGatewayClient,
  verifyBonumWebhookSignature,
  parseBonumWebhookPayload,
} from '@/lib/bonum'
import { sendOrderApprovedEmail } from '@/lib/email-service'
import { sendTelegramOrderApprovedNotification } from '@/lib/telegram'

/**
 * Bonum Browser Callback & Return Handler
 * When payment finishes on Bonum portal, the payer's browser is redirected here via GET.
 * This route automatically checks payment status, approves order, and redirects the payer to /order/{id}?paid=1.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const siteUrl = url.origin

  const orderId =
    url.searchParams.get('orderId') ||
    url.searchParams.get('order_id') ||
    url.searchParams.get('transactionId') ||
    url.searchParams.get('txn') ||
    url.searchParams.get('id') ||
    ''

  const invoiceId = url.searchParams.get('invoiceId') || ''

  if (!orderId && !invoiceId) {
    return NextResponse.redirect(`${siteUrl}/shop`)
  }

  // Find order
  let order = orderId ? await db.getOrderById(orderId) : null
  if (!order && orderId && orderId.includes('_')) {
    order = await db.getOrderById(orderId.split('_')[0])
  }
  if (!order && invoiceId) {
    const allOrders = await db.getOrders(true)
    order = allOrders.find((o) => o.bonumInvoiceId === invoiceId) || null
  }

  if (!order) {
    return NextResponse.redirect(`${siteUrl}/shop`)
  }

  // If already approved, redirect straight to order page
  if (order.status === 'APPROVED') {
    return NextResponse.redirect(`${siteUrl}/order/${order.id}?paid=1`)
  }

  // Active check against Bonum API
  const invId = order.bonumInvoiceId || invoiceId
  if (invId) {
    try {
      const client = getBonumGatewayClient()
      const invoiceData: any = await client.getInvoice(invId)
      if (
        invoiceData &&
        (invoiceData.status === 'SUCCESS' ||
          invoiceData.status === 'PAID' ||
          invoiceData.status === 'APPROVED' ||
          (invoiceData.paymentVendor &&
            invoiceData.status !== 'FAILED' &&
            invoiceData.status !== 'CANCELLED'))
      ) {
        const settings = await db.getSettings().catch(() => null)
        const fallbackLink = order.weTransferLink || settings?.defaultBundleWeTransfer || ''

        const approved = await db.approveOrder(
          order.id,
          fallbackLink,
          `Bonum-ээр шууд баталгаажсан (Нэхэмжлэх: ${invId})`,
          order.r2Key
        )

        if (approved) {
          order = approved
          sendOrderApprovedEmail({ order, siteUrl }).catch(console.warn)
          sendTelegramOrderApprovedNotification(order, true, siteUrl).catch(console.warn)
        }
      }
    } catch (err: any) {
      console.warn('[Bonum Callback] getInvoice check warning:', err?.message)
    }
  }

  return NextResponse.redirect(`${siteUrl}/order/${order.id}?paid=1`)
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const siteUrl = url.origin

  const checksumHeader =
    request.headers.get('x-checksum-v2') ||
    request.headers.get('x-checksum') ||
    ''

  const rawBody = await request.text()
  if (!rawBody) {
    return NextResponse.json({ error: 'Хоосон хүсэлт' }, { status: 400 })
  }

  const isValid = verifyBonumWebhookSignature(rawBody, checksumHeader)
  if (!isValid) {
    return NextResponse.json({ error: 'Хүчингүй гарын үсэг' }, { status: 401 })
  }

  const event = parseBonumWebhookPayload(rawBody)
  if (event.type === 'PAYMENT' && event.status === 'SUCCESS') {
    const body = (event.body || {}) as any
    const transactionId = body?.transactionId || body?.orderId
    const invoiceId = body?.invoiceId

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

    if (order && order.status !== 'APPROVED') {
      const settings = await db.getSettings().catch(() => null)
      const fallbackLink = order.weTransferLink || settings?.defaultBundleWeTransfer || ''

      const approved = await db.approveOrder(
        order.id,
        fallbackLink,
        `Bonum-ээр баталгаажсан (Нэхэмжлэх: ${invoiceId || 'N/A'})`,
        order.r2Key
      )

      const finalOrder = approved || order
      sendOrderApprovedEmail({ order: finalOrder, siteUrl }).catch(console.warn)
      sendTelegramOrderApprovedNotification(finalOrder, true, siteUrl).catch(console.warn)
    }
  }

  return NextResponse.json({ success: true, status: 'OK' }, { status: 200 })
}

