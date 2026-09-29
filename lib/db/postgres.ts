import { Pool } from 'pg'
import type { StoreProduct, Order, StoreSettingsType } from './types'

function getPostgresUrl(): string {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
}

export function isPostgresConfigured(): boolean {
  return Boolean(getPostgresUrl())
}

let poolInstance: Pool | null = null

export function getPostgresPool(): Pool | null {
  if (poolInstance) return poolInstance
  const connectionString = getPostgresUrl()
  if (!connectionString) return null

  try {
    poolInstance = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    })
    return poolInstance
  } catch (err) {
    console.error('Failed to initialize PostgreSQL pool:', err)
    return null
  }
}

function mapProductRow(row: any): StoreProduct {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || '',
    category: row.category || 'sfx',
    badge: row.badge || '',
    rating: Number(row.rating) || 5.0,
    reviewCount: Number(row.review_count) || 1,
    priceMNT: Number(row.price_mnt) || 0,
    originalPriceMNT: Number(row.original_price_mnt) || 0,
    priceUSD: Number(row.price_usd) || 0,
    originalPriceUSD: Number(row.original_price_usd) || 0,
    image: row.image || '/images/product-morph-3d.png',
    features: Array.isArray(row.features) ? row.features : [],
    compatibility: Array.isArray(row.compatibility) ? row.compatibility : [],
    format: row.format || 'WAV Lossless',
    fileSize: row.file_size || '',
    downloadCount: row.download_count || '',
    defaultWeTransferLink: row.default_wetransfer_link || '',
    sampleVideoUrl: row.sample_video_url || '',
    r2Key: row.r2_key || '',
    previewSoundType: row.preview_sound_type || 'whoosh',
    isBundle: Boolean(row.is_bundle),
    description: row.description || '',
  }
}

function mapOrderRow(row: any): Order {
  return {
    id: row.id,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone || '',
    customerNotes: row.customer_notes || '',
    items: Array.isArray(row.items) ? row.items : [],
    totalAmountMNT: Number(row.total_amount_mnt) || 0,
    totalAmountUSD: Number(row.total_amount_usd) || 0,
    currency: row.currency || 'MNT',
    status: row.status || 'PENDING',
    paymentMethod: row.payment_method || 'KHAN_BANK',
    transferReference: row.transfer_reference || '',
    receiptNote: row.receipt_note || '',
    weTransferLink: row.wetransfer_link || '',
    r2Key: row.r2_key || '',
    approvedAt: row.approved_at ? new Date(row.approved_at).toISOString() : null,
    adminNotes: row.admin_notes || '',
  }
}

