'use client'

import React, { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { StoreProvider, useStore } from '@/lib/store-context'
import { StoreAnnouncementBar } from '@/components/store/store-announcement-bar'
import { StoreNavbar } from '@/components/store/store-navbar'
import { StoreHero } from '@/components/store/store-hero'
import { StoreProductGrid } from '@/components/store/store-product-grid'
import { StoreValueMatrix } from '@/components/store/store-value-matrix'
import { StoreFAQ } from '@/components/store/store-faq'
import { StoreFooter } from '@/components/store/store-footer'
import { StoreCartDrawer } from '@/components/store/store-cart-drawer'
import { StoreCheckoutModal } from '@/components/store/store-checkout-modal'
import { StoreStickyBar } from '@/components/store/store-sticky-bar'

function ShopPlanRedirect() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { products, productsLoaded } = useStore()
  const plan = searchParams.get('plan')
  const buy = searchParams.get('buy')

  useEffect(() => {
    if (!productsLoaded || !products || products.length === 0) return

    if (plan === 'full') {
      const match = products.find(
        (p) =>
          p.slug?.toLowerCase().includes('full') ||
          p.title?.toLowerCase().includes('full') ||
          p.priceMNT === 59900 ||
          p.isBundle
      )
      if (match?.slug) {
        router.replace(`/shop/product/${match.slug}`)
        return
      }
    }

    if (plan === 'starter') {
      const match = products.find(
        (p) =>
          p.slug?.toLowerCase().includes('starter') ||
          p.title?.toLowerCase().includes('starter') ||
          p.priceMNT === 29900
      )
      if (match?.slug) {
        router.replace(`/shop/product/${match.slug}`)
        return
      }
    }

    if (buy) {
      const match = products.find((p) => p.slug === buy || p.id === buy)
      if (match?.slug) {
        router.replace(`/shop/product/${match.slug}`)
      }
    }
  }, [plan, buy, products, productsLoaded, router])

  return null
}

export default function ShopPage() {
  return (
    <StoreProvider>
      <Suspense fallback={null}>
        <ShopPlanRedirect />
      </Suspense>
      <main className="min-h-screen bg-[#FAFAFA] text-[#141414] font-sans">
        {/* Top Announcement Bar */}
        <StoreAnnouncementBar />

        {/* Clean Store Navbar matching main site */}
        <StoreNavbar />

        {/* Compact Hero Section */}
        <StoreHero />

        {/* The Full Arsenal Catalog Grid with search & categories */}
        <StoreProductGrid />

        {/* Value Matrix Comparison Table (Түр хаасан) */}
        {/* <StoreValueMatrix /> */}

        {/* FAQ Accordion */}
        <StoreFAQ />

        {/* Clean Store Footer */}
        <StoreFooter />

        {/* Slide-over Cart Drawer */}
        <StoreCartDrawer />

        {/* Checkout & Bank Transfer Modal */}
        <StoreCheckoutModal />

        {/* Scroll-triggered Bottom Buy Bar */}
        <StoreStickyBar />
      </main>
    </StoreProvider>
  )
}
