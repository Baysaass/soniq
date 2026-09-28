import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { StoreProduct, Order, StoreSettingsType } from './types'

function getSupabaseCredentials() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  return { url, key }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials()
  return Boolean(url && key)
}

let clientInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance
  const { url, key } = getSupabaseCredentials()
  if (!url || !key) return null

  try {
    clientInstance = createClient(url, key, {
      auth: { persistSession: false },
    })
    return clientInstance
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err)
    return null
  }
}

// Convert DB snake_case row to CamelCase StoreProduct
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

// Convert StoreProduct to DB snake_case row
function mapProductToRow(prod: Partial<StoreProduct>): Record<string, any> {
  const row: Record<string, any> = {}
  if (prod.id !== undefined) row.id = prod.id
  if (prod.slug !== undefined) row.slug = prod.slug
  if (prod.title !== undefined) row.title = prod.title
  if (prod.subtitle !== undefined) row.subtitle = prod.subtitle
  if (prod.category !== undefined) row.category = prod.category
  if (prod.badge !== undefined) row.badge = prod.badge
  if (prod.rating !== undefined) row.rating = prod.rating
  if (prod.reviewCount !== undefined) row.review_count = prod.reviewCount
  if (prod.priceMNT !== undefined) row.price_mnt = prod.priceMNT
  if (prod.originalPriceMNT !== undefined) row.original_price_mnt = prod.originalPriceMNT
  if (prod.priceUSD !== undefined) row.price_usd = prod.priceUSD
  if (prod.originalPriceUSD !== undefined) row.original_price_usd = prod.originalPriceUSD
  if (prod.image !== undefined) row.image = prod.image
  if (prod.features !== undefined) row.features = prod.features
  if (prod.compatibility !== undefined) row.compatibility = prod.compatibility
  if (prod.format !== undefined) row.format = prod.format
  if (prod.fileSize !== undefined) row.file_size = prod.fileSize
  if (prod.downloadCount !== undefined) row.download_count = prod.downloadCount
  if (prod.defaultWeTransferLink !== undefined) row.default_wetransfer_link = prod.defaultWeTransferLink
  if (prod.sampleVideoUrl !== undefined) row.sample_video_url = prod.sampleVideoUrl
  if (prod.r2Key !== undefined) row.r2_key = prod.r2Key
  if (prod.previewSoundType !== undefined) row.preview_sound_type = prod.previewSoundType
  if (prod.isBundle !== undefined) row.is_bundle = prod.isBundle
  if (prod.description !== undefined) row.description = prod.description
  row.updated_at = new Date().toISOString()
  return row
}

// Convert DB snake_case order row to Order
function mapOrderRow(row: any): Order {
  return {
    id: row.id,
    createdAt: row.created_at || new Date().toISOString(),
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
    approvedAt: row.approved_at || null,
    adminNotes: row.admin_notes || '',
  }
}

// Convert Order to DB row
function mapOrderToRow(order: Partial<Order>): Record<string, any> {
  const row: Record<string, any> = {}
  if (order.id !== undefined) row.id = order.id
  if (order.customerName !== undefined) row.customer_name = order.customerName
  if (order.customerEmail !== undefined) row.customer_email = order.customerEmail
  if (order.customerPhone !== undefined) row.customer_phone = order.customerPhone
  if (order.customerNotes !== undefined) row.customer_notes = order.customerNotes
  if (order.items !== undefined) row.items = order.items
  if (order.totalAmountMNT !== undefined) row.total_amount_mnt = order.totalAmountMNT
  if (order.totalAmountUSD !== undefined) row.total_amount_usd = order.totalAmountUSD
  if (order.currency !== undefined) row.currency = order.currency
  if (order.status !== undefined) row.status = order.status
  if (order.paymentMethod !== undefined) row.payment_method = order.paymentMethod
  if (order.transferReference !== undefined) row.transfer_reference = order.transferReference
  if (order.receiptNote !== undefined) row.receipt_note = order.receiptNote
  if (order.weTransferLink !== undefined) row.wetransfer_link = order.weTransferLink
  if (order.r2Key !== undefined) row.r2_key = order.r2Key
  if (order.approvedAt !== undefined) row.approved_at = order.approvedAt
  if (order.adminNotes !== undefined) row.admin_notes = order.adminNotes
  return row
}

