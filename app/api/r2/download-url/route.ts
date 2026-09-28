import { NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/settings-db'
import { getOrderById } from '@/lib/orders-db'
import { isR2Configured, generatePresignedDownloadUrl } from '@/lib/r2-client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { key, filename, orderId, passcode } = body

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'File key шаардлагатай.' }, { status: 400 })
    }

    const settings = getStoreSettings()

    // Verification check: Either admin passcode is valid, or order is approved
    let isAuthorized = false

    if (passcode && passcode === settings.adminPasscode) {
      isAuthorized = true
    } else if (orderId) {
      const order = getOrderById(orderId)
      if (order && order.status === 'APPROVED') {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Хандах эрхгүй эсвэл захиалга хараахан баталгаажаагүй байна.' },
        { status: 403 }
      )
    }

    if (!isR2Configured()) {
      return NextResponse.json(
        { error: 'Cloudflare R2 тохируулаагүй байна.' },
        { status: 400 }
      )
    }

    const result = await generatePresignedDownloadUrl({
      key,
      downloadFilename: filename,
      expiresInSeconds: 86400, // 24 hours
    })

    return NextResponse.json({
      success: true,
      downloadUrl: result.downloadUrl,
      key: result.key,
      expiresInSeconds: result.expiresInSeconds,
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json(
      { error: error.message || 'Download URL үүсгэхэд алдаа гарлаа.' },
      { status: 500 }
    )
  }
}
