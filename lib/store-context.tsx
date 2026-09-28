'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { STORE_PRODUCTS, ULTIMATE_BUNDLE, STORE_SETTINGS, StoreProduct } from './store-data'
import { audioSynthesizer } from './audio-synthesizer'

export interface CartItem {
  product: StoreProduct
  quantity: number
}

export type StoreSettingsState = typeof STORE_SETTINGS & {
  announcementText?: string
}

interface StoreContextType {
  products: StoreProduct[]
  ultimateBundle: StoreProduct | null
  settings: StoreSettingsState
  refreshProducts: () => Promise<void>
  refreshSettings: () => Promise<void>
  cart: CartItem[]
  addToCart: (product: StoreProduct, openDrawer?: boolean) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  cartCount: number
  cartTotalMNT: number
  cartTotalUSD: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  isCheckoutOpen: boolean
  setIsCheckoutOpen: (open: boolean) => void
  checkoutTargetProduct: StoreProduct | null
  openCheckoutWithProduct: (product: StoreProduct) => void
  currency: 'MNT' | 'USD'
  setCurrency: (cur: 'MNT' | 'USD') => void
  formatPrice: (mnt: number, usd: number) => string
  playingSoundId: string | null
  playSoundPreview: (product: StoreProduct) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<StoreProduct[]>(STORE_PRODUCTS)
  const [ultimateBundle, setUltimateBundle] = useState<StoreProduct | null>(ULTIMATE_BUNDLE)
  const [settings, setSettings] = useState<StoreSettingsState>(STORE_SETTINGS)

  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkoutTargetProduct, setCheckoutTargetProduct] = useState<StoreProduct | null>(null)
  const [currency, setCurrency] = useState<'MNT' | 'USD'>('MNT')
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null)

  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products)
        }
        if (data.ultimateBundle) {
          setUltimateBundle(data.ultimateBundle)
        } else {
          setUltimateBundle(null)
        }
      }
    } catch (err) {
      console.error('Failed to fetch dynamic products:', err)
    }
  }, [])

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
            bankInfo: {
              ...prev.bankInfo,
              ...(data.settings.bankInfo || {}),
            },
          }))
        }
      }
    } catch (err) {
      console.error('Failed to fetch dynamic settings:', err)
    }
  }, [])

  // Initial load of products and settings
  useEffect(() => {
    refreshProducts()
    refreshSettings()
  }, [refreshProducts, refreshSettings])

  // Load cart from local storage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('soniq_cart')
      if (saved) {
        setCart(JSON.parse(saved))
      }
    } catch {}
  }, [])

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('soniq_cart', JSON.stringify(cart))
    } catch {}
  }, [cart])

  const addToCart = (product: StoreProduct, openDrawer = true) => {
    audioSynthesizer.playUI()
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    if (openDrawer) {
      setIsCartOpen(true)
    }
  }

  const removeFromCart = (productId: string) => {
    audioSynthesizer.playUI()
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const openCheckoutWithProduct = (product: StoreProduct) => {
    audioSynthesizer.playUI()
    setCheckoutTargetProduct(product)
    setIsCheckoutOpen(true)
  }

  const playSoundPreview = (product: StoreProduct) => {
    if (playingSoundId === product.id) {
      setPlayingSoundId(null)
      return
    }
    setPlayingSoundId(product.id)
    audioSynthesizer.playByType(product.previewSoundType)
    setTimeout(() => {
      setPlayingSoundId(null)
    }, 1200)
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotalMNT = cart.reduce((total, item) => total + item.product.priceMNT * item.quantity, 0)
  const cartTotalUSD = cart.reduce((total, item) => total + item.product.priceUSD * item.quantity, 0)

  const formatPrice = (mnt: number, usd: number) => {
    if (currency === 'USD') {
      return `$${usd.toFixed(2)}`
    }
    return `${mnt.toLocaleString()}₮`
  }

  return (
    <StoreContext.Provider
      value={{
        products,
        ultimateBundle,
        settings,
        refreshProducts,
        refreshSettings,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotalMNT,
        cartTotalUSD,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        checkoutTargetProduct,
        openCheckoutWithProduct,
        currency,
        setCurrency,
        formatPrice,
        playingSoundId,
        playSoundPreview,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
