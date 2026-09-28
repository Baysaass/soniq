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

export interface StoreSettingsType {
  storeName: string
  subdomain: string
  currencyDefault: 'MNT' | 'USD'
  adminPasscode: string
  announcementText: string
  bankInfo: {
    bankName: string
    accountNumber: string
    accountHolder: string
    qpayShortcode: string
    supportInstagram: string
    supportTelegram: string
  }
  defaultBundleWeTransfer: string
  r2Config?: R2Config
}

export async function getStoreSettingsAsync(): Promise<StoreSettingsType> {
  return db.getSettings()
}

export function getStoreSettings(): StoreSettingsType {
  return localDB.getSettings()
}

export async function saveStoreSettingsAsync(newSettings: Partial<StoreSettingsType>): Promise<boolean> {
  return db.saveSettings(newSettings)
}

export function saveStoreSettings(newSettings: Partial<StoreSettingsType>): boolean {
  return localDB.saveSettings(newSettings)
}
