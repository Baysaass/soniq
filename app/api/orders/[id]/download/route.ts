import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isR2Configured, generatePresignedDownloadUrl } from '@/lib/r2-client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Захиалгын код олдсонгүй' }, { status: 400 })
    }

    const order = await db.getOrderById(id)
    if (!order) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 })
    }

    // Security check: Must be APPROVED
    if (order.status !== 'APPROVED') {
      return new Response(
        `<!DOCTYPE html>
        <html lang="mn">
        <head>
          <meta charset="utf-8">
          <title>Захиалга хүлээгдэж байна — SONIQ STORE</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { background: #0c0d0e; color: #f4f4f5; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .box { background: #141517; border: 1px solid #27272a; border-radius: 16px; padding: 32px; max-width: 480px; text-align: center; }
            h1 { font-size: 20px; color: #eab308; margin-bottom: 8px; }
            p { font-size: 14px; color: #a1a1aa; line-height: 1.6; }
            a { display: inline-block; margin-top: 16px; background: #00B0FF; color: #fff; padding: 10px 20px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>⏳ Захиалга шалгагдаж байна</h1>
            <p>Захиалгын дугаар: <strong>${order.id}</strong></p>
            <p>Таны төлбөрийг админ шалгаж баталгаажуулсны дараа татах холбоос автоматаар нээгдэх бөгөөд таны <strong>${order.customerEmail}</strong> и-мэйл хаяг руу бас илгээгдэнэ.</p>
            <a href="/order/${order.id}">Захиалгын хуудас руу очих &rarr;</a>
          </div>
        </body>
        </html>`,
        {
          status: 403,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      )
    }

    // If R2 key is present and configured, generate signed download URL
    const r2Key = order.r2Key || (order.items && order.items.find((i) => i.r2Key)?.r2Key)
    if (r2Key && (await isR2Configured())) {
      try {
        const filename = `${order.items[0]?.title || 'soniq-product'}.zip`
        const presigned = await generatePresignedDownloadUrl({
          key: r2Key,
          downloadFilename: filename,
          expiresInSeconds: 86400, // 24 hours
        })
        return NextResponse.redirect(presigned.downloadUrl, 302)
      } catch (err) {
        console.error('Error creating presigned URL for direct download:', err)
      }
    }

    // If WeTransfer link is present, redirect to WeTransfer
    const weTransfer =
      order.weTransferLink || (order.items && order.items[0]?.weTransferLink)
    if (weTransfer && weTransfer.startsWith('http')) {
      return NextResponse.redirect(weTransfer, 302)
    }

    // Fallback: Redirect to order receipt page
    return NextResponse.redirect(new URL(`/order/${order.id}`, request.url))
  } catch (error) {
    console.error('Error handling direct order download:', error)
    return NextResponse.json({ error: 'Татах үед алдаа гарлаа' }, { status: 500 })
  }
}
