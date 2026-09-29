import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendTelegramTestMessage } from '@/lib/telegram'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { passcode, botToken, chatId } = body

    const isAuthorized = await db.verifyAdminPasscode(passcode || '')
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Нууц код буруу байна.' }, { status: 401 })
    }

    if (!botToken || !botToken.trim()) {
      return NextResponse.json({ success: false, error: 'Telegram Bot Token-оо оруулна уу.' }, { status: 400 })
    }

    if (!chatId || !chatId.trim()) {
      return NextResponse.json({ success: false, error: 'Telegram Chat ID-гаа оруулна уу.' }, { status: 400 })
    }

    const result = await sendTelegramTestMessage(botToken.trim(), chatId.trim())

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Тест мессеж амжилттай илгээгдлээ! Telegram-аа шалгана уу.',
    })
  } catch (err: any) {
    console.error('Telegram test route error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Серверийн алдаа гарлаа.' },
      { status: 500 }
    )
  }
}
