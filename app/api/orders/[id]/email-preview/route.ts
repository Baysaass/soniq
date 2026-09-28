import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildOrderDeliveryEmailHtml, getEmailLogByOrderId } from '@/lib/email-service'

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

    // Check if an existing log exists
    const existingLog = getEmailLogByOrderId(id)
    if (existingLog && existingLog.html) {
      return new Response(existingLog.html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // Otherwise render fresh template
    const siteUrl = new URL(request.url).origin
    const html = buildOrderDeliveryEmailHtml({
      order,
      siteUrl,
      directDownloadUrl: `${siteUrl}/api/orders/${order.id}/download`,
      weTransferUrl: order.weTransferLink || undefined,
    })

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    console.error('Error generating email preview:', error)
    return NextResponse.json({ error: 'И-мэйл урьдчилан харахад алдаа гарлаа' }, { status: 500 })
  }
}