export const supabaseDB = {
  async getProducts(): Promise<StoreProduct[]> {
    const supabase = getSupabaseClient()
    if (!supabase) return []
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Supabase getProducts error:', error)
      return []
    }
    return (data || []).map(mapProductRow)
  },

  async getProductById(id: string): Promise<StoreProduct | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null
    const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
    if (error || !data) return null
    return mapProductRow(data)
  },

  async getProductBySlug(slug: string): Promise<StoreProduct | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null
    const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle()
    if (error || !data) return null
    return mapProductRow(data)
  },

  async createProduct(product: Partial<StoreProduct>): Promise<StoreProduct | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null
    const row = mapProductToRow(product)
    const { data, error } = await supabase.from('products').insert([row]).select('*').single()
    if (error) {
      console.error('Supabase createProduct error:', error)
      throw new Error(error.message)
    }
    return mapProductRow(data)
  },

  async updateProduct(id: string, updates: Partial<StoreProduct>): Promise<StoreProduct | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null
    const row = mapProductToRow(updates)
    const { data, error } = await supabase.from('products').update(row).eq('id', id).select('*').single()
    if (error) {
      console.error('Supabase updateProduct error:', error)
      throw new Error(error.message)
    }
    return mapProductRow(data)
  },

  async deleteProduct(id: string): Promise<boolean> {
    const supabase = getSupabaseClient()
    if (!supabase) return false
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      console.error('Supabase deleteProduct error:', error)
      return false
    }
    return true
  },

  async getOrders(): Promise<Order[]> {
    const supabase = getSupabaseClient()
    if (!supabase) return []
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Supabase getOrders error:', error)
      return []
    }
    return (data || []).map(mapOrderRow)
  },

  async getOrderById(id: string): Promise<Order | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle()
    if (error || !data) return null
    return mapOrderRow(data)
  },

  async createOrder(order: Partial<Order>): Promise<Order | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null
    const row = mapOrderToRow(order)
    const { data, error } = await supabase.from('orders').insert([row]).select('*').single()
    if (error) {
      console.error('Supabase createOrder error:', error)
      throw new Error(error.message)
    }
    return mapOrderRow(data)
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null
    const row = mapOrderToRow(updates)
    const { data, error } = await supabase.from('orders').update(row).eq('id', id).select('*').single()
    if (error) {
      console.error('Supabase updateOrder error:', error)
      throw new Error(error.message)
    }
    return mapOrderRow(data)
  },

  async getSettings(): Promise<StoreSettingsType | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null
    const { data, error } = await supabase.from('store_settings').select('*').eq('id', 'default').maybeSingle()
    if (error || !data) return null
    return {
      storeName: data.store_name,
      subdomain: data.subdomain,
      currencyDefault: data.currency_default || 'MNT',
      adminPasscode: data.admin_passcode,
      announcementText: data.announcement_text,
      bankInfo: data.bank_info || {},
      defaultBundleWeTransfer: data.default_bundle_wetransfer || '',
      r2Config: data.r2_config || {},
    }
  },

  async saveSettings(settings: Partial<StoreSettingsType>): Promise<boolean> {
    const supabase = getSupabaseClient()
    if (!supabase) return false
    const row: Record<string, any> = { id: 'default', updated_at: new Date().toISOString() }
    if (settings.storeName !== undefined) row.store_name = settings.storeName
    if (settings.subdomain !== undefined) row.subdomain = settings.subdomain
    if (settings.currencyDefault !== undefined) row.currency_default = settings.currencyDefault
    if (settings.adminPasscode !== undefined) row.admin_passcode = settings.adminPasscode
    if (settings.announcementText !== undefined) row.announcement_text = settings.announcementText
    if (settings.bankInfo !== undefined) row.bank_info = settings.bankInfo
    if (settings.defaultBundleWeTransfer !== undefined) row.default_bundle_wetransfer = settings.defaultBundleWeTransfer
    if (settings.r2Config !== undefined) row.r2_config = settings.r2Config

    const { error } = await supabase.from('store_settings').upsert(row)
    if (error) {
      console.error('Supabase saveSettings error:', error)
      return false
    }
    return true
  },
}
