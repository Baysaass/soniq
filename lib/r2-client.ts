import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { db } from './db'
import { localDB } from './db/local'
import { getStoreSettings, R2Config, setInMemorySettings } from './settings-db'

export type { R2Config }

let inMemoryR2ConfigCache: R2Config | null = null
let inMemoryR2ConfigTimestamp = 0
const R2_CONFIG_CACHE_TTL = 15_000 // 15 seconds cache

export function invalidateR2ConfigCache() {
  inMemoryR2ConfigCache = null
  inMemoryR2ConfigTimestamp = 0
}

/**
 * Resolves the active Cloudflare R2 configuration.
 * Priority:
 * 1. Explicit override passed in call
 * 2. Active Cloud Database (Supabase / Postgres)
 * 3. Local DB storage (fallback)
 * 4. Process environment variables
 */
export async function getEffectiveR2Config(override?: Partial<R2Config>): Promise<R2Config> {
  // If caller provided full credentials, use them directly
  if (
    override?.accountId?.trim() &&
    override?.accessKeyId?.trim() &&
    override?.secretAccessKey?.trim() &&
    override?.bucketName?.trim()
  ) {
    return {
      accountId: override.accountId.trim(),
      accessKeyId: override.accessKeyId.trim(),
      secretAccessKey: override.secretAccessKey.trim(),
      bucketName: override.bucketName.trim(),
      publicDomain: override.publicDomain !== undefined ? override.publicDomain.trim() : (process.env.R2_PUBLIC_DOMAIN || ''),
    }
  }

  const now = Date.now()
  let cfg: R2Config = {
    accountId: '',
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: 'soniq-store',
    publicDomain: '',
  }

  if (inMemoryR2ConfigCache && (now - inMemoryR2ConfigTimestamp < R2_CONFIG_CACHE_TTL)) {
    cfg = inMemoryR2ConfigCache
  } else {
    try {
      const settings = await db.getSettings()
      if (settings?.r2Config && (settings.r2Config.accountId || settings.r2Config.accessKeyId)) {
        cfg = settings.r2Config
      } else {
        const local = localDB.getSettings()
        if (local?.r2Config) cfg = local.r2Config
      }
      inMemoryR2ConfigCache = cfg
      inMemoryR2ConfigTimestamp = now
      if (settings) {
        setInMemorySettings(settings)
      }
    } catch (err) {
      console.error('getEffectiveR2Config error fetching from db, falling back to local:', err)
      const local = localDB.getSettings()
      if (local?.r2Config) cfg = local.r2Config
    }
  }

  return {
    accountId: override?.accountId?.trim() || process.env.R2_ACCOUNT_ID || cfg.accountId || '',
    accessKeyId: override?.accessKeyId?.trim() || process.env.R2_ACCESS_KEY_ID || cfg.accessKeyId || '',
    secretAccessKey: override?.secretAccessKey?.trim() || process.env.R2_SECRET_ACCESS_KEY || cfg.secretAccessKey || '',
    bucketName: override?.bucketName?.trim() || process.env.R2_BUCKET_NAME || cfg.bucketName || 'soniq-store',
    publicDomain: override?.publicDomain !== undefined ? override.publicDomain.trim() : (process.env.R2_PUBLIC_DOMAIN || cfg.publicDomain || ''),
  }
}

/**
 * Synchronous fallback for legacy or sync callers
 */
export function getEffectiveR2ConfigSync(override?: Partial<R2Config>): R2Config {
  const local = inMemoryR2ConfigCache || localDB.getSettings()?.r2Config || {
    accountId: '',
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: 'soniq-store',
    publicDomain: '',
  }
  return {
    accountId: override?.accountId?.trim() || process.env.R2_ACCOUNT_ID || local.accountId || '',
    accessKeyId: override?.accessKeyId?.trim() || process.env.R2_ACCESS_KEY_ID || local.accessKeyId || '',
    secretAccessKey: override?.secretAccessKey?.trim() || process.env.R2_SECRET_ACCESS_KEY || local.secretAccessKey || '',
    bucketName: override?.bucketName?.trim() || process.env.R2_BUCKET_NAME || local.bucketName || 'soniq-store',
    publicDomain: override?.publicDomain !== undefined ? override.publicDomain.trim() : (process.env.R2_PUBLIC_DOMAIN || local.publicDomain || ''),
  }
}

