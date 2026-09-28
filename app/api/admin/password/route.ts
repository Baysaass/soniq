import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    if (!currentPassword) {
      return NextResponse.json({ error: 'Одоогийн нууц үгээ оруулна уу.' }, { status: 400 })
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json(
        { error: 'Шинэ нууц үг хамгийн багадаа 6 тэмдэгттэй байх ёстой.' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Шинэ нууц үг баталгаажуулалттай таарахгүй байна.' },
        { status: 400 }
      )
    }

    const result = await db.changeAdminPasscode(currentPassword, newPassword)
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (err: any) {
    console.error('Password change error:', err)
    return NextResponse.json(
      { error: err.message || 'Нууц үг солиход алдаа гарлаа.' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const passcode = searchParams.get('passcode')

    if (!passcode) {
      return NextResponse.json({ valid: false, error: 'Нууц үг хоосон байна.' }, { status: 400 })
    }

    const valid = await db.verifyAdminPasscode(passcode)
    if (!valid) {
      return NextResponse.json({ valid: false, error: 'Нууц код буруу байна.' }, { status: 401 })
    }

    return NextResponse.json({ valid: true })
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err.message }, { status: 500 })
  }
}

