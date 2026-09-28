import { NextResponse } from 'next/server'
import { isR2Configured, testR2Connection, getEffectiveR2Config } from '@/lib/r2-client'

export async function GET() {
  try {
    const configured = isR2Configured()
    const cfg = getEffectiveR2Config()

    if (!configured) {
      return NextResponse.json({
        configured: false,
        message: 'Cloudflare R2 тохируулаагүй байна.',
        bucketName: cfg.bucketName || '',
      })
    }

    const testResult = await testR2Connection()
    return NextResponse.json({
      configured: true,
      success: testResult.success,
      message: testResult.message,
      bucketName: cfg.bucketName,
      publicDomain: cfg.publicDomain || '',
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json(
      {
        configured: false,
        success: false,
        error: error.message || 'R2 шалгахад алдаа гарлаа.',
      },
      { status: 500 }
    )
  }
}
