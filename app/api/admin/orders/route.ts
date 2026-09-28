import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, action, customWeTransferLink, adminNotes, r2Key, passcode } = body

    const isAuthorized = await db.verifyAdminPasscode(passcode)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Нууц үг буруу байна' }, { status: 401 })
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Захиалгын дугаар шаардлагатай' }, { status: 400 })
    }

    if (action === 'APPROVE') {
      const updated = await db.approveOrder(orderId, customWeTransferLink, adminNotes, r2Key)
      if (!updated) {
        return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        message: 'Захиалга амжилттай баталгаажлаа.',
        order: updated,
      })
    } else if (action === 'CANCEL') {
      const updated = await db.cancelOrder(orderId, adminNotes)
      return NextResponse.json({
        success: true,
        message: 'Захиалга цуцлагдлаа.',
        order: updated,
      })
    }

    return NextResponse.json({ error: 'Үйлдэл тодорхойгүй байна' }, { status: 400 })
  } catch (error) {
    console.error('Admin order update error:', error)
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 })
  }
}
