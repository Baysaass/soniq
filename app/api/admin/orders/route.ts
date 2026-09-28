import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendOrderApprovedEmail } from '@/lib/email-service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, action, customWeTransferLink, adminNotes, r2Key, passcode, sendEmail = true } = body

    const isAuthorized = await db.verifyAdminPasscode(passcode)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Нууц үг буруу байна' }, { status: 401 })
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Захиалгын дугаар шаардлагатай' }, { status: 400 })
    }

    const siteUrl = new URL(request.url).origin

    if (action === 'APPROVE') {
      const updated = await db.approveOrder(orderId, customWeTransferLink, adminNotes, r2Key)
      if (!updated) {
        return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 })
      }

      let emailResult = null
      if (sendEmail) {
        try {
          emailResult = await sendOrderApprovedEmail({
            order: updated,
            siteUrl,
            customWeTransferLink,
            customR2Key: r2Key,
          })
        } catch (mailErr) {
          console.error('Email sending error during order approval:', mailErr)
        }
      }

      const emailSuccess = Boolean(emailResult?.success)
      const emailNote = emailResult
        ? emailSuccess
          ? ' И-мэйл захиалагч руу амжилттай илгээгдлээ.'
          : ` Гэвч и-мэйл илгээгдсэнгүй: ${emailResult.error}`
        : ''

      return NextResponse.json({
        success: true,
        message: `Захиалга амжилттай баталгаажлаа.${emailNote}`,
        order: updated,
        emailResult,
      })
    } else if (action === 'RESEND_EMAIL') {
      const order = await db.getOrderById(orderId)
      if (!order) {
        return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 })
      }

      const emailResult = await sendOrderApprovedEmail({
        order,
        siteUrl,
        customWeTransferLink,
        customR2Key: r2Key,
      })

      if (!emailResult?.success) {
        return NextResponse.json(
          {
            success: false,
            error: emailResult?.error || 'И-мэйл илгээж чадсангүй. Resend тохиргоог шалгана уу.',
            emailResult,
          },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `И-мэйл амжилттай илгээгдлээ: ${order.customerEmail}`,
        emailResult,
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