export async function isR2Configured(override?: Partial<R2Config>): Promise<boolean> {
  const cfg = await getEffectiveR2Config(override)
  return Boolean(cfg.accountId && cfg.accessKeyId && cfg.secretAccessKey && cfg.bucketName)
}

export function isR2ConfiguredSync(override?: Partial<R2Config>): boolean {
  const cfg = getEffectiveR2ConfigSync(override)
  return Boolean(cfg.accountId && cfg.accessKeyId && cfg.secretAccessKey && cfg.bucketName)
}

export async function getR2Client(override?: Partial<R2Config>): Promise<S3Client | null> {
  const configured = await isR2Configured(override)
  if (!configured) {
    return null
  }
  const cfg = await getEffectiveR2Config(override)

  return new S3Client({
    region: 'auto',
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  })
}

/**
 * Tests connection to the Cloudflare R2 bucket
 */
export async function testR2Connection(override?: Partial<R2Config>): Promise<{ success: boolean; message: string; bucketName?: string }> {
  const cfg = await getEffectiveR2Config(override)
  if (!(await isR2Configured(override))) {
    return {
      success: false,
      message: 'Cloudflare R2 мэдээлэл дутуу байна (Account ID, Access Key ID, Secret Access Key, Bucket Name шаардлагатай).',
    }
  }

  const s3 = await getR2Client(override)
  if (!s3) {
    return { success: false, message: 'S3 Client үүсгэхэд алдаа гарлаа.' }
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: cfg.bucketName,
      MaxKeys: 1,
    })
    await s3.send(command)
    return {
      success: true,
      message: `Cloudflare R2 санд амжилттай холбогдлоо! ("${cfg.bucketName}" bucket бэлэн)`,
      bucketName: cfg.bucketName,
    }
  } catch (err: unknown) {
    const error = err as any
    const errCode = error?.name || error?.code || ''
    const errMsg = error?.message || ''

    if (errCode === 'NoSuchBucket' || errMsg.includes('specified bucket does not exist')) {
      return {
        success: false,
        message: `R2 Bucket "${cfg.bucketName}" олдсонгүй! Cloudflare дээр үүсгэсэн Token-ий нэр биш, Bucket-ийн жинхэнэ нэрийг (жишээ нь: "soniq-store") оруулсан эсэхээ шалгана уу.`,
      }
    }

    if (errCode === 'SignatureDoesNotMatch') {
      return {
        success: false,
        message: 'R2 Secret Access Key тохирохгүй байна. Түлхүүрээ бүтнээр нь (64 тэмдэгт) зөв хуулсан эсэхээ шалгана уу.',
      }
    }

    if (errCode === 'InvalidAccessKeyId') {
      return {
        success: false,
        message: 'R2 Access Key ID буруу байна. Cloudflare дээрх Access Key ID-гаа шалгана уу.',
      }
    }

    if (errCode === 'Unauthorized' || errMsg.includes('Unauthorized')) {
      return {
        success: false,
        message: 'R2 Token хүчингүй байна (401 Unauthorized). Хэрэв та хуучин токеноо устгасан бол Cloudflare дээр шинээр үүсгэсэн Token-ийн Access Key ID болон Secret Access Key-ээ "Тохиргоо" цэсэнд оруулж хадгална уу.',
      }
    }

    return {
      success: false,
      message: `R2 холболт амжилтгүй: ${errMsg || 'Нэвтрэх эрх эсвэл bucket нэр буруу байна.'}`,
    }
  }
}

