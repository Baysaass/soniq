'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { SoniqFeatures } from '@/components/soniq-features'
import { Stats } from '@/components/stats'
import { Footer } from '@/components/footer'

interface BasicProduct {
  id: string
  slug: string
  title: string
  priceMNT?: number
  isBundle?: boolean
}

export default function Page() {
  const [fullHref, setFullHref] = useState('/shop?plan=full')
  const [starterHref, setStarterHref] = useState('/shop?plan=starter')

  useEffect(() => {
    const resolveHrefs = (list: BasicProduct[]) => {
      if (!Array.isArray(list) || list.length === 0) return

      // Find full package / bundle
      const full = list.find(
        (p) =>
          p.slug?.toLowerCase().includes('full') ||
          p.title?.toLowerCase().includes('full') ||
          p.priceMNT === 59900 ||
          p.isBundle
      )
      if (full?.slug) {
        setFullHref(`/shop/product/${full.slug}`)
      }

      // Find starter package
      const starter = list.find(
        (p) =>
          p.slug?.toLowerCase().includes('starter') ||
          p.title?.toLowerCase().includes('starter') ||
          p.priceMNT === 29900
      )
      if (starter?.slug) {
        setStarterHref(`/shop/product/${starter.slug}`)
      }
    }

    // 1. Instant check from cached products in localStorage
    try {
      const cached = localStorage.getItem('soniq_products_cache')
      if (cached) {
        const parsed = JSON.parse(cached)
        resolveHrefs(parsed)
      }
    } catch {}

    // 2. Fetch fresh products from API
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.products && Array.isArray(data.products)) {
          resolveHrefs(data.products)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <main>
      <Navbar getHref={fullHref} />
      <Hero fullHref={fullHref} starterHref={starterHref} />
      <SoniqFeatures />
      <Stats />
      <Footer fullHref={fullHref} starterHref={starterHref} />
    </main>
  )
}