export const postgresDB = {
  async getProducts(): Promise<StoreProduct[]> {
    const pool = getPostgresPool()
    if (!pool) return []
    try {
      const res = await pool.query('SELECT * FROM products ORDER BY created_at DESC')
      return res.rows.map(mapProductRow)
    } catch (err) {
      console.error('PostgreSQL getProducts error:', err)
      return []
    }
  },

  async getProductById(id: string): Promise<StoreProduct | null> {
    const pool = getPostgresPool()
    if (!pool) return null
    try {
      const res = await pool.query('SELECT * FROM products WHERE id = $1 LIMIT 1', [id])
      if (res.rows.length === 0) return null
      return mapProductRow(res.rows[0])
    } catch (err) {
      console.error('PostgreSQL getProductById error:', err)
      return null
    }
  },

  async getProductBySlug(slug: string): Promise<StoreProduct | null> {
    const pool = getPostgresPool()
    if (!pool) return null
    try {
      const res = await pool.query('SELECT * FROM products WHERE slug = $1 LIMIT 1', [slug])
      if (res.rows.length === 0) return null
      return mapProductRow(res.rows[0])
    } catch (err) {
      console.error('PostgreSQL getProductBySlug error:', err)
      return null
    }
  },

  async createProduct(product: Partial<StoreProduct>): Promise<StoreProduct | null> {
    const pool = getPostgresPool()
    if (!pool) return null
    try {
      const query = `
        INSERT INTO products (
          id, slug, title, subtitle, category, badge, rating, review_count,
          price_mnt, original_price_mnt, price_usd, original_price_usd, image,
          features, compatibility, format, file_size, download_count,
          default_wetransfer_link, sample_video_url, r2_key, preview_sound_type,
          is_bundle, description, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18,
          $19, $20, $21, $22,
          $23, $24, NOW(), NOW()
        ) RETURNING *
      `
      const values = [
        product.id || `prod_${Date.now()}`,
        product.slug || `pack-${Date.now()}`,
        product.title || 'Шинэ багц',
        product.subtitle || '',
        product.category || 'sfx',
        product.badge || 'NEW',
        product.rating || 5.0,
        product.reviewCount || 1,
        product.priceMNT || 29900,
        product.originalPriceMNT || 89000,
        product.priceUSD || 9.99,
        product.originalPriceUSD || 29.0,
        product.image || '/images/product-morph-3d.png',
        JSON.stringify(product.features || []),
        JSON.stringify(product.compatibility || []),
        product.format || 'WAV Lossless',
        product.fileSize || '',
        product.downloadCount || '0+ таталт',
        product.defaultWeTransferLink || '',
        product.sampleVideoUrl || '',
        product.r2Key || '',
        product.previewSoundType || 'whoosh',
        Boolean(product.isBundle),
        product.description || '',
      ]
      const res = await pool.query(query, values)
      return mapProductRow(res.rows[0])
    } catch (err: any) {
      console.error('PostgreSQL createProduct error:', err)
      throw new Error(err.message)
    }
  },

  async updateProduct(id: string, updates: Partial<StoreProduct>): Promise<StoreProduct | null> {
    const pool = getPostgresPool()
    if (!pool) return null
    try {
      const current = await this.getProductById(id)
      if (!current) return null
      const merged = { ...current, ...updates }

      const query = `
        UPDATE products SET
          slug = $2, title = $3, subtitle = $4, category = $5, badge = $6,
          price_mnt = $7, original_price_mnt = $8, price_usd = $9, original_price_usd = $10,
          image = $11, features = $12, compatibility = $13, format = $14, file_size = $15,
          default_wetransfer_link = $16, sample_video_url = $17, r2_key = $18,
          preview_sound_type = $19, is_bundle = $20, description = $21, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `
      const values = [
        id,
        merged.slug,
        merged.title,
        merged.subtitle,
        merged.category,
        merged.badge,
        merged.priceMNT,
        merged.originalPriceMNT,
        merged.priceUSD,
        merged.originalPriceUSD,
        merged.image,
        JSON.stringify(merged.features || []),
        JSON.stringify(merged.compatibility || []),
        merged.format,
        merged.fileSize,
        merged.defaultWeTransferLink,
        merged.sampleVideoUrl,
        merged.r2Key,
        merged.previewSoundType,
        Boolean(merged.isBundle),
        merged.description,
      ]
      const res = await pool.query(query, values)
      return mapProductRow(res.rows[0])
    } catch (err: any) {
      console.error('PostgreSQL updateProduct error:', err)
      throw new Error(err.message)
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    const pool = getPostgresPool()
    if (!pool) return false
    try {
      const target = (id || '').trim()
      if (!target || target === 'undefined' || target === 'null') {
        await pool.query("DELETE FROM products WHERE id = '' OR id IS NULL")
        return true
      }
      await pool.query('DELETE FROM products WHERE id = $1 OR slug = $1', [target])
      return true
    } catch (err) {
      console.error('PostgreSQL deleteProduct error:', err)
      return false
    }
  },

  async getOrders(): Promise<Order[]> {
    const pool = getPostgresPool()
    if (!pool) return []
    try {
      const res = await pool.query('SELECT * FROM orders ORDER BY created_at DESC')
      return res.rows.map(mapOrderRow)
    } catch (err) {
      console.error('PostgreSQL getOrders error:', err)
      return []
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    const pool = getPostgresPool()
    if (!pool) return null
    try {
      const res = await pool.query('SELECT * FROM orders WHERE id = $1 LIMIT 1', [id])
      if (res.rows.length === 0) return null
      return mapOrderRow(res.rows[0])
    } catch (err) {
      console.error('PostgreSQL getOrderById error:', err)
      return null
    }
  },

  async createOrder(order: Partial<Order>): Promise<Order | null> {
    const pool = getPostgresPool()
    if (!pool) return null
    const orderId = order.id || `SQ-${Math.floor(10000 + Math.random() * 90000)}`
    try {
      const query = `
        INSERT INTO orders (
          id, customer_name, customer_email, customer_phone, customer_notes,
          items, total_amount_mnt, total_amount_usd, currency, status,
          payment_method, transfer_reference, receipt_note, wetransfer_link,
          r2_key, approved_at, admin_notes, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW()
        ) RETURNING *
      `
      const values = [
        orderId,
        (order.customerName || 'Захиалагч').trim(),
        (order.customerEmail || '').trim(),
        (order.customerPhone || '').trim(),
        (order.customerNotes || '').trim(),
        JSON.stringify(order.items || []),
        Math.round(Number(order.totalAmountMNT) || 0),
        Number(order.totalAmountUSD) || 0,
        order.currency || 'MNT',
        order.status || 'PENDING',
        order.paymentMethod || 'KHAN_BANK',
        order.transferReference || orderId,
        (order.receiptNote || '').trim(),
        (order.weTransferLink || '').trim(),
        (order.r2Key || '').trim(),
        order.approvedAt || null,
        (order.adminNotes || '').trim(),
      ]
      const res = await pool.query(query, values)
      return mapOrderRow(res.rows[0])
    } catch (err: any) {
      console.error('PostgreSQL createOrder error:', err)
      throw new Error(err.message)
    }
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const pool = getPostgresPool()
    if (!pool) return null
    try {
      const current = await this.getOrderById(id)
      if (!current) return null
      const merged = { ...current, ...updates }

      const query = `
        UPDATE orders SET
          status = $2, wetransfer_link = $3, r2_key = $4,
          approved_at = $5, admin_notes = $6
        WHERE id = $1
        RETURNING *
      `
      const values = [
        id,
        merged.status,
        merged.weTransferLink,
        merged.r2Key,
        merged.approvedAt,
        merged.adminNotes,
      ]
      const res = await pool.query(query, values)
      return mapOrderRow(res.rows[0])
    } catch (err: any) {
      console.error('PostgreSQL updateOrder error:', err)
      throw new Error(err.message)
    }
  },

  async getSettings(): Promise<StoreSettingsType | null> {
    const pool = getPostgresPool()
    if (!pool) return null
    try {
      const res = await pool.query("SELECT * FROM store_settings WHERE id = 'default' LIMIT 1")
      if (res.rows.length === 0) return null
      const data = res.rows[0]
      const bankInfo = data.bank_info || {}
      return {
        storeName: data.store_name,
        subdomain: data.subdomain,
        currencyDefault: data.currency_default || 'MNT',
        adminPasscode: data.admin_passcode,
        announcementText: data.announcement_text,
        bankInfo,
        defaultBundleWeTransfer: data.default_bundle_wetransfer || '',
        r2Config: data.r2_config || {},
        telegramBotToken: bankInfo.telegramBotToken || '',
        telegramChatId: bankInfo.telegramChatId || '',
      }
    } catch (err) {
      console.error('PostgreSQL getSettings error:', err)
      return null
    }
  },

  async saveSettings(settings: Partial<StoreSettingsType>): Promise<boolean> {
    const pool = getPostgresPool()
    if (!pool) return false
    try {
      const bankInfoMerged = {
        ...(settings.bankInfo || {}),
        ...(settings.telegramBotToken !== undefined ? { telegramBotToken: settings.telegramBotToken } : {}),
        ...(settings.telegramChatId !== undefined ? { telegramChatId: settings.telegramChatId } : {}),
      }

      const query = `
        INSERT INTO store_settings (
          id, store_name, subdomain, currency_default, admin_passcode,
          announcement_text, bank_info, default_bundle_wetransfer, r2_config, updated_at
        ) VALUES ('default', $1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (id) DO UPDATE SET
          store_name = COALESCE($1, store_settings.store_name),
          subdomain = COALESCE($2, store_settings.subdomain),
          currency_default = COALESCE($3, store_settings.currency_default),
          admin_passcode = COALESCE($4, store_settings.admin_passcode),
          announcement_text = COALESCE($5, store_settings.announcement_text),
          bank_info = COALESCE($6, store_settings.bank_info),
          default_bundle_wetransfer = COALESCE($7, store_settings.default_bundle_wetransfer),
          r2_config = COALESCE($8, store_settings.r2_config),
          updated_at = NOW()
      `
      const values = [
        settings.storeName,
        settings.subdomain,
        settings.currencyDefault,
        settings.adminPasscode,
        settings.announcementText,
        JSON.stringify(bankInfoMerged),
        settings.defaultBundleWeTransfer,
        settings.r2Config ? JSON.stringify(settings.r2Config) : null,
      ]
      await pool.query(query, values)
      return true
    } catch (err) {
      console.error('PostgreSQL saveSettings error:', err)
      return false
    }
  },
}
