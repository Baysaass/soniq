import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createBonumInvoice, createBonumQr, getBonumCredentials } from '@/lib/bonum'
import { sendTelegramOrderNotification } from '@/lib/telegram'
import { sendOrderCreatedEmail } from '@/lib/email-service'

export async function POST(request: Request) {
  try {
    const creds = getBonumCredentials()
    if (!creds.enabled) {
      return NextResponse.json(
        { error: 'Bonum систем одоогоор түр хаалттай байна.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalAmountMNT,
      totalAmountUSD,
      currency,
      mode = 'invoice', // 'invoice' | 'qr'
      forceNew = false,
    } = body

    const siteUrl = new URL(request.url).origin

    let order = orderId ? await db.getOrderById(orderId) : null

    // If order is already cancelled, don't allow re-charging on it
    if (order && order.status === 'CANCELLED') {
      return NextResponse.json(
        {
          error: 'Энэ захиалга төлөгдөөгүй тул хаагдсан байна. Та шинэ захиалга үүсгэнэ үү.',
          status: 'CANCELLED',
        },
        { status: 400 }
      )
    }

    // Auto-close any older unpaid PENDING orders for this customer to prevent duplicate payments
    if (!order && customerEmail) {
      try {
        const allOrders = await db.getOrders(true)
        const normalized = customerEmail.trim().toLowerCase()
        const pendingOrders = allOrders.filter(
          (o) =>
            o.status === 'PENDING' &&
            o.customerEmail?.trim().toLowerCase() === normalized
        )
        for (const old of pendingOrders) {
          await db.cancelOrder(
            old.id,
            'Төлөгдөөгүй тул шинэ захиалга үүсгэхэд автоматаар хаагдсан'
          )
        }
      } catch (cancelErr) {
        console.warn('Error auto-cancelling older pending orders:', cancelErr)
      }
    }

    // If order does not exist yet, create one
    if (!order) {
      if (!customerEmail || !items || items.length === 0) {
        return NextResponse.json(
          { error: 'И-мэйл хаяг болон бүтээгдэхүүний мэдээлэл шаардлагатай.' },
          { status: 400 }
        )
      }

      // Enrich items with download metadata from DB
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
            console.warn('Could not enrich item:', item.id)
          }
          return item
        })
      )

      let orderWeTransferLink = ''
      let orderR2Key = ''
      for (const it of enrichedItems) {
        if (it.weTransferLink && !orderWeTransferLink) orderWeTransferLink = it.weTransferLink
        if (it.r2Key && !orderR2Key) orderR2Key = it.r2Key
      }

      order = await db.createOrder({
        customerName: (customerName || '').trim() || customerEmail.split('@')[0] || 'Хэрэглэгч',
        customerEmail: customerEmail.trim(),
        customerPhone: (customerPhone || '').trim(),
        items: enrichedItems,
        totalAmountMNT: Math.round(Number(totalAmountMNT) || 0),
        totalAmountUSD: Number(totalAmountUSD) || 0,
        currency: currency || 'MNT',
        paymentMethod: 'BONUM',
        weTransferLink: orderWeTransferLink,
        r2Key: orderR2Key,
        status: 'PENDING',
      })

      // Send telegram alert for new pending Bonum order
      sendTelegramOrderNotification(order, siteUrl).catch((err) => {
        console.warn('Telegram notification warning:', err)
      })

      // Note: Gmail is ONLY dispatched when order is approved/paid (sendOrderApprovedEmail).
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Захиалга үүсгэх боломжгүй байна.' },
        { status: 500 }
      )
    }

    // If order is already approved, return download details immediately
    if (order.status === 'APPROVED') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        status: 'APPROVED',
        weTransferLink: order.weTransferLink,
        r2Key: order.r2Key,
      })
    }

    // Reuse existing followUpLink only if NOT forceNew and already generated
    if (!forceNew && mode === 'invoice' && order.bonumFollowUpLink) {
      return NextResponse.json({
        success: true,
        mode: 'invoice',
        orderId: order.id,
        invoiceId: order.bonumInvoiceId,
        followUpLink: order.bonumFollowUpLink,
      })
    }

    // ALWAYS generate a unique transactionId with timestamp so Bonum, QPay, and banking apps NEVER complain about duplicate transactions!
    const txId = `${order.id}_${Date.now().toString(36)}`

    // 1. If QR mode requested
    if (mode === 'qr') {
      if (order.bonumQrCode && order.bonumQrImage) {
        return NextResponse.json({
          success: true,
          mode: 'qr',
          orderId: order.id,
          invoiceId: order.bonumInvoiceId,
          qrCode: order.bonumQrCode,
          qrImage: order.bonumQrImage,
          links: order.bonumQrLinks || [],
        })
      }

      try {
        const qrRes = await createBonumQr({ order, transactionId: txId })
        await db.updateOrder(order.id, {
          paymentMethod: 'BONUM',
          bonumInvoiceId: qrRes.invoiceId,
          bonumQrCode: qrRes.qrCode,
          bonumQrImage: qrRes.qrImage,
          bonumQrLinks: qrRes.links,
        })

        return NextResponse.json({
          success: true,
          mode: 'qr',
          orderId: order.id,
          invoiceId: qrRes.invoiceId,
          qrCode: qrRes.qrCode,
          qrImage: qrRes.qrImage,
          links: qrRes.links,
        })
      } catch (err: any) {
        console.warn('[Bonum] QR creation fallback to Invoice:', err?.message)
      }
    }

    // 2. Default: Create web invoice (redirect to Bonum checkout page with QPay, cards, Apple Pay)
    const invoiceRes = await createBonumInvoice({
      order,
      siteUrl,
      expiresInSeconds: 3600,
      transactionId: txId,
    })

    await db.updateOrder(order.id, {
      paymentMethod: 'BONUM',
      bonumInvoiceId: invoiceRes.invoiceId,
      bonumFollowUpLink: invoiceRes.followUpLink,
    })

    return NextResponse.json({
      success: true,
      mode: 'invoice',
      orderId: order.id,
      invoiceId: invoiceRes.invoiceId,
      followUpLink: invoiceRes.followUpLink,
    })
  } catch (error: any) {
    const errorMsg =
      error?.response?.message ||
      error?.response?.error ||
      error?.message ||
      'Bonum төлбөрийн холболт үүсгэхэд алдаа гарлаа.'

    console.error('[Bonum Checkout API Error]:', errorMsg, error?.response || '')
    return NextResponse.json(
      {
        error: errorMsg,
        details: error?.response || undefined,
      },
      { status: 500 }
    )
  }
}

