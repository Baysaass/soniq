import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID шаардлагатай' }, { status: 400 })
    }

    const order = await db.getOrderById(orderId)
    if (!order) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 })
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

