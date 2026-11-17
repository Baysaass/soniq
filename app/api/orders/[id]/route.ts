import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getBonumGatewayClient } from '@/lib/bonum'
import { sendOrderApprovedEmail } from '@/lib/email-service'
import { sendTelegramOrderApprovedNotification } from '@/lib/telegram'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    let order = await db.getOrderById(id)

    if (!order) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 })
    }

    // ACTIVE BONUM VERIFICATION:
    // If order is still PENDING and has a Bonum invoice, actively check Bonum's API
    // This guarantees immediate unlocking of downloads even if webhook was delayed!
    const bonumInv =
      order.bonumInvoiceId ||
      (order.paymentMethod === 'BONUM' &&
      order.transferReference &&
      !order.transferReference.startsWith('SQ-')
        ? order.transferReference
        : '')

    if (order.status === 'PENDING' && bonumInv) {
      try {
        const client = getBonumGatewayClient()
        const invoiceData: any = await client.getInvoice(bonumInv)
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
          const siteUrl = new URL(request.url).origin
          const settings = await db.getSettings().catch(() => null)
          const fallbackLink = order.weTransferLink || settings?.defaultBundleWeTransfer || ''

          const approved = await db.approveOrder(
            order.id,
            fallbackLink,
            `Bonum-ээр шууд шалгагдаж баталгаажсан (Нэхэмжлэх: ${bonumInv})`,
            order.r2Key
          )

          if (approved) {
            order = approved
            // Background dispatch notifications
            sendOrderApprovedEmail({ order, siteUrl }).catch(console.warn)
            sendTelegramOrderApprovedNotification(order, true, siteUrl).catch(console.warn)
          }
        }
      } catch (checkErr: any) {
        // Silently continue if Bonum check fails (rate limit or network)
      }
    }

    // If order is approved, return full details including download links!
    const isApproved = order.status === 'APPROVED'

    return NextResponse.json({
      id: order.id,
      createdAt: order.createdAt,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items,
      totalAmountMNT: order.totalAmountMNT,
      totalAmountUSD: order.totalAmountUSD,
      currency: order.currency,
      status: order.status,
      paymentMethod: order.paymentMethod,
      transferReference: order.transferReference,
      approvedAt: order.approvedAt,
      weTransferLink: isApproved ? order.weTransferLink : null,
      r2Key: isApproved ? (order.r2Key || null) : null,
      adminNotes: order.adminNotes,
      bonumInvoiceId: order.bonumInvoiceId || null,
      bonumFollowUpLink: order.bonumFollowUpLink || null,
      bonumQrCode: order.bonumQrCode || null,
      bonumQrImage: order.bonumQrImage || null,
      bonumQrLinks: order.bonumQrLinks || null,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const { action } = body

    const order = await db.getOrderById(id)
    if (!order) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 })
    }

    if (action === 'cancel') {
      if (order.status === 'APPROVED') {
        return NextResponse.json(
          { error: 'Баталгаажсан захиалгыг цуцлах боломжгүй.' },
          { status: 400 }
        )
      }

      const cancelled = await db.cancelOrder(
        id,
        body.reason || 'Төлбөр төлөгдөөгүй тул хэрэглэгч эсвэл систем хаасан'
      )

      return NextResponse.json({
        success: true,
        order: cancelled || { ...order, status: 'CANCELLED' },
      })
    }

    return NextResponse.json({ error: 'Үйлдэл тодорхойгүй байна.' }, { status: 400 })
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: error?.message || 'Захиалга шинэчлэхэд алдаа гарлаа' },
      { status: 500 }
    )
  }
}
