import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const passcode = searchParams.get('passcode')

  const isAuthorized = await db.verifyAdminPasscode(passcode || '')
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Нууц үг буруу байна' }, { status: 401 })
  }

  const hasKey = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0)
  const keyPrefix = hasKey ? `${process.env.RESEND_API_KEY!.slice(0, 6)}...` : 'Тохируулаагүй'
  const emailFrom = process.env.EMAIL_FROM || 'SONIQ STORE <onboarding@resend.dev>'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.soniq.click'

  return NextResponse.json({
    hasKey,
    keyPrefix,
    emailFrom,
    siteUrl,
    isUsingDefaultOnboarding: emailFrom.includes('onboarding@resend.dev'),
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { passcode, testEmail } = body

    const isAuthorized = await db.verifyAdminPasscode(passcode || '')
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Нууц үг буруу байна' }, { status: 401 })
    }

    if (!testEmail || !testEmail.includes('@')) {
      return NextResponse.json({ error: 'Зөв и-мэйл хаяг оруулна уу' }, { status: 400 })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'RESEND_API_KEY Vercel Environment Variables дээр бүртгэгдээгүй байна.',
          suggestion: 'Vercel -> Settings -> Environment Variables дээр RESEND_API_KEY нэмээд Redeploy хийнэ үү.',
        },
        { status: 400 }
      )
    }

    const emailFrom = process.env.EMAIL_FROM || 'SONIQ STORE <onboarding@resend.dev>'

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [testEmail.trim()],
        subject: '[SONIQ STORE] И-мэйл холболтын шалгалтын захиа (Test)',
        html: `
          <div style="font-family: sans-serif; padding: 24px; background: #0c0d0e; color: #fff; border-radius: 12px; max-width: 500px;">
            <h2 style="color: #00B0FF; margin-top: 0;">⚡ SONIQ STORE — И-мэйл холболт амжилттай!</h2>
            <p style="font-size: 14px; color: #ccc;">Энэхүү захиа нь Resend үйлчилгээ болон Vercel орчны хувьсагчууд зөв ажиллаж байгааг баталгаажуулж байна.</p>
            <p style="font-size: 12px; color: #888;">Илгээгч: <strong>${emailFrom}</strong><br/>Хүлээн авагч: <strong>${testEmail}</strong></p>
          </div>
        `,
      }),
    })

    const resData = await res.json()

    if (res.ok && resData.id) {
      return NextResponse.json({
        success: true,
        messageId: resData.id,
        from: emailFrom,
        recipient: testEmail,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: resData?.message || resData?.error || 'Resend алдаа буцаалаа',
          details: resData,
          from: emailFrom,
          recipient: testEmail,
        },
        { status: res.status || 400 }
      )
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Сүлжээний алдаа' },
      { status: 500 }
    )
  }
}
