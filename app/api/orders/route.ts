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

    // Enrich items with fresh product download metadata from DB
    const enrichedItems = await Promise.all(
      (items as any[]).map(async (item) => {
        try {
          const product = await db.getProductById(item.id)
          if (product) {
            return {
              ...item,
              title: product.title || item.title,
              price: item.price ?? product.priceMNT,
              priceUSD: item.priceUSD ?? product.priceUSD,
              image: product.image || item.image,
              weTransferLink: product.defaultWeTransferLink || item.weTransferLink || '',
              r2Key: product.r2Key || item.r2Key || '',
            }
          }
        } catch (e) {
          console.warn('Could not fetch product for item enrichment:', item.id)
        }
        return item
      })
    )

    // Resolve primary download link (WeTransfer / R2)
    let orderWeTransferLink = ''
    let orderR2Key = ''

    for (const it of enrichedItems) {
      if (it.weTransferLink && !orderWeTransferLink) {
        orderWeTransferLink = it.weTransferLink
      }
      if (it.r2Key && !orderR2Key) {
        orderR2Key = it.r2Key
      }
    }

    if (!orderWeTransferLink) {
      try {
        const settings = await db.getSettings()
        orderWeTransferLink = settings?.defaultBundleWeTransfer || ''
      } catch (e) {
        // ignore
      }
    }

    const order = await db.createOrder({
      customerName,
      customerEmail,
      customerPhone,
      customerNotes,
      receiptNote,
      items: enrichedItems,
      totalAmountMNT: totalAmountMNT || 0,
      totalAmountUSD: totalAmountUSD || 0,
      currency: currency || 'MNT',
      paymentMethod: paymentMethod || 'KHAN_BANK',
      weTransferLink: orderWeTransferLink,
      r2Key: orderR2Key,
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order,
    })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: error?.message || 'Захиалга үүсгэхэд алдаа гарлаа.' },
      { status: 500 }
    )
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
