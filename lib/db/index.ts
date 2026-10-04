import { supabaseDB, isSupabaseConfigured } from './supabase'
import { postgresDB, isPostgresConfigured } from './postgres'
import { localDB } from './local'
import type { StoreProduct, Order, StoreSettingsType, DBStatus, DBProvider } from './types'

export * from './types'

/**
 * Returns the currently active DB provider
 */
export function getActiveDBProvider(): DBProvider {
  if (isSupabaseConfigured()) return 'supabase'
  if (isPostgresConfigured()) return 'postgres'
  return 'local'
}

let inMemoryProductsCache: { data: StoreProduct[]; timestamp: number } | null = null
const CACHE_TTL_MS = 30_000 // 30 seconds high-speed memory cache

export function invalidateProductsCache() {
  inMemoryProductsCache = null
}

let inMemoryOrdersCache: { data: Order[]; timestamp: number } | null = null
const ORDERS_CACHE_TTL_MS = 10_000 // 10 seconds high-speed memory cache for orders

export function invalidateOrdersCache() {
  inMemoryOrdersCache = null
}

/**
 * Unified Database Interface
 * Automatically switches between Supabase, PostgreSQL, or Local storage based on environment variables.
 */
export const db = {
  getProvider(): DBProvider {
    return getActiveDBProvider()
  },

  async getProducts(forceFresh = false): Promise<StoreProduct[]> {
    const now = Date.now()
    if (!forceFresh && inMemoryProductsCache && (now - inMemoryProductsCache.timestamp < CACHE_TTL_MS)) {
      return inMemoryProductsCache.data
    }

    const provider = getActiveDBProvider()
    let products: StoreProduct[] = []

    if (provider === 'supabase') {
      try {
        products = await supabaseDB.getProducts()
      } catch (err) {
        console.error('Supabase query failed, falling back to local:', err)
        products = localDB.getProducts()
      }
    } else if (provider === 'postgres') {
      try {
        products = await postgresDB.getProducts()
      } catch (err) {
        console.error('PostgreSQL query failed, falling back to local:', err)
        products = localDB.getProducts()
      }
    } else {
      products = localDB.getProducts()
    }

    inMemoryProductsCache = { data: products, timestamp: now }
    return products
  },

  async getProductById(id: string): Promise<StoreProduct | null> {
    const provider = getActiveDBProvider()
    if (provider === 'supabase') {
      try {
        return await supabaseDB.getProductById(id)
      } catch (err) {
        return localDB.getProductById(id)
      }
    }
    if (provider === 'postgres') {
      try {
        return await postgresDB.getProductById(id)
      } catch (err) {
        return localDB.getProductById(id)
      }
    }
    return localDB.getProductById(id)
  },

  async getProductBySlug(slug: string): Promise<StoreProduct | null> {
    const provider = getActiveDBProvider()
    if (provider === 'supabase') {
      try {
        return await supabaseDB.getProductBySlug(slug)
      } catch (err) {
        return localDB.getProductBySlug(slug)
      }
    }
    if (provider === 'postgres') {
      try {
        return await postgresDB.getProductBySlug(slug)
      } catch (err) {
        return localDB.getProductBySlug(slug)
      }
    }
    return localDB.getProductBySlug(slug)
  },

  async getUltimateBundle(): Promise<StoreProduct | null> {
    const products = await this.getProducts()
    const bundle = products.find((p) => p.isBundle) || null
    return bundle
  },

  async createProduct(data: Partial<StoreProduct>): Promise<StoreProduct> {
    invalidateProductsCache()
    const provider = getActiveDBProvider()
    if (provider === 'supabase') {
      try {
        const prod = await supabaseDB.createProduct(data)
        if (prod) {
          try { await localDB.createProduct(prod) } catch {}
          return prod
        }
      } catch (err: any) {
        console.error('Supabase createProduct failed:', err)
        throw new Error(`Supabase-д хадгалахад алдаа гарлаа: ${err?.message || err}`)
      }
    }
    if (provider === 'postgres') {
      try {
        const prod = await postgresDB.createProduct(data)
        if (prod) {
          try { await localDB.createProduct(prod) } catch {}
          return prod
        }
      } catch (err: any) {
        console.error('PostgreSQL createProduct failed:', err)
        throw new Error(`PostgreSQL-д хадгалахад алдаа гарлаа: ${err?.message || err}`)
      }
    }
    return localDB.createProduct(data)
  },

  async updateProduct(id: string, updates: Partial<StoreProduct>): Promise<StoreProduct | null> {
    invalidateProductsCache()
    const provider = getActiveDBProvider()
    if (provider === 'supabase') {
      try {
        const updated = await supabaseDB.updateProduct(id, updates)
        if (updated) {
          try { await localDB.updateProduct(id, updated) } catch {}
          return updated
        }
      } catch (err: any) {
        console.error('Supabase updateProduct failed:', err)
        throw new Error(`Supabase-д шинэчлэхэд алдаа гарлаа: ${err?.message || err}`)
      }
    }
    if (provider === 'postgres') {
      try {
        const updated = await postgresDB.updateProduct(id, updates)
        if (updated) {
          try { await localDB.updateProduct(id, updated) } catch {}
          return updated
        }
      } catch (err: any) {
        console.error('PostgreSQL updateProduct failed:', err)
        throw new Error(`PostgreSQL-д шинэчлэхэд алдаа гарлаа: ${err?.message || err}`)
      }
    }
    return localDB.updateProduct(id, updates)
  },

  async deleteProduct(id: string): Promise<boolean> {
    invalidateProductsCache()
    const provider = getActiveDBProvider()
    if (provider === 'supabase') {
      try {
        return await supabaseDB.deleteProduct(id)
      } catch (err) {
        return localDB.deleteProduct(id)
      }
    }
    if (provider === 'postgres') {
      try {
        return await postgresDB.deleteProduct(id)
      } catch (err) {
        return localDB.deleteProduct(id)
      }
    }
    return localDB.deleteProduct(id)
  },

  async getOrders(forceFresh = false): Promise<Order[]> {
    const now = Date.now()
    if (!forceFresh && inMemoryOrdersCache && (now - inMemoryOrdersCache.timestamp < ORDERS_CACHE_TTL_MS)) {
      return inMemoryOrdersCache.data
    }

    const provider = getActiveDBProvider()
    let orders: Order[] = []

    if (provider === 'supabase') {
      try {
        orders = await supabaseDB.getOrders()
      } catch (err) {
        orders = localDB.getOrders()
      }
    } else if (provider === 'postgres') {
      try {
        orders = await postgresDB.getOrders()
      } catch (err) {
        orders = localDB.getOrders()
      }
    } else {
      orders = localDB.getOrders()
    }

    inMemoryOrdersCache = { data: orders, timestamp: now }
    return orders
  },

  async getOrderById(id: string): Promise<Order | null> {
    const provider = getActiveDBProvider()
    if (provider === 'supabase') {
      try {
        return await supabaseDB.getOrderById(id)
      } catch (err) {
        return localDB.getOrderById(id)
      }
    }
    if (provider === 'postgres') {
      try {
        return await postgresDB.getOrderById(id)
      } catch (err) {
        return localDB.getOrderById(id)
      }
    }
    return localDB.getOrderById(id)
  },

  async createOrder(data: Partial<Order>): Promise<Order> {
    invalidateOrdersCache()
    const orderId = data.id || `SQ-${Math.floor(10000 + Math.random() * 90000)}`
    const orderData: Partial<Order> = {
      ...data,
      id: orderId,
      transferReference: data.transferReference || orderId,
      status: data.status || 'PENDING',
      createdAt: data.createdAt || new Date().toISOString(),
    }

    const provider = getActiveDBProvider()
    if (provider === 'supabase') {
      try {
        const order = await supabaseDB.createOrder(orderData)
        if (order) return order
      } catch (err) {
        console.error('Supabase createOrder failed:', err)
        throw err
      }
    }
    if (provider === 'postgres') {
      try {
        const order = await postgresDB.createOrder(orderData)
        if (order) return order
      } catch (err) {
        console.error('PostgreSQL createOrder failed:', err)
        throw err
      }
    }
    return localDB.createOrder(orderData)
  },

  async approveOrder(
    id: string,
    customWeTransferLink?: string,
    adminNotes?: string,
    r2Key?: string
  ): Promise<Order | null> {
    invalidateOrdersCache()
    const updates: Partial<Order> = {
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
    }
    if (customWeTransferLink && customWeTransferLink.trim().length > 0) {
      updates.weTransferLink = customWeTransferLink.trim()
    }
    if (r2Key !== undefined) {
      updates.r2Key = r2Key.trim()
    }
    if (adminNotes !== undefined) {
      updates.adminNotes = adminNotes.trim()
    }

    const provider = getActiveDBProvider()
    if (provider === 'supabase') {
      try {
        return await supabaseDB.updateOrder(id, updates)
      } catch (err) {
        return localDB.updateOrder(id, updates)
      }
    }
    if (provider === 'postgres') {
      try {
        return await postgresDB.updateOrder(id, updates)
      } catch (err) {
        return localDB.updateOrder(id, updates)
      }
    }
    return localDB.updateOrder(id, updates)
  },

  async cancelOrder(id: string, reason?: string): Promise<Order | null> {
    invalidateOrdersCache()
    const updates: Partial<Order> = {
      status: 'CANCELLED',
      adminNotes: reason || 'Захиалга админаар цуцлагдсан',
    }

    const provider = getActiveDBProvider()
    if (provider === 'supabase') {
      try {
        return await supabaseDB.updateOrder(id, updates)
      } catch (err) {
        return localDB.updateOrder(id, updates)
      }
    }
    if (provider === 'postgres') {
      try {
        return await postgresDB.updateOrder(id, updates)
      } catch (err) {
        return localDB.updateOrder(id, updates)
      }
    }
    return localDB.updateOrder(id, updates)
  },

  async getSettings(): Promise<StoreSettingsType> {
    const provider = getActiveDBProvider()
    if (provider === 'supabase') {
      try {
        const s = await supabaseDB.getSettings()
        if (s) return s
      } catch (err) {
        console.error('Supabase getSettings failed:', err)
      }
    }
    if (provider === 'postgres') {
      try {
        const s = await postgresDB.getSettings()
        if (s) return s
      } catch (err) {
        console.error('PostgreSQL getSettings failed:', err)
      }
    }
    return localDB.getSettings()
  },

  async saveSettings(updates: Partial<StoreSettingsType>): Promise<boolean> {
    const provider = getActiveDBProvider()
    let cloudSuccess = false
    if (provider === 'supabase') {
      try {
        cloudSuccess = await supabaseDB.saveSettings(updates)
      } catch (err) {
        console.error('Supabase saveSettings error:', err)
      }
    }
    if (provider === 'postgres') {
      try {
        cloudSuccess = await postgresDB.saveSettings(updates)
      } catch (err) {
        console.error('PostgreSQL saveSettings error:', err)
      }
    }
    // Also update local cache
    localDB.saveSettings(updates)
    return provider === 'local' ? true : cloudSuccess
  },

  /**
   * Verify admin passcode against dynamic settings in DB
   */
  async verifyAdminPasscode(passcode: string): Promise<boolean> {
    if (!passcode) return false
    const settings = await this.getSettings()
    const activePasscode = settings.adminPasscode || 'Amirda700+'
    return passcode.trim() === activePasscode.trim()
  },

  /**
   * Change admin passcode
   */
  async changeAdminPasscode(
    oldPasscode: string,
    newPasscode: string
  ): Promise<{ success: boolean; message: string }> {
    const isOldValid = await this.verifyAdminPasscode(oldPasscode)
    if (!isOldValid) {
      return { success: false, message: 'Одоогийн нууц үг буруу байна.' }
    }

    if (!newPasscode || newPasscode.trim().length < 6) {
      return { success: false, message: 'Шинэ нууц үг хамгийн багадаа 6 тэмдэгттэй байх ёстой.' }
    }

    await this.saveSettings({ adminPasscode: newPasscode.trim() })
    return { success: true, message: 'Админ нууц үг амжилттай шинэчлэгдлээ.' }
  },

  /**
   * Check connection status to current DB
   */
  async getStatus(): Promise<DBStatus> {
    const provider = getActiveDBProvider()
    const start = Date.now()

    if (provider === 'supabase') {
      try {
        const products = await supabaseDB.getProducts()
        const orders = await supabaseDB.getOrders()
        const latencyMs = Date.now() - start
        return {
          provider: 'supabase',
          connected: true,
          message: 'Supabase PostgreSQL сантай амжилттай холбогдсон байна.',
          latencyMs,
          productsCount: products.length,
          ordersCount: orders.length,
          details: {
            supabaseConfigured: true,
            postgresConfigured: isPostgresConfigured(),
            activeSource: process.env.SUPABASE_URL || 'SUPABASE_URL',
          },
        }
      } catch (err: any) {
        return {
          provider: 'supabase',
          connected: false,
          message: `Supabase холболтын алдаа: ${err.message}`,
          details: {
            supabaseConfigured: true,
            postgresConfigured: isPostgresConfigured(),
            activeSource: 'Supabase Error',
          },
        }
      }
    }

    if (provider === 'postgres') {
      try {
        const products = await postgresDB.getProducts()
        const orders = await postgresDB.getOrders()
        const latencyMs = Date.now() - start
        return {
          provider: 'postgres',
          connected: true,
          message: 'PostgreSQL сантай амжилттай холбогдсон байна.',
          latencyMs,
          productsCount: products.length,
          ordersCount: orders.length,
          details: {
            supabaseConfigured: false,
            postgresConfigured: true,
            activeSource: 'DATABASE_URL',
          },
        }
      } catch (err: any) {
        return {
          provider: 'postgres',
          connected: false,
          message: `PostgreSQL холболтын алдаа: ${err.message}`,
          details: {
            supabaseConfigured: false,
            postgresConfigured: true,
            activeSource: 'Postgres Error',
          },
        }
      }
    }

    // Local mode
    const products = localDB.getProducts()
    const orders = localDB.getOrders()
    return {
      provider: 'local',
      connected: true,
      message: 'Хөгжүүлэлтийн Local Persistent санд ажиллаж байна. (Vercel production-д SUPABASE_URL эсвэл DATABASE_URL оруулна)',
      latencyMs: Date.now() - start,
      productsCount: products.length,
      ordersCount: orders.length,
      details: {
        supabaseConfigured: false,
        postgresConfigured: false,
        activeSource: 'Local JSON Storage',
      },
    }
  },
}
