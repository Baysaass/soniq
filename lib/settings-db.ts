import { db } from './db'
import { localDB } from './db/local'
import { STORE_SETTINGS } from './store-data'

export interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicDomain?: string
}

import type { StoreCategory } from './store-data'
export type { StoreCategory }

export interface StoreSettingsType {
  storeName: string
  subdomain: string
  currencyDefault: 'MNT' | 'USD'
  adminPasscode: string
  announcementText: string
  categories?: StoreCategory[]
  bankInfo: {
    bankName: string
    accountNumber: string
    accountHolder: string
    qpayShortcode: string
    supportInstagram: string
    supportTelegram: string
    telegramBotToken?: string
    telegramChatId?: string
  }
  defaultBundleWeTransfer: string
  r2Config?: R2Config
  telegramBotToken?: string
  telegramChatId?: string
  resendApiKey?: string
  emailFrom?: string
}

let latestSettingsCache: StoreSettingsType | null = null

export function setInMemorySettings(settings: StoreSettingsType) {
  latestSettingsCache = settings
}

export async function getStoreSettingsAsync(): Promise<StoreSettingsType> {
  const settings = await db.getSettings()
  if (settings) {
    latestSettingsCache = settings
  }
  return settings
}

export function getStoreSettings(): StoreSettingsType {
  if (latestSettingsCache) {
    return latestSettingsCache
  }
  return localDB.getSettings()
}

export async function saveStoreSettingsAsync(newSettings: Partial<StoreSettingsType>): Promise<boolean> {
  const success = await db.saveSettings(newSettings)
  if (latestSettingsCache) {
    latestSettingsCache = {
      ...latestSettingsCache,
      ...newSettings,
    }
  }
  return success
}

export function saveStoreSettings(newSettings: Partial<StoreSettingsType>): boolean {
  return localDB.saveSettings(newSettings)
}
