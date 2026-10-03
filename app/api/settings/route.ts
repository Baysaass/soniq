import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const settings = await db.getSettings()
    const { searchParams } = new URL(req.url)
    const queryPasscode = searchParams.get('passcode')
    const headerPasscode = req.headers.get('x-admin-passcode')
    const isAuthorized = (queryPasscode || headerPasscode)
      ? await db.verifyAdminPasscode(queryPasscode || headerPasscode || '')
      : false

    if (isAuthorized) {
      const { adminPasscode, ...adminSettings } = settings
      return NextResponse.json({
        success: true,
        settings: adminSettings,
      })
    }

    // Public visitor view: strip secrets (passcode, telegram credentials, R2 secret access keys)
    const { adminPasscode, telegramBotToken, telegramChatId, r2Config, ...publicSettings } = settings
    const safeBankInfo = { ...(publicSettings.bankInfo || {}) }
    delete (safeBankInfo as any).telegramBotToken
    delete (safeBankInfo as any).telegramChatId

    return NextResponse.json({
      success: true,
      settings: {
        ...publicSettings,
        bankInfo: safeBankInfo,
      },
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { passcode, updates } = body

    const isAuthorized = await db.verifyAdminPasscode(passcode)
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Нууц код буруу байна.' }, { status: 401 })
    }

    await db.saveSettings(updates)
    const updated = await db.getSettings()
    return NextResponse.json({
      success: true,
      settings: updated,
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
