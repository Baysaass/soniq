import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const passcode = searchParams.get('passcode')

  const isAuthorized = await db.verifyAdminPasscode(passcode || '')
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await db.getSettings()
  return NextResponse.json({ settings })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { passcode, defaultWeTransferLink, links } = body

    const isAuthorized = await db.verifyAdminPasscode(passcode || '')
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.saveSettings({
      defaultWeTransferLink: defaultWeTransferLink || '',
      ...links,
    })

    const updated = await db.getSettings()
    return NextResponse.json({ success: true, settings: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
