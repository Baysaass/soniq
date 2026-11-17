import fs from 'fs'
import path from 'path'
import os from 'os'
import crypto from 'crypto'
import {
  BonumGatewayClient,
  BonumClient,
  verifyWebhookChecksum,
  parseWebhookEvent,
  BonumError,
} from '@mongolian-payment/bonum'
import type {
  PaymentProvider,
  InvoiceItem,
  WebhookEvent,
} from '@mongolian-payment/bonum'
import type { Order } from './orders-db'
import { getStoreSettings } from './settings-db'

// On Vercel / serverless, process.cwd() is read-only (/var/task), while os.tmpdir() (/tmp) is writable!
function getTokensCacheFile(): string {
  try {
    const tmp = os.tmpdir()
    if (tmp && fs.existsSync(tmp)) {
      return path.join(tmp, '.bonum-tokens.json')
    }
  } catch {}
  return path.join(process.cwd(), 'data', '.bonum-tokens.json')
}

export interface BonumTokenData {
  accessToken: string
  refreshToken: string
  expiresAt: number
  refreshExpiresAt: number
}

// Global in-memory token and client holders across serverless warm invocations
const globalForBonum = globalThis as unknown as {
  bonumClient?: BonumGatewayClient
  bonumPspClient?: BonumClient
  bonumTokens?: BonumTokenData
}

function loadTokenCache(): BonumTokenData | null {
  if (globalForBonum.bonumTokens && globalForBonum.bonumTokens.expiresAt > Date.now()) {
    return globalForBonum.bonumTokens
  }
  const cacheFile = getTokensCacheFile()
  try {
    if (fs.existsSync(cacheFile)) {
      const content = fs.readFileSync(cacheFile, 'utf-8').trim()
      if (content) {
        const parsed: BonumTokenData = JSON.parse(content)
        if (parsed.accessToken && parsed.expiresAt > Date.now()) {
          globalForBonum.bonumTokens = parsed
          return parsed
        }
      }
    }
  } catch (err) {
    // Non-fatal cache read error
  }
  return null
}

function saveTokenCache(data: BonumTokenData) {
  globalForBonum.bonumTokens = data
  try {
    const cacheFile = getTokensCacheFile()
    const dir = path.dirname(cacheFile)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    // Non-fatal cache write error
  }
}

export function getBonumCredentials() {
  const settings = getStoreSettings()
  const cfg = settings?.bonumConfig

  const baseUrl =
    process.env.BONUM_GATEWAY_BASE_URL ||
    cfg?.baseUrl ||
    'https://apis.bonum.mn'
  const appSecret =
    process.env.BONUM_APP_SECRET ||
    cfg?.appSecret ||
    '1fc53f9389f489ff6e04617bd6338a710e1e7c579cb572aec421f560f363119c0e0039e4b765e53c5339c1e6c7727985e5553f3a743f04e0c4ef0a954175b70d3bfd65f9338ee179b604e7abe9c14cf3'
  const terminalId =
    process.env.BONUM_TERMINAL_ID ||
    cfg?.terminalId ||
    '17173368'
  const checksumKey =
    process.env.BONUM_MERCHANT_CHECKSUM_KEY ||
    cfg?.checksumKey ||
    '4b0ba84726106abb9f82bde99a7c321211d655ef4a292d58ef4609f7cc829d93'
  const merchant =
    process.env.BONUM_MERCHANT ||
    cfg?.merchant ||
    'BAYSAASS'
  const endpoint =
    process.env.BONUM_ENDPOINT ||
    cfg?.endpoint ||
    'https://psp.bonum.mn'
  const enabled =
    process.env.NEXT_PUBLIC_BONUM_ENABLED !== 'false' &&
    (cfg?.enabled ?? true)

  return {
    baseUrl,
    appSecret,
    terminalId,
    checksumKey,
    merchant,
    endpoint,
    enabled,
  }
}

/**
 * Get or initialize the singleton BonumGatewayClient with token persistence
 */
