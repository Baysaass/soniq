import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const status = await db.getStatus()
    return NextResponse.json(status)
  } catch (err: any) {
    return NextResponse.json(
      { connected: false, message: err.message || 'DB алдаа' },
      { status: 500 }
    )
  }
}
