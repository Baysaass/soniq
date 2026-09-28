import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await db.getOrderById(id)

    if (!order) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 })
    }

    // If order is approved, return full details including WeTransfer download link!
    // If pending, hide sensitive download link until admin approves it.
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
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 })
  }
}
