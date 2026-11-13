import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getBonumGatewayClient } from '@/lib/bonum'
import { sendOrderApprovedEmail } from '@/lib/email-service'
import { sendTelegramOrderApprovedNotification } from '@/lib/telegram'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID шаардлагатай' }, { status: 400 })
    }

    let order = await db.getOrderById(orderId)
    if (!order) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 })
    }

    // ACTIVE BONUM VERIFICATION:
    // If order is still PENDING and has a Bonum invoice, actively query Bonum's API
    if (order.status === 'PENDING' && order.bonumInvoiceId) {
      try {
        const client = getBonumGatewayClient()
        const invoiceData: any = await client.getInvoice(order.bonumInvoiceId)
        if (
          invoiceData &&
          (invoiceData.status === 'SUCCESS' ||
            invoiceData.status === 'PAID' ||
            invoiceData.status === 'APPROVED' ||
            (invoiceData.paymentVendor &&
              invoiceData.status !== 'FAILED' &&
              invoiceData.status !== 'CANCELLED'))
        ) {
          const siteUrl = new URL(request.url).origin
          const settings = await db.getSettings().catch(() => null)
          const fallbackLink = order.weTransferLink || settings?.defaultBundleWeTransfer || ''

          const approved = await db.approveOrder(
            order.id,
            fallbackLink,
            `Bonum-ээр шууд шалгагдаж баталгаажсан (Нэхэмжлэх: ${order.bonumInvoiceId})`,
            order.r2Key
          )

          if (approved) {
            order = approved
            sendOrderApprovedEmail({ order, siteUrl }).catch(console.warn)
            sendTelegramOrderApprovedNotification(order, true, siteUrl).catch(console.warn)
          }
        }
      } catch (checkErr: any) {
        // Silently continue with existing order state
      }
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      isApproved: order.status === 'APPROVED',
      approvedAt: order.approvedAt,
      paymentMethod: order.paymentMethod,
      bonumInvoiceId: order.bonumInvoiceId,
      bonumFollowUpLink: order.bonumFollowUpLink,
      bonumQrImage: order.bonumQrImage,
      bonumQrLinks: order.bonumQrLinks,
      weTransferLink: order.status === 'APPROVED' ? order.weTransferLink : undefined,
      r2Key: order.status === 'APPROVED' ? order.r2Key : undefined,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Серверийн алдаа' },
      { status: 500 }
    )
  }
}


