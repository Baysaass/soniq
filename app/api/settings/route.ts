import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const settings = await db.getSettings()
    // Do not leak adminPasscode in public GET, but return all bank info, social, announcement
    const { adminPasscode, ...publicSettings } = settings
    return NextResponse.json({
      success: true,
      settings: publicSettings,
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
