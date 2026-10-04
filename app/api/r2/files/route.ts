import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isR2Configured, listR2Objects } from '@/lib/r2-client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const passcode = searchParams.get('passcode')
    const prefix = searchParams.get('prefix') || 'packs/'

    const isAuthorized = await db.verifyAdminPasscode(passcode || '')
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 })
    }

    if (!(await isR2Configured())) {
      return NextResponse.json({ files: [], configured: false })
    }

    const files = await listR2Objects(prefix)
    return NextResponse.json({ files, configured: true })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