export function getBonumGatewayClient(): BonumGatewayClient {
  const creds = getBonumCredentials()

  if (!globalForBonum.bonumClient) {
    const client = new BonumGatewayClient({
      baseUrl: creds.baseUrl,
      appSecret: creds.appSecret,
      terminalId: creds.terminalId,
      checksumKey: creds.checksumKey,
      acceptLanguage: 'mn',
    })

    // Hydrate existing cached token
    const cached = loadTokenCache()
    if (cached) {
      ;(client as any).accessToken = cached.accessToken
      ;(client as any).refreshToken = cached.refreshToken
      ;(client as any).tokenExpiresAt = cached.expiresAt
      ;(client as any).refreshExpiresAt = cached.refreshExpiresAt
    }

    // Intercept setTokens to automatically persist tokens
    const originalSetTokens = (client as any).setTokens.bind(client)
    ;(client as any).setTokens = (data: any) => {
      originalSetTokens(data)
      const now = Date.now()
      const expiresAt = now + (data.expiresIn || 1800) * 1000 - 60000
      const refreshExpiresAt = now + (data.refreshExpiresIn || 2000) * 1000 - 60000
      saveTokenCache({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt,
        refreshExpiresAt,
      })
    }

    globalForBonum.bonumClient = client
  }

  return globalForBonum.bonumClient
}

/**
 * Get PSP client for Apple Pay / Google Pay operations
 */
export function getBonumPspClient(): BonumClient {
  const creds = getBonumCredentials()
  if (!globalForBonum.bonumPspClient) {
    globalForBonum.bonumPspClient = new BonumClient({
      endpoint: creds.endpoint,
      merchantKey: creds.appSecret,
    })
  }
  return globalForBonum.bonumPspClient
}

/**
 * Create a Web-Payment Invoice with Bonum Gateway
 * Supports QPay, Domestic/International cards, Apple Pay (via Bonum checkout page)
 */
