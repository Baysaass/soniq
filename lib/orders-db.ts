import { db } from './db'
import { localDB } from './db/local'

export interface OrderItem {
  id: string
  title: string
  price: number
  priceUSD: number
  image: string
  quantity: number
  weTransferLink?: string
  r2Key?: string
}

export type OrderStatus = 'PENDING' | 'APPROVED' | 'CANCELLED'

export interface Order {
  id: string
  createdAt: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerNotes?: string
  items: OrderItem[]
  totalAmountMNT: number
  totalAmountUSD: number
  currency: 'MNT' | 'USD'
  status: OrderStatus
  paymentMethod: 'KHAN_BANK' | 'GOLOMT_BANK' | 'QPAY' | 'FREE_DOWNLOAD' | string
  transferReference: string
  receiptNote?: string
  weTransferLink: string
  r2Key?: string
  approvedAt: string | null
  adminNotes?: string
}

export async function getAllOrdersAsync(): Promise<Order[]> {
  return db.getOrders()
}

export function getAllOrders(): Order[] {
  return localDB.getOrders()
}

export async function getOrderByIdAsync(id: string): Promise<Order | null> {
  return db.getOrderById(id)
}

export function getOrderById(id: string): Order | null {
  return localDB.getOrderById(id)
}

export function generateOrderId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000)
  return `SQ-${randomNum}`
}

export async function createOrderAsync(data: {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerNotes?: string
  items: OrderItem[]
  totalAmountMNT: number
  totalAmountUSD: number
  currency: 'MNT' | 'USD'
  paymentMethod: 'KHAN_BANK' | 'GOLOMT_BANK' | 'QPAY'
  receiptNote?: string
}): Promise<Order> {
  const id = generateOrderId()
  let weTransferLink = ''
  let r2Key: string | undefined = undefined

  if (data.items.length === 1) {
    if (data.items[0].weTransferLink) weTransferLink = data.items[0].weTransferLink
    if (data.items[0].r2Key) r2Key = data.items[0].r2Key
  } else {
    const foundR2 = data.items.find((i) => i.r2Key)?.r2Key
    if (foundR2) r2Key = foundR2
  }

  return db.createOrder({
    id,
    ...data,
    transferReference: id,
    weTransferLink,
    r2Key,
    status: 'PENDING',
    approvedAt: null,
  })
}

export function createOrder(data: {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerNotes?: string
  items: OrderItem[]
  totalAmountMNT: number
  totalAmountUSD: number
  currency: 'MNT' | 'USD'
  paymentMethod: 'KHAN_BANK' | 'GOLOMT_BANK' | 'QPAY'
  receiptNote?: string
}): Order {
  const id = generateOrderId()
  let weTransferLink = ''
  let r2Key: string | undefined = undefined

  if (data.items.length === 1) {
    if (data.items[0].weTransferLink) weTransferLink = data.items[0].weTransferLink
    if (data.items[0].r2Key) r2Key = data.items[0].r2Key
  } else {
    const foundR2 = data.items.find((i) => i.r2Key)?.r2Key
    if (foundR2) r2Key = foundR2
  }

  return localDB.createOrder({
    id,
    ...data,
    transferReference: id,
    weTransferLink,
    r2Key,
    status: 'PENDING',
    approvedAt: null,
  })
}

export async function approveOrderAsync(
  id: string,
  customWeTransferLink?: string,
  adminNotes?: string,
  customR2Key?: string
): Promise<Order | null> {
  return db.approveOrder(id, customWeTransferLink, adminNotes, customR2Key)
}

export function approveOrder(
  id: string,
  customWeTransferLink?: string,
  adminNotes?: string,
  customR2Key?: string
): Order | null {
  const updates: Partial<Order> = {
    status: 'APPROVED',
    approvedAt: new Date().toISOString(),
  }
  if (customWeTransferLink && customWeTransferLink.trim().length > 0) {
    updates.weTransferLink = customWeTransferLink.trim()
  }
  if (customR2Key !== undefined) {
    updates.r2Key = customR2Key.trim()
  }
  if (adminNotes !== undefined) {
    updates.adminNotes = adminNotes.trim()
  }
  return localDB.updateOrder(id, updates)
}

export async function cancelOrderAsync(id: string, reason?: string): Promise<Order | null> {
  return db.cancelOrder(id, reason)
}

export function cancelOrder(id: string, reason?: string): Order | null {
  return localDB.updateOrder(id, {
    status: 'CANCELLED',
    adminNotes: reason || 'Захиалга админаар цуцлагдсан',
  })
}

export function getStoreSettings(): Record<string, string> {
  const s = localDB.getSettings()
  return {
    defaultWeTransferLink: s.defaultBundleWeTransfer || '',
    adminPasscode: s.adminPasscode || 'Amirda700+',
  }
}

export function updateStoreSettings(newSettings: Record<string, string>) {
  localDB.saveSettings(newSettings as any)
}
