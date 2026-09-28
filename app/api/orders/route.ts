import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerName, customerEmail, customerPhone, items, totalAmountMNT, totalAmountUSD, currency, paymentMethod, customerNotes, receiptNote } = body

    if (!customerName || !customerEmail || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Бүх шаардлагатай мэдээллийг (нэр, и-мэйл, утасны дугаар) оруулна уу.' },
        { status: 400 }
      )
    }

    const order = await db.createOrder({
      customerName,
      customerEmail,
      customerPhone,
      customerNotes,
      receiptNote,
      items,
      totalAmountMNT: totalAmountMNT || 0,
      totalAmountUSD: totalAmountUSD || 0,
      currency: currency || 'MNT',
      paymentMethod: paymentMethod || 'KHAN_BANK',
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Захиалга үүсгэхэд алдаа гарлаа.' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const passcode = searchParams.get('passcode')

  const isAuthorized = await db.verifyAdminPasscode(passcode || '')
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orders = await db.getOrders()
  return NextResponse.json({ orders })
}
