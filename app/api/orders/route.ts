import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendTelegramOrderNotification } from '@/lib/telegram'
import { sendOrderCreatedEmail, sendOrderApprovedEmail } from '@/lib/email-service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerName, customerEmail, customerPhone, items, totalAmountMNT, totalAmountUSD, currency, paymentMethod, customerNotes, receiptNote } = body

    const isFree =
      (Number(totalAmountMNT || 0) === 0 && Number(totalAmountUSD || 0) === 0) ||
      paymentMethod === 'FREE_DOWNLOAD'

    if (isFree) {
      if (!customerEmail || !items || items.length === 0) {
        return NextResponse.json(
          { error: 'И-мэйл хаягаа оруулна уу.' },
          { status: 400 }
        )
      }
    } else {
      if (!customerName || !customerEmail || !customerPhone || !items || items.length === 0) {
        return NextResponse.json(
          { error: 'Бүх шаардлагатай мэдээллийг (нэр, и-мэйл, утасны дугаар) оруулна уу.' },
          { status: 400 }
        )
      }
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
              price: isFree ? 0 : (item.price ?? product.priceMNT),
              priceUSD: isFree ? 0 : (item.priceUSD ?? product.priceUSD),
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

    // IMPORTANT: Only fall back to settings.defaultBundleWeTransfer if NEITHER weTransferLink NOR r2Key is present
    // If a product was configured with R2 only, we MUST NOT inject the bundle's Google Drive link
    if (!orderWeTransferLink && !orderR2Key) {
      try {
        const settings = await db.getSettings()
        orderWeTransferLink = settings?.defaultBundleWeTransfer || ''
      } catch (e) {
        // ignore
      }
    }

    const finalCustomerName =
      (customerName || '').trim() ||
      (customerEmail ? customerEmail.split('@')[0] : 'Зочин')
    const finalCustomerPhone =
      (customerPhone || '').trim() || (isFree ? 'Үнэгүй таталт' : '')
    const finalStatus = isFree ? 'APPROVED' : 'PENDING'
    const finalPaymentMethod = isFree ? 'FREE_DOWNLOAD' : (paymentMethod || 'KHAN_BANK')
    const finalApprovedAt = isFree ? new Date().toISOString() : null

    const order = await db.createOrder({
      customerName: finalCustomerName,
      customerEmail: (customerEmail || '').trim(),
      customerPhone: finalCustomerPhone,
      customerNotes,
      receiptNote: isFree ? 'Үнэгүй таталт' : receiptNote,
      items: enrichedItems,
      totalAmountMNT: isFree ? 0 : (totalAmountMNT || 0),
      totalAmountUSD: isFree ? 0 : (totalAmountUSD || 0),
      currency: currency || 'MNT',
      paymentMethod: finalPaymentMethod,
      weTransferLink: orderWeTransferLink,
      r2Key: orderR2Key,
      status: finalStatus,
      approvedAt: finalApprovedAt,
    })

    const siteUrl = new URL(request.url).origin

    // Dispatch Telegram notification (non-blocking)
    sendTelegramOrderNotification(order, siteUrl).catch((err) => {
      console.warn('Telegram notification background warning:', err)
    })

    // If free, send the approved email directly with download links.
    // If paid, send the order created/pending email.
    if (isFree) {
      sendOrderApprovedEmail({ order, siteUrl }).catch((err) => {
        console.warn('Order approved email background warning:', err)
      })
    } else {
      sendOrderCreatedEmail({ order, siteUrl }).catch((err) => {
        console.warn('Order confirmation email background warning:', err)
      })
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order,
      isFree,
      downloadUrl: orderWeTransferLink || '',
      weTransferLink: orderWeTransferLink || '',
      r2Key: orderR2Key || '',
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
  const passcode = searchParams.get('passcode') || request.headers.get('x-admin-passcode') || ''

  const isAuthorized = await db.verifyAdminPasscode(passcode)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const forceFresh = searchParams.get('fresh') === 'true'
  const orders = await db.getOrders(forceFresh)
  return NextResponse.json(
    { orders },
    {
      headers: {
        'Cache-Control': 'private, max-age=5, stale-while-revalidate=30',
      },
    }
  )
}
