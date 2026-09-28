'use client'

import React from 'react'
import { StoreProvider } from '@/lib/store-context'
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

export default function ShopPage() {
  return (
    <StoreProvider>
      <main className="min-h-screen bg-[#FAFAFA] text-[#141414] font-sans">
        {/* Top Announcement Bar */}
        <StoreAnnouncementBar />

        {/* Clean Store Navbar matching main site */}
        <StoreNavbar />

        {/* Compact Hero Section */}
        <StoreHero />

        {/* The Full Arsenal Catalog Grid with search & categories */}
        <StoreProductGrid />

        {/* Value Matrix Comparison Table */}
        <StoreValueMatrix />

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
