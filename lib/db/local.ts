import fs from 'fs'
import path from 'path'
import { STORE_SETTINGS, StoreProduct } from '../store-data'
import type { Order } from '../orders-db'
import type { StoreSettingsType } from '../settings-db'

const DATA_DIR = path.join(process.cwd(), 'data')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
  } catch (err) {
    console.error('Failed to create data dir:', err)
  }
}

let productsCache: StoreProduct[] | null = null
let ordersCache: Order[] | null = null
let settingsCache: StoreSettingsType | null = null

export const localDB = {
  getProducts(): StoreProduct[] {
    ensureDataDir()
    if (productsCache !== null) return productsCache

    try {
      if (fs.existsSync(PRODUCTS_FILE)) {
        const content = fs.readFileSync(PRODUCTS_FILE, 'utf-8').trim()
        if (content) {
          const parsed = JSON.parse(content)
          if (Array.isArray(parsed)) {
            productsCache = parsed
            return productsCache
          }
        }
      }
    } catch (err) {
      console.error('Failed to read products.json:', err)
    }

    // Default is clean slate (empty array - no mock products)
    productsCache = []
    this.saveProducts(productsCache)
    return productsCache
  },

  saveProducts(products: StoreProduct[]): boolean {
    ensureDataDir()
    try {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8')
      productsCache = products
      return true
    } catch (err) {
      console.error('Failed to save products.json:', err)
      return false
    }
  },

  getProductById(id: string): StoreProduct | null {
    const products = this.getProducts()
    return products.find((p) => p.id === id) || null
  },

  getProductBySlug(slug: string): StoreProduct | null {
    const products = this.getProducts()
    return products.find((p) => p.slug === slug) || null
  },

  createProduct(data: Partial<StoreProduct>): StoreProduct {
    const products = this.getProducts()
    const id = data.id || `prod_${Date.now()}`
    const rawSlug =
      data.slug ||
      data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
      `pack-${Date.now()}`
    let slug = rawSlug
    let counter = 1
    while (products.some((p) => p.slug === slug)) {
      slug = `${rawSlug}-${counter}`
      counter++
    }

    const newProduct: StoreProduct = {
      id,
      slug,
      title: data.title || 'Шинэ багц',
      subtitle: data.subtitle || '',
      category: data.category || 'sfx',
      badge: data.badge || 'NEW',
      rating: Number(data.rating) || 5.0,
      reviewCount: Number(data.reviewCount) || 1,
      priceMNT: Number(data.priceMNT) || 29900,
      originalPriceMNT: Number(data.originalPriceMNT) || 89000,
      priceUSD: Number(data.priceUSD) || 9.99,
      originalPriceUSD: Number(data.originalPriceUSD) || 29.0,
      image: data.image || '/images/product-morph-3d.png',
      features: Array.isArray(data.features) ? data.features : ['Өндөр чанарын аудио сан', '100% Royalty Free'],
      compatibility:
        Array.isArray(data.compatibility) && data.compatibility.length > 0
          ? data.compatibility
          : ['Premiere Pro', 'DaVinci Resolve', 'CapCut'],
      format: data.format || 'WAV 24-bit / 96kHz Lossless',
      fileSize: data.fileSize || '1.2 GB',
      downloadCount: data.downloadCount || '0+ таталт',
      defaultWeTransferLink: data.defaultWeTransferLink || '',
      sampleVideoUrl: data.sampleVideoUrl || '',
      r2Key: data.r2Key || '',
      previewSoundType: data.previewSoundType || 'whoosh',
      isBundle: Boolean(data.isBundle),
      description: data.description || '',
    }

    const updated = [newProduct, ...products]
    this.saveProducts(updated)
    return newProduct
  },

  updateProduct(id: string, updates: Partial<StoreProduct>): StoreProduct | null {
    const products = this.getProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index === -1) return null

    const updatedProduct = {
      ...products[index],
      ...updates,
      id,
    }
    products[index] = updatedProduct
    this.saveProducts(products)
    return updatedProduct
  },

  deleteProduct(id: string): boolean {
    const products = this.getProducts()
    const target = (id || '').trim()
    const filtered = products.filter((p) => {
      if (!target || target === 'undefined' || target === 'null') {
        return Boolean(p.id && p.id.trim())
      }
      return p.id !== target && p.slug !== target
    })
    if (filtered.length === products.length) return false
    return this.saveProducts(filtered)
  },

  getOrders(): Order[] {
    ensureDataDir()
    if (ordersCache !== null) return ordersCache

    try {
      if (fs.existsSync(ORDERS_FILE)) {
        const content = fs.readFileSync(ORDERS_FILE, 'utf-8').trim()
        if (content) {
          const parsed = JSON.parse(content)
          if (Array.isArray(parsed)) {
            ordersCache = parsed
            return ordersCache
          }
        }
      }
    } catch (err) {
      console.error('Failed to read orders.json:', err)
    }

    ordersCache = []
    this.saveOrders(ordersCache)
    return ordersCache
  },

  saveOrders(orders: Order[]): boolean {
    ensureDataDir()
    try {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8')
      ordersCache = orders
      return true
    } catch (err) {
      console.error('Failed to save orders.json:', err)
      return false
    }
  },

  getOrderById(id: string): Order | null {
    const orders = this.getOrders()
    return orders.find((o) => o.id.toLowerCase() === id.toLowerCase()) || null
  },

  createOrder(data: Partial<Order>): Order {
    const orders = this.getOrders()
    const id = data.id || `SQ-${Math.floor(10000 + Math.random() * 90000)}`

    const newOrder: Order = {
      id,
      createdAt: data.createdAt || new Date().toISOString(),
      customerName: data.customerName || '',
      customerEmail: data.customerEmail || '',
      customerPhone: data.customerPhone || '',
      customerNotes: data.customerNotes || '',
      items: data.items || [],
      totalAmountMNT: data.totalAmountMNT || 0,
      totalAmountUSD: data.totalAmountUSD || 0,
      currency: data.currency || 'MNT',
      status: data.status || 'PENDING',
      paymentMethod: data.paymentMethod || 'KHAN_BANK',
      transferReference: data.transferReference || id,
      receiptNote: data.receiptNote || '',
      weTransferLink: data.weTransferLink || '',
      r2Key: data.r2Key || '',
      approvedAt: data.approvedAt || null,
      adminNotes: data.adminNotes || '',
    }

    const updated = [newOrder, ...orders]
    this.saveOrders(updated)
    return newOrder
  },

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    const orders = this.getOrders()
    const index = orders.findIndex((o) => o.id.toLowerCase() === id.toLowerCase())
    if (index === -1) return null

    const updatedOrder = {
      ...orders[index],
      ...updates,
      id: orders[index].id,
    }
    orders[index] = updatedOrder
    this.saveOrders(orders)
    return updatedOrder
  },

  getSettings(): StoreSettingsType {
    ensureDataDir()
    if (settingsCache !== null) return settingsCache

    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const content = fs.readFileSync(SETTINGS_FILE, 'utf-8').trim()
        if (content) {
          const parsed = JSON.parse(content)
          if (parsed && typeof parsed === 'object') {
            settingsCache = {
              ...STORE_SETTINGS,
              announcementText: 'Бүх багц 85% хямдралтай · WeTransfer шууд таталт',
              ...parsed,
              bankInfo: {
                ...STORE_SETTINGS.bankInfo,
                ...(parsed.bankInfo || {}),
              },
              r2Config: {
                accountId: process.env.R2_ACCOUNT_ID || parsed.r2Config?.accountId || '',
                accessKeyId: process.env.R2_ACCESS_KEY_ID || parsed.r2Config?.accessKeyId || '',
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || parsed.r2Config?.secretAccessKey || '',
                bucketName: process.env.R2_BUCKET_NAME || parsed.r2Config?.bucketName || 'soniq-store',
                publicDomain: process.env.R2_PUBLIC_DOMAIN || parsed.r2Config?.publicDomain || '',
              },
            }
            return settingsCache
          }
        }
      }
    } catch (err) {
      console.error('Failed to read settings.json:', err)
    }

    settingsCache = {
      ...STORE_SETTINGS,
      announcementText: 'Бүх багц 85% хямдралтай · WeTransfer шууд таталт',
      r2Config: {
        accountId: process.env.R2_ACCOUNT_ID || '',
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        bucketName: process.env.R2_BUCKET_NAME || 'soniq-store',
        publicDomain: process.env.R2_PUBLIC_DOMAIN || '',
      },
    }
    this.saveSettings(settingsCache)
    return settingsCache
  },

  saveSettings(updates: Partial<StoreSettingsType>): boolean {
    ensureDataDir()
    const current = this.getSettings()
    settingsCache = {
      ...current,
      ...updates,
      bankInfo: {
        ...current.bankInfo,
        ...(updates.bankInfo || {}),
      },
      r2Config: {
        ...current.r2Config,
        ...(updates.r2Config || {}),
      },
    }
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settingsCache, null, 2), 'utf-8')
      return true
    } catch (err) {
      console.error('Failed to save settings.json:', err)
      return false
    }
  },
}
