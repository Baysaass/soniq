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
import { getStoreSettings, R2Config } from './settings-db'

export function getEffectiveR2Config(): R2Config {
  const settings = getStoreSettings()
  const cfg = settings.r2Config || {
    accountId: '',
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: 'soniq-store',
    publicDomain: '',
  }

  return {
    accountId: process.env.R2_ACCOUNT_ID || cfg.accountId || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || cfg.accessKeyId || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || cfg.secretAccessKey || '',
    bucketName: process.env.R2_BUCKET_NAME || cfg.bucketName || 'soniq-store',
    publicDomain: process.env.R2_PUBLIC_DOMAIN || cfg.publicDomain || '',
  }
}

export function isR2Configured(): boolean {
  const cfg = getEffectiveR2Config()
  return Boolean(cfg.accountId && cfg.accessKeyId && cfg.secretAccessKey && cfg.bucketName)
}

export function getR2Client(): S3Client | null {
  const cfg = getEffectiveR2Config()
  if (!isR2Configured()) {
    return null
  }

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
export async function testR2Connection(): Promise<{ success: boolean; message: string; bucketName?: string }> {
  const cfg = getEffectiveR2Config()
  if (!isR2Configured()) {
    return {
      success: false,
      message: 'Cloudflare R2 мэдээлэл дутуу байна (Account ID, Access Key, Secret Key шаардлагатай).',
    }
  }

  const s3 = getR2Client()
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
    const error = err as Error
    return {
      success: false,
      message: `R2 холболт амжилтгүй: ${error.message || 'Нэвтрэх эрх эсвэл bucket нэр буруу байна.'}`,
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
}): Promise<{
  presignedUrl: string
  key: string
  bucketName: string
  publicUrl?: string
}> {
  const cfg = getEffectiveR2Config()
  const s3 = getR2Client()

  if (!s3 || !isR2Configured()) {
    throw new Error('Cloudflare R2 тохируулаагүй байна. Админ тохиргооноос R2 мэдээллийг оруулна уу.')
  }

  const sanitized = params.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const prefix = params.prefix || 'packs'
  const key = `${prefix}/${Date.now()}_${sanitized}`

  const command = new PutObjectCommand({
    Bucket: cfg.bucketName,
    Key: key,
    ContentType: params.contentType || 'application/octet-stream',
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
}): Promise<{
  downloadUrl: string
  key: string
  expiresInSeconds: number
}> {
  const cfg = getEffectiveR2Config()
  const s3 = getR2Client()

  if (!s3 || !isR2Configured()) {
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
  const cfg = getEffectiveR2Config()
  const s3 = getR2Client()

  if (!s3 || !isR2Configured()) {
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
