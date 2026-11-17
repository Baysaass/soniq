import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  createBonumInvoice,
  createBonumQr,
  getBonumCredentials,
  getBonumGatewayClient,
} from '@/lib/bonum'
import { sendTelegramOrderNotification } from '@/lib/telegram'
import { sendOrderCreatedEmail } from '@/lib/email-service'

export async function GET() {
  try {
    const creds = getBonumCredentials()
    if (!creds.enabled) {
      return NextResponse.json({ status: 'DISABLED' }, { status: 200 })
    }
    const client = getBonumGatewayClient()
    // Pre-warm token in background so subsequent POST is instantaneous (<300ms)
    await (client as any).auth?.().catch(() => null)
    return NextResponse.json({ status: 'READY', prewarmed: true }, { status: 200 })
  } catch {
    return NextResponse.json({ status: 'READY' }, { status: 200 })
  }
}

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

    // Auto-close any older unpaid PENDING orders asynchronously in the background
    // (Never blocks the user's checkout response!)
    if (!order && customerEmail) {
      const normalized = customerEmail.trim().toLowerCase()
      Promise.resolve().then(async () => {
        try {
          const allOrders = await db.getOrders(false)
          const pendingOrders = allOrders.filter(
            (o) =>
              o.status === 'PENDING' &&
              o.customerEmail?.trim().toLowerCase() === normalized
          )
          for (const old of pendingOrders) {
            await db.cancelOrder(
              old.id,
              'Төлөгдөөгүй тул шинэ захиалга үүсгэхэд автоматаар хаагдсан'
            ).catch(() => {})
          }
        } catch (cancelErr) {
          console.warn('Background auto-cancel error:', cancelErr)
        }
      })
    }

    // If order does not exist yet, fast-enrich and create invoice + order in one single DB write
    if (!order) {
      if (!customerEmail || !items || items.length === 0) {
        return NextResponse.json(
          { error: 'И-мэйл хаяг болон бүтээгдэхүүний мэдээлэл шаардлагатай.' },
          { status: 400 }
        )
      }

      // Fast in-memory enrichment: Use db.getProducts(false) cache instead of multiple individual DB calls!
      let allProductsMap: Map<string, any> | null = null
      const needsEnrichment = (items as any[]).some((it) => !it.weTransferLink && !it.r2Key)
      if (needsEnrichment) {
        try {
          const prods = await db.getProducts(false)
          allProductsMap = new Map(prods.map((p) => [p.id, p]))
        } catch {}
      }

      const enrichedItems = (items as any[]).map((item) => {
        const product = allProductsMap ? allProductsMap.get(item.id) : null
        return {
          ...item,
          title: item.title || product?.title || 'Soniq Digital Pack',
          price: item.price ?? product?.priceMNT ?? 0,
          priceUSD: item.priceUSD ?? product?.priceUSD ?? 0,
          image: item.image || product?.image || '',
          weTransferLink: item.weTransferLink || product?.defaultWeTransferLink || '',
          r2Key: item.r2Key || product?.r2Key || '',
        }
      })

      let orderWeTransferLink = ''
      let orderR2Key = ''
      for (const it of enrichedItems) {
        if (it.weTransferLink && !orderWeTransferLink) orderWeTransferLink = it.weTransferLink
        if (it.r2Key && !orderR2Key) orderR2Key = it.r2Key
      }

      const targetOrderId = `SQ-${Math.floor(10000 + Math.random() * 90000)}`
      const txId = `${targetOrderId}_${Date.now().toString(36)}`

      const preOrder: any = {
        id: targetOrderId,
        customerName: (customerName || '').trim() || customerEmail.split('@')[0] || 'Хэрэглэгч',
        customerEmail: customerEmail.trim(),
        customerPhone: (customerPhone || '').trim(),
        items: enrichedItems,
        totalAmountMNT: Math.round(Number(totalAmountMNT) || 0),
        totalAmountUSD: Number(totalAmountUSD) || 0,
        currency: currency || 'MNT',
        paymentMethod: 'BONUM',
        transferReference: targetOrderId,
        weTransferLink: orderWeTransferLink,
        r2Key: orderR2Key,
        status: 'PENDING',
      }

      // 1. If QR mode requested
      if (mode === 'qr') {
        const qrRes = await createBonumQr({ order: preOrder, transactionId: txId })
        order = await db.createOrder({
          ...preOrder,
          transferReference: qrRes.invoiceId,
          bonumInvoiceId: qrRes.invoiceId,
          bonumQrCode: qrRes.qrCode,
          bonumQrImage: qrRes.qrImage,
          bonumQrLinks: qrRes.links,
        })

        if (order) {
          sendTelegramOrderNotification(order, siteUrl).catch(console.warn)
        }

        return NextResponse.json({
          success: true,
          mode: 'qr',
          orderId: targetOrderId,
          invoiceId: qrRes.invoiceId,
          qrCode: qrRes.qrCode,
          qrImage: qrRes.qrImage,
          links: qrRes.links,
        })
      }

      // 2. Default: Web Invoice mode (create invoice directly then save order in 1 DB insert)
      const invoiceRes = await createBonumInvoice({
        order: preOrder,
        siteUrl,
        expiresInSeconds: 3600,
        transactionId: txId,
      })

      order = await db.createOrder({
        ...preOrder,
        transferReference: invoiceRes.invoiceId,
        bonumInvoiceId: invoiceRes.invoiceId,
        bonumFollowUpLink: invoiceRes.followUpLink,
      })

      if (order) {
        sendTelegramOrderNotification(order, siteUrl).catch(console.warn)
      }

      return NextResponse.json({
        success: true,
        mode: 'invoice',
        orderId: targetOrderId,
        invoiceId: invoiceRes.invoiceId,
        followUpLink: invoiceRes.followUpLink,
      })
    }

    // If order already existed in DB
    if (order.status === 'APPROVED') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        status: 'APPROVED',
        weTransferLink: order.weTransferLink,
        r2Key: order.r2Key,
      })
    }

    if (!forceNew && mode === 'invoice' && order.bonumFollowUpLink) {
      return NextResponse.json({
        success: true,
        mode: 'invoice',
        orderId: order.id,
        invoiceId: order.bonumInvoiceId,
        followUpLink: order.bonumFollowUpLink,
      })
    }

    const txId = `${order.id}_${Date.now().toString(36)}`

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

      const qrRes = await createBonumQr({ order, transactionId: txId })
      await db.updateOrder(order.id, {
        paymentMethod: 'BONUM',
        transferReference: qrRes.invoiceId,
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
    }

    // Default invoice mode for existing order
    const invoiceRes = await createBonumInvoice({
      order,
      siteUrl,
      expiresInSeconds: 3600,
      transactionId: txId,
    })

    await db.updateOrder(order.id, {
      paymentMethod: 'BONUM',
      transferReference: invoiceRes.invoiceId,
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

