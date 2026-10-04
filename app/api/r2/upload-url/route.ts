import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isR2Configured, generatePresignedUploadUrl } from '@/lib/r2-client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { filename, contentType, fileSize, category, passcode, r2Config } = body

    const isAuthorized = await db.verifyAdminPasscode(passcode || '')
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Хандах эрхгүй: Админ нууц код буруу байна.' },
        { status: 401 }
      )
    }

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json(
        { error: 'Файлын нэр шаардлагатай.' },
        { status: 400 }
      )
    }

    const configured = await isR2Configured(r2Config)
    if (!configured) {
      return NextResponse.json(
        {
          error: 'Cloudflare R2 тохируулаагүй байна. Админ "Тохиргоо" цэснээс R2 Account ID, Access Key оруулна уу.',
          needsConfig: true,
        },
        { status: 400 }
      )
    }

    const prefix = category ? `packs/${category}` : 'packs'
    const result = await generatePresignedUploadUrl({
      filename,
      contentType: contentType || 'application/octet-stream',
      fileSize: Number(fileSize) || undefined,
      prefix,
      expiresInSeconds: 3600, // 1 hour for large file upload
      r2Config,
    })

    return NextResponse.json({
      success: true,
      presignedUrl: result.presignedUrl,
      key: result.key,
      bucketName: result.bucketName,
      publicUrl: result.publicUrl,
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json(
      { error: error.message || 'Presigned URL үүсгэхэд алдаа гарлаа.' },
      { status: 500 }
    )
  }
}
