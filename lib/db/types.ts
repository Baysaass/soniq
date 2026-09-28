import type { StoreProduct } from '../store-data'
import type { Order } from '../orders-db'
import type { StoreSettingsType, R2Config } from '../settings-db'

export type { StoreProduct, Order, StoreSettingsType, R2Config }

export type DBProvider = 'supabase' | 'postgres' | 'local'

export interface DBStatus {
  provider: DBProvider
  connected: boolean
  message: string
  latencyMs?: number
  productsCount?: number
  ordersCount?: number
  details?: {
    supabaseConfigured: boolean
    postgresConfigured: boolean
    activeSource: string
  }
}
