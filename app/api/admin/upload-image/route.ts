import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { isR2Configured, getR2Client, getEffectiveR2Config } from '@/lib/r2-client'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getStoreSettings } from '@/lib/settings-db'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let passcode = req.headers.get('x-admin-passcode') || ''
    let buffer: Buffer | null = null
    let filename = `product-${Date.now()}.webp`
    let dataUrl = ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const codeField = formData.get('passcode')
      if (codeField && typeof codeField === 'string') {
        passcode = codeField
      }
      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json({ error: 'Зургийн файл олдсонгүй' }, { status: 400 })
      }
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      if (file.name) {
        const clean = file.name.replace(/[^a-zA-Z0-9_.-]/g, '-')
        filename = clean.endsWith('.webp') ? clean : `${clean}.webp`
      }
    } else {
      const body = await req.json()
      if (body.passcode) passcode = body.passcode
      if (body.filename) filename = body.filename
      if (body.dataUrl) {
        dataUrl = body.dataUrl
        const base64Data = body.dataUrl.replace(/^data:image\/\w+;base64,/, '')
        buffer = Buffer.from(base64Data, 'base64')
      }
    }

    // Verify admin passcode
    const settings = getStoreSettings()
    const validPasscode = settings.adminPasscode || process.env.ADMIN_PASSCODE || 'Amirda700+'
    if (!passcode || passcode.trim() !== validPasscode.trim()) {
      return NextResponse.json({ error: 'Админ нууц код буруу байна' }, { status: 401 })
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: 'Зургийн өгөгдөл хоосон байна' }, { status: 400 })
    }

    // 1. If Cloudflare R2 is configured, upload directly to R2
    if (await isR2Configured()) {
      const s3 = await getR2Client()
      const r2Cfg = await getEffectiveR2Config()
      if (s3 && r2Cfg.bucketName) {
        const objectKey = `images/products/${filename}`
        await s3.send(
          new PutObjectCommand({
            Bucket: r2Cfg.bucketName,
            Key: objectKey,
            Body: buffer,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000, immutable',
          })
        )

        // Construct public URL
        let publicUrl = ''
        if (r2Cfg.publicDomain) {
          const domain = r2Cfg.publicDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '')
          publicUrl = `https://${domain}/${objectKey}`
        } else {
          publicUrl = `/api/r2/image?key=${encodeURIComponent(objectKey)}`
        }

        return NextResponse.json({
          success: true,
          url: publicUrl,
          filename,
          storage: 'r2',
          sizeBytes: buffer.length,
        })
      }
    }

    // 2. If Supabase is configured, upload to Supabase Storage (Free 1GB global CDN)
    try {
      const { getSupabaseClient } = await import('@/lib/db/supabase')
      const supabase = getSupabaseClient()
      if (supabase) {
        const bucket = 'product-images'
        let { error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(filename, buffer, {
            contentType: 'image/webp',
            cacheControl: '31536000',
            upsert: true,
          })

        // If bucket doesn't exist, create it and retry
        if (uploadErr && (uploadErr.message?.toLowerCase().includes('not found') || uploadErr.message?.toLowerCase().includes('bucket'))) {
          await supabase.storage.createBucket(bucket, { public: true }).catch(() => null)
          const retry = await supabase.storage
            .from(bucket)
            .upload(filename, buffer, {
              contentType: 'image/webp',
              cacheControl: '31536000',
              upsert: true,
            })
          uploadErr = retry.error
        }

        if (!uploadErr) {
          const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filename)

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: publicUrlData.publicUrl,
              filename,
              storage: 'supabase',
              sizeBytes: buffer.length,
            })
          }
        }
      }
    } catch (sbStorageErr) {
      console.warn('Supabase storage upload skipped or failed:', sbStorageErr)
    }

    // 3. In local development environment, write to public/uploads directory
    if (process.env.NODE_ENV === 'development') {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }
        const filePath = path.join(uploadsDir, filename)
        fs.writeFileSync(filePath, buffer)

        return NextResponse.json({
          success: true,
          url: `/uploads/${filename}`,
          filename,
          storage: 'local',
          sizeBytes: buffer.length,
        })
      } catch (fsErr) {
        // Fall back to data URL
      }
    }

    // 4. In serverless / read-only filesystem environments, return optimized WebP DataURL
    const returnDataUrl = dataUrl || `data:image/webp;base64,${buffer.toString('base64')}`
    return NextResponse.json({
      success: true,
      url: returnDataUrl,
      filename,
      storage: 'data-url',
      sizeBytes: buffer.length,
    })
  } catch (err: any) {
    console.error('Image upload error:', err)
    return NextResponse.json(
      { error: err?.message || 'Зураг хуулахад алдаа гарлаа' },
      { status: 500 }
    )
  }
}
