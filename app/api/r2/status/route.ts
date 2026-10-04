import { NextResponse } from 'next/server'
import { isR2Configured, testR2Connection, getEffectiveR2Config } from '@/lib/r2-client'

export async function GET() {
  try {
    const configured = await isR2Configured()
    const cfg = await getEffectiveR2Config()

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { accountId, accessKeyId, secretAccessKey, bucketName, publicDomain } = body || {}

    const override = {
      accountId: typeof accountId === 'string' ? accountId.trim() : undefined,
      accessKeyId: typeof accessKeyId === 'string' ? accessKeyId.trim() : undefined,
      secretAccessKey: typeof secretAccessKey === 'string' ? secretAccessKey.trim() : undefined,
      bucketName: typeof bucketName === 'string' ? bucketName.trim() : undefined,
      publicDomain: typeof publicDomain === 'string' ? publicDomain.trim() : undefined,
    }

    const configured = await isR2Configured(override)
    const cfg = await getEffectiveR2Config(override)

    if (!configured) {
      return NextResponse.json({
        configured: false,
        success: false,
        message: 'Cloudflare R2 мэдээлэл дутуу байна (Account ID, Access Key ID, Secret Access Key, Bucket Name шаардлагатай).',
        bucketName: cfg.bucketName || '',
      })
    }

    const testResult = await testR2Connection(override)
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
