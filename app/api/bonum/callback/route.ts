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
    url.searchParams.get('id') ||
    ''

  const txn =
    url.searchParams.get('txn') ||
    url.searchParams.get('transactionId') ||
    url.searchParams.get('merchant_transaction_id') ||
    ''

  const invoiceId =
    url.searchParams.get('invoiceId') ||
    url.searchParams.get('c_invoice_id') ||
    url.searchParams.get('invoice_id') ||
    ''

  const queryStatus = (
    url.searchParams.get('status') ||
    url.searchParams.get('paymentStatus') ||
    url.searchParams.get('transStatus') ||
    url.searchParams.get('result') ||
    ''
  ).toUpperCase()

  if (!orderId && !txn && !invoiceId) {
    return NextResponse.redirect(`${siteUrl}/shop`)
  }

  // 1. Find order by orderId
  let order = orderId ? await db.getOrderById(orderId) : null

  // 2. Fallback: Strip retry suffix (SQ-85857_abc -> SQ-85857)
  if (!order && orderId && orderId.includes('_')) {
    order = await db.getOrderById(orderId.split('_')[0])
  }

  // 3. Fallback: Find by transactionId
  if (!order && txn) {
    const cleanTxn = txn.includes('_') ? txn.split('_')[0] : txn
    order = (await db.getOrderById(txn)) || (await db.getOrderById(cleanTxn))
  }

  // 4. Fallback: Find by invoiceId
  if (!order && invoiceId) {
    const allOrders = await db.getOrders(true)
    order =
      allOrders.find(
        (o) =>
          o.bonumInvoiceId === invoiceId ||
          o.transferReference === invoiceId
      ) || null
  }

  if (!order) {
    return NextResponse.redirect(`${siteUrl}/shop`)
  }

  // If already approved, redirect straight to order page
  if (order.status === 'APPROVED') {
    return NextResponse.redirect(`${siteUrl}/order/${order.id}?paid=1`)
  }

  // Active check against Bonum API
  const invId =
    order.bonumInvoiceId ||
    (order.transferReference && !order.transferReference.startsWith('SQ-')
      ? order.transferReference
      : '') ||
    invoiceId

  let approvedDirectly = false

  if (invId) {
    try {
      const client = getBonumGatewayClient()
      const invoiceData: any = await client.getInvoice(invId)
      console.log(`[Bonum Callback] getInvoice(${invId}) response:`, invoiceData)

      const isPaid =
        invoiceData &&
        (invoiceData.status === 'SUCCESS' ||
          invoiceData.status === 'PAID' ||
          invoiceData.status === 'APPROVED' ||
          (invoiceData.paymentVendor &&
            invoiceData.status !== 'FAILED' &&
            invoiceData.status !== 'CANCELLED') ||
          (Number(invoiceData.paidAmount) > 0 &&
            Number(invoiceData.paidAmount) >= Number(order.totalAmountMNT)))

      if (isPaid) {
        approvedDirectly = true
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

  // If getInvoice didn't trigger approval but query parameter explicitly confirms SUCCESS
  if (
    !approvedDirectly &&
    order.status === 'PENDING' &&
    (queryStatus === 'SUCCESS' || queryStatus === 'PAID' || queryStatus === 'APPROVED')
  ) {
    const settings = await db.getSettings().catch(() => null)
    const fallbackLink = order.weTransferLink || settings?.defaultBundleWeTransfer || ''

    const approved = await db.approveOrder(
      order.id,
      fallbackLink,
      `Bonum callback status=${queryStatus}-ээр шууд баталгаажсан`,
      order.r2Key
    )

    if (approved) {
      order = approved
      sendOrderApprovedEmail({ order, siteUrl }).catch(console.warn)
      sendTelegramOrderApprovedNotification(order, true, siteUrl).catch(console.warn)
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