export async function createBonumInvoice(params: {
  order: Order
  siteUrl?: string
  expiresInSeconds?: number
  transactionId?: string
}): Promise<{
  invoiceId: string
  followUpLink: string
}> {
  const { order } = params
  const client = getBonumGatewayClient()
  const siteUrl = params.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.soniq.click'
  const transactionId = (
    params.transactionId || `${order.id}_${Date.now().toString(36)}`
  ).slice(0, 60)
  const callbackUrl = `${siteUrl}/api/bonum/callback?orderId=${encodeURIComponent(order.id)}&txn=${encodeURIComponent(transactionId)}`

  // Format line items with required fields (title, amount, count, remark, image)
  // Bonum MySQL table constraints: c_title <= 100, c_remark <= 100, c_img <= 1000
  const items: InvoiceItem[] = (order.items || []).map((it) => {
    let imgUrl = (it.image || '').trim()

    // Guard against data URI base64 images which crash Bonum's database column (Data truncation)
    if (imgUrl.startsWith('data:') || imgUrl.length > 500) {
      imgUrl = ''
    } else if (imgUrl && !imgUrl.startsWith('http://') && !imgUrl.startsWith('https://')) {
      imgUrl = `${siteUrl}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
    }

    const title = (it.title || 'Soniq Digital Pack').trim().slice(0, 80) || 'Soniq Digital Pack'
    const remark = (it.title || 'Soniq Store').trim().slice(0, 80) || 'Soniq Store'
    const amount = Math.max(0, Math.round(Number(it.price) || 0))
    const count = Math.max(1, Math.round(Number(it.quantity) || 1))

    return {
      title,
      amount,
      count,
      remark,
      image: imgUrl || undefined,
    }
  })

  const invoiceAmount = Math.max(1, Math.round(order.totalAmountMNT || 0))

  // If no items, generate a single item for the total
  if (items.length === 0) {
    items.push({
      title: `Soniq Захиалга ${order.id}`.slice(0, 80),
      amount: invoiceAmount,
      count: 1,
      remark: 'Soniq Store',
    })
  }

  try {
    const res = await client.createInvoice({
      amount: invoiceAmount,
      callback: callbackUrl,
      transactionId,
      expiresIn: params.expiresInSeconds || 3600, // 1 hour expiry
      items,
      // Note: Omit 'extras' to prevent Jackson deserialization issues on Bonum backend.
      // Customer email is already persisted and managed in our store database.
    })

    return {
      invoiceId: res.invoiceId,
      followUpLink: res.followUpLink,
    }
  } catch (error: any) {
    console.error('[Bonum] createInvoice failed:', error?.message, error?.response || '')
    throw error
  }
}

/**
 * Create a QPay QR Payment with bank deeplinks (Khan Bank, Golomt, State Bank, Trade and Development Bank, etc.)
 */
export async function createBonumQr(params: {
  order: Order
  expiresInSeconds?: number
  transactionId?: string
}): Promise<{
  invoiceId: string
  qrCode: string
  qrImage: string
  links: Array<{
    name: string
    link: string
    logo?: string
    appStoreId?: string
    androidPackageName?: string
  }>
}> {
  const { order } = params
  const client = getBonumGatewayClient()
  const amount = Math.max(1, Math.round(order.totalAmountMNT || 0))
  const transactionId = (
    params.transactionId || `${order.id}_${Date.now().toString(36)}`
  ).slice(0, 60)

  try {
    const res = await client.createQr({
      amount,
      transactionId,
      expiresIn: params.expiresInSeconds || 3600,
    })

    return res
  } catch (error: any) {
    console.error('[Bonum] createQr failed:', error?.message, error?.response || '')
    throw error
  }
}

/**
 * Verify Bonum Webhook Signature
 * Uses `x-checksum-v2` header: HmacSHA256(rawBody, checksumKey)
 */
export function verifyBonumWebhookSignature(
  rawBody: string,
  checksumHeader: string | null | undefined
): boolean {
  if (!checksumHeader || !rawBody) return false
  const creds = getBonumCredentials()
  const key = creds.checksumKey
  if (!key) return false

  // 1. Try SDK's verification helper
  try {
    if (verifyWebhookChecksum(rawBody, checksumHeader, key)) {
      return true
    }
  } catch (err) {
    console.warn('[Bonum] SDK checksum check threw:', err)
  }

  // 2. Fallback manual HMAC-SHA256 hex comparison with timing safe equal
  try {
    const computed = crypto.createHmac('sha256', key).update(rawBody).digest('hex')
    const headerClean = checksumHeader.trim().toLowerCase()
    const computedBuf = Buffer.from(computed.toLowerCase())
    const headerBuf = Buffer.from(headerClean)
    if (computedBuf.length === headerBuf.length) {
      return crypto.timingSafeEqual(computedBuf, headerBuf)
    }
  } catch (err) {
    console.error('[Bonum] Manual HMAC check failed:', err)
  }

  return false
}

/**
 * Parse a raw Bonum webhook body into typed WebhookEvent
 */
export function parseBonumWebhookPayload(rawBody: string): WebhookEvent<any> {
  try {
    return parseWebhookEvent(rawBody)
  } catch {
    return JSON.parse(rawBody)
  }
}

/**
 * Request Card Tokenization (Save Card for future purchases or subscription)
 */
export async function requestBonumCardToken(params: {
  transactionId: string
  callbackUrl: string
  paymentAmount?: number
  items?: InvoiceItem[]
}): Promise<{
  id: string
  followUpLink: string
}> {
  const client = getBonumGatewayClient()
  const res = await client.requestCardToken({
    transactionId: params.transactionId,
    callback: params.callbackUrl,
    payment: params.paymentAmount ? { amount: Math.round(params.paymentAmount) } : undefined,
    items: params.items,
  })
  return res
}

/**
 * Charge a stored card token
 */
export async function purchaseWithBonumCardToken(params: {
  cardToken: string
  amount: number
  transactionId: string
  currency?: string
}) {
  const client = getBonumGatewayClient()
  return client.purchaseWithCardToken({
    cardToken: params.cardToken,
    amount: Math.round(params.amount),
    transactionId: params.transactionId,
    currency: params.currency || 'MNT',
  })
}

/**
 * List merchant's active subscription plans
 */
export async function listBonumSubscriptionPlans() {
  const client = getBonumGatewayClient()
  return client.listPaymentPlans()
}

/**
 * Subscribe a stored card token to a plan
 */
export async function subscribeBonumPlan(params: {
  cardToken: string
  planId: number
  cycleValue: number
  cycles?: number | null
  payNow?: boolean
  custEmail?: string
}) {
  const client = getBonumGatewayClient()
  return client.subscribe(params)
}

