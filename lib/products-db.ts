import { db } from './db'
import { localDB } from './db/local'
import type { StoreProduct } from './store-data'

export type { StoreProduct }

/**
 * Returns all products. Empty array if no products yet.
 */
export async function getStoredProductsAsync(): Promise<StoreProduct[]> {
  return db.getProducts()
}

export function getStoredProducts(): StoreProduct[] {
  return localDB.getProducts()
}

export function saveProductsToDisk(products: StoreProduct[]): boolean {
  return localDB.saveProducts(products)
}

export async function getProductByIdAsync(id: string): Promise<StoreProduct | null> {
  return db.getProductById(id)
}

export function getProductById(id: string): StoreProduct | null {
  return localDB.getProductById(id)
}

export async function getProductBySlugAsync(slug: string): Promise<StoreProduct | null> {
  return db.getProductBySlug(slug)
}

export function getProductBySlug(slug: string): StoreProduct | null {
  return localDB.getProductBySlug(slug)
}

export async function getUltimateBundleProductAsync(): Promise<StoreProduct | null> {
  return db.getUltimateBundle()
}

export function getUltimateBundleProduct(): StoreProduct | null {
  const products = localDB.getProducts()
  return products.find((p) => p.isBundle) || null
}

export async function createProductAsync(productData: Partial<StoreProduct>): Promise<StoreProduct> {
  return db.createProduct(productData)
}

export function createProduct(productData: Partial<StoreProduct>): StoreProduct {
  return localDB.createProduct(productData)
}

export async function updateProductAsync(id: string, updates: Partial<StoreProduct>): Promise<StoreProduct | null> {
  return db.updateProduct(id, updates)
}

export function updateProduct(id: string, updates: Partial<StoreProduct>): StoreProduct | null {
  return localDB.updateProduct(id, updates)
}

export async function deleteProductAsync(id: string): Promise<boolean> {
  return db.deleteProduct(id)
}

export function deleteProduct(id: string): boolean {
  return localDB.deleteProduct(id)
}
