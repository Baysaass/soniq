'use client'

import React, { useState, useEffect } from 'react'
import { StoreProvider, useStore } from '@/lib/store-context'
import { StoreCheckoutModal } from '@/components/store/store-checkout-modal'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { SoniqFeatures } from '@/components/soniq-features'
import { Stats } from '@/components/stats'
import { Footer } from '@/components/footer'
import type { StoreProduct } from '@/lib/store-data'

function HomePageContent() {
  const { products, ultimateBundle, openCheckoutWithProduct } = useStore()
  const [fullHref, setFullHref] = useState('/shop?plan=full')
  const [starterHref, setStarterHref] = useState('/shop?plan=starter')

  useEffect(() => {
    if (!products || products.length === 0) return

    // Find full package / bundle
    const full = products.find(
      (p) =>
        p.slug?.toLowerCase().includes('full') ||
        p.title?.toLowerCase().includes('full') ||
        p.priceMNT === 54900 ||
        p.priceMNT === 59900 ||
        p.isBundle
    )
    if (full?.slug) {
      setFullHref(`/shop/product/${full.slug}`)
    }

    // Find starter package
    const starter = products.find(
      (p) =>
        p.slug?.toLowerCase().includes('starter') ||
        p.title?.toLowerCase().includes('starter') ||
        p.priceMNT === 29900 ||
        p.priceMNT === 0 ||
        p.isFree
    )
    if (starter?.slug) {
      setStarterHref(`/shop/product/${starter.slug}`)
    }
  }, [products])

  const handleGetPlan = (plan: 'starter' | 'full', e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (plan === 'starter') {
      const match = products.find(
        (p) =>
          p.slug?.toLowerCase().includes('starter') ||
          p.title?.toLowerCase().includes('starter') ||
          p.priceMNT === 0 ||
          p.isFree
      )
      const starterProduct: StoreProduct = match
        ? {
            ...match,
            priceMNT: 0,
            priceUSD: 0,
            originalPriceMNT: match.originalPriceMNT || 29900,
            isFree: true,
            badge: 'ҮНЭГҮЙ ТАТАХ',
          }
        : {
            id: 'soniq-starter-pack-free',
            slug: 'soniq-starter-pack',
            title: 'Soniq Starter Pack',
            subtitle: 'Premiere Pro & After Effects Extension + 150+ сонгомол SFX',
            category: 'sfx',
            badge: 'ҮНЭГҮЙ ТАТАХ',
            rating: 5,
            reviewCount: 24,
            priceMNT: 0,
            originalPriceMNT: 29900,
            priceUSD: 0,
            originalPriceUSD: 9.99,
            image: '/images/products/soniq-starter.png',
            isFree: true,
            features: [
              'Soniq Premiere Pro & After Effects Extension',
              '150+ сонгомол SFX сан',
              '1 товшилтоор Timeline дээр шууд оруулах',
              'Үнэгүй турших эрх',
            ],
            compatibility: ['Premiere Pro 2022-2026', 'After Effects 2022-2026', 'Windows & macOS'],
            format: '.zxp / .sqp + WAV 24-bit 48kHz',
            fileSize: '320 MB',
            downloadCount: '3,850+',
            defaultWeTransferLink: '',
            description: 'Soniq extension болон 150+ SFX бүхий үнэгүй туршилтын багц.',
          }

      openCheckoutWithProduct(starterProduct)
      return
    }

    // Full plan (54,900 MNT promo until 12.01)
    const match =
      products.find(
        (p) =>
          p.slug?.toLowerCase().includes('full') ||
          p.title?.toLowerCase().includes('full') ||
          p.priceMNT === 54900 ||
          p.priceMNT === 59900 ||
          p.isBundle
      ) || ultimateBundle

    const fullProduct: StoreProduct = match
      ? {
          ...match,
          priceMNT: 54900,
          originalPriceMNT: match.originalPriceMNT || 89000,
          priceUSD: 15.99,
          originalPriceUSD: match.originalPriceUSD || 25.99,
          badge: '12.01 ХҮРТЭЛ 54,900₮',
        }
      : {
          id: 'soniq-full-bundle-promo',
          slug: 'soniq-full-bundle',
          title: 'Soniq Full Arsenal (Бүх сан + Насан туршийн эрх)',
          subtitle: 'Premiere Pro & After Effects Extension + 500+ бүх дууны сан',
          category: 'sfx',
          badge: '12.01 ХҮРТЭЛ 54,900₮',
          rating: 5,
          reviewCount: 48,
          priceMNT: 54900,
          originalPriceMNT: 89000,
          priceUSD: 15.99,
          originalPriceUSD: 25.99,
          image: '/images/products/soniq-full.png',
          features: [
            'Soniq Premiere Pro & After Effects Extension',
            'Бүх SFX багц (500+ өндөр чанартай дууны сан)',
            '1 товшилтоор Timeline дээр шууд оруулах',
            'Насан туршийн хэрэглээ & үнэгүй шинэчлэлт',
            'Арилжааны зориулалттай 100% лиценз',
          ],
          compatibility: ['Premiere Pro 2022-2026', 'After Effects 2022-2026', 'Windows & macOS'],
          format: '.zxp / .sqp + WAV 24-bit 48kHz',
          fileSize: '1.2 GB',
          downloadCount: '1,420+',
          defaultWeTransferLink: '',
          description: 'Soniq extension болон 500+ дууны сангийн бүрэн багц. 12-р сарын 1 хүртэл онцгой хямдралтай.',
        }

    openCheckoutWithProduct(fullProduct)
  }

  return (
    <main>
      <Navbar getHref={fullHref} onGetClick={(e) => handleGetPlan('full', e)} />
      <Hero
        fullHref={fullHref}
        starterHref={starterHref}
        onGetClick={(plan, e) => handleGetPlan(plan, e)}
      />
      <SoniqFeatures />
      <Stats />
      <Footer
        fullHref={fullHref}
        starterHref={starterHref}
        onGetClick={(plan, e) => handleGetPlan(plan, e)}
      />
      <StoreCheckoutModal />
    </main>
  )
}

export default function Page() {
  return (
    <StoreProvider>
      <HomePageContent />
    </StoreProvider>
  )
}