/**
 * Generate a Presigned Upload URL for direct browser-to-R2 upload (Up to 5GB per object)
 */
export async function generatePresignedUploadUrl(params: {
  filename: string
  contentType?: string
  fileSize?: number
  prefix?: string
  expiresInSeconds?: number
  r2Config?: Partial<R2Config>
}): Promise<{
  presignedUrl: string
  key: string
  bucketName: string
  publicUrl?: string
}> {
  const cfg = await getEffectiveR2Config(params.r2Config)
  const s3 = await getR2Client(params.r2Config)

  if (!s3 || !(await isR2Configured(params.r2Config))) {
    throw new Error('Cloudflare R2 тохируулаагүй байна. Админ тохиргооноос R2 мэдээллийг оруулна уу.')
  }

  const sanitized = params.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const prefix = params.prefix || 'packs'
  const key = `${prefix}/${Date.now()}_${sanitized}`

  const command = new PutObjectCommand({
    Bucket: cfg.bucketName,
    Key: key,
  })

  const presignedUrl = await getSignedUrl(s3, command, {
    expiresIn: params.expiresInSeconds || 3600, // 1 hour
  })

  let publicUrl = ''
  if (cfg.publicDomain) {
    const domain = cfg.publicDomain.replace(/\/$/, '')
    publicUrl = `${domain}/${key}`
  }

  return {
    presignedUrl,
    key,
    bucketName: cfg.bucketName,
    publicUrl: publicUrl || undefined,
  }
}

/**
 * Generate a Presigned Download URL for customer or admin (Zero egress fee, high speed)
 */
export async function generatePresignedDownloadUrl(params: {
  key: string
  downloadFilename?: string
  expiresInSeconds?: number
  r2Config?: Partial<R2Config>
}): Promise<{
  downloadUrl: string
  key: string
  expiresInSeconds: number
}> {
  const cfg = await getEffectiveR2Config(params.r2Config)
  const s3 = await getR2Client(params.r2Config)

  if (!s3 || !(await isR2Configured(params.r2Config))) {
    throw new Error('Cloudflare R2 тохируулаагүй байна.')
  }

  const expiresIn = params.expiresInSeconds || 86400 // 24 hours default

  const filename = params.downloadFilename || params.key.split('/').pop() || 'soniq-pack.zip'

  const command = new GetObjectCommand({
    Bucket: cfg.bucketName,
    Key: params.key,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
  })

  const downloadUrl = await getSignedUrl(s3, command, {
    expiresIn,
  })

  return {
    downloadUrl,
    key: params.key,
    expiresInSeconds: expiresIn,
  }
}

/**
 * List files in the R2 bucket
 */
export async function listR2Objects(prefix = 'packs/'): Promise<
  Array<{
    key: string
    size: number
    sizeFormatted: string
    lastModified?: string
  }>
> {
  const cfg = await getEffectiveR2Config()
  const s3 = await getR2Client()

  if (!s3 || !(await isR2Configured())) {
    return []
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: cfg.bucketName,
      Prefix: prefix,
      MaxKeys: 100,
    })
    const response = await s3.send(command)

    if (!response.Contents) return []

    return response.Contents.map((item) => {
      const sizeBytes = item.Size || 0
      let sizeFormatted = `${sizeBytes} B`
      if (sizeBytes > 1024 * 1024 * 1024) {
        sizeFormatted = `${(sizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
      } else if (sizeBytes > 1024 * 1024) {
        sizeFormatted = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      } else if (sizeBytes > 1024) {
        sizeFormatted = `${(sizeBytes / 1024).toFixed(0)} KB`
      }

      return {
        key: item.Key || '',
        size: sizeBytes,
        sizeFormatted,
        lastModified: item.LastModified?.toISOString(),
      }
    })
  } catch (err) {
    console.error('Failed to list R2 objects:', err)
    return []
  }
}
