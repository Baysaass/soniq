import { NextRequest, NextResponse } from 'next/server'
import { getR2Client, getEffectiveR2Config, isR2Configured } from '@/lib/r2-client'
import { GetObjectCommand } from '@aws-sdk/client-s3'

export const dynamic = 'force-dynamic'

/**
 * High-performance image streaming proxy for Cloudflare R2 images.
 * Solves the issue where R2 S3 endpoints (*.r2.cloudflarestorage.com) return 401 when accessed directly by browsers.
 * This endpoint fetches the image from R2 using backend credentials and streams it to the browser
 * with 1-year immutable caching.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    let key = searchParams.get('key') || searchParams.get('url') || ''

    if (!key) {
      return NextResponse.json({ error: 'Зургийн түлхүүр дутуу байна.' }, { status: 400 })
    }

    // If key is a full URL, extract the path part:
    // e.g. "https://soniq-store.7f88a4551fd0f8b0d9d22fd6db314f23.r2.cloudflarestorage.com/images/products/foo.webp"
    // -> "images/products/foo.webp"
    if (key.startsWith('http://') || key.startsWith('https://')) {
      try {
        const parsed = new URL(key)
        key = parsed.pathname.replace(/^\/+/, '')
      } catch {
        // use key as is
      }
    }

    const cleanKey = decodeURIComponent(key).replace(/^\/+/, '')

    const configured = await isR2Configured()
    if (!configured) {
      return NextResponse.json({ error: 'Cloudflare R2 тохируулагдаагүй байна.' }, { status: 404 })
    }

    const s3 = await getR2Client()
    const r2Cfg = await getEffectiveR2Config()
    if (!s3 || !r2Cfg.bucketName) {
      return NextResponse.json({ error: 'R2 холболт үүсгэж чадсангүй.' }, { status: 500 })
    }

    let finalKey = cleanKey
    if (r2Cfg.bucketName && finalKey.startsWith(r2Cfg.bucketName + '/')) {
      finalKey = finalKey.slice(r2Cfg.bucketName.length + 1)
    }

    let getRes: any = null
    try {
      getRes = await s3.send(
        new GetObjectCommand({
          Bucket: r2Cfg.bucketName,
          Key: finalKey,
        })
      )
    } catch (tryErr: any) {
      // If not found and key doesn't start with images/products/, try with prefix
      if (!finalKey.startsWith('images/products/')) {
        try {
          getRes = await s3.send(
            new GetObjectCommand({
              Bucket: r2Cfg.bucketName,
              Key: `images/products/${finalKey}`,
            })
          )
        } catch {
          // Ignore
        }
      }
    }

    if (!getRes || !getRes.Body) {
      return NextResponse.redirect(new URL('/images/product-morph-3d.png', req.url))
    }

    let contentType = getRes.ContentType || ''
    if (!contentType || contentType === 'application/octet-stream') {
      const lower = finalKey.toLowerCase()
      if (lower.endsWith('.webp')) contentType = 'image/webp'
      else if (lower.endsWith('.png')) contentType = 'image/png'
      else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) contentType = 'image/jpeg'
      else if (lower.endsWith('.gif')) contentType = 'image/gif'
      else if (lower.endsWith('.svg')) contentType = 'image/svg+xml'
      else contentType = 'image/webp'
    }

    // Convert AWS SDK stream to web stream
    const webStream = getRes.Body.transformToWebStream
      ? getRes.Body.transformToWebStream()
      : (getRes.Body as any)

    const responseHeaders = new Headers()
    responseHeaders.set('Content-Type', contentType)
    responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable')
    if (getRes.ContentLength) {
      responseHeaders.set('Content-Length', String(getRes.ContentLength))
    }
    if (getRes.ETag) {
      responseHeaders.set('ETag', getRes.ETag)
    }

    return new Response(webStream, {
      status: 200,
      headers: responseHeaders,
    })
  } catch (err: any) {
    console.error('R2 image proxy error:', err)
    return NextResponse.redirect(new URL('/images/product-morph-3d.png', req.url))
  }
}
