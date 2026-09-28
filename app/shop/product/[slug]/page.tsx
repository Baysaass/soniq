'use client'

import React, { use, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShieldCheck,
  Download,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
  ShoppingBag,
  Film,
  Music2,
  Palette,
} from 'lucide-react'
import { STORE_PRODUCTS, ULTIMATE_BUNDLE, StoreProduct } from '@/lib/store-data'
import { StoreProvider, useStore } from '@/lib/store-context'
import { StoreAnnouncementBar } from '@/components/store/store-announcement-bar'
import { StoreNavbar } from '@/components/store/store-navbar'
import { StoreFooter } from '@/components/store/store-footer'
import { StoreCartDrawer } from '@/components/store/store-cart-drawer'
import { StoreCheckoutModal } from '@/components/store/store-checkout-modal'
import { StoreSampleVideo } from '@/components/store/store-sample-video'

function ProductDetailContent({ slug }: { slug: string }) {
  const {
    products,
    ultimateBundle,
    openCheckoutWithProduct,
    addToCart,
    formatPrice,
  } = useStore()

  const product = (products || []).find((p) => p.slug === slug) || (products && products.length > 0 ? products[0] : null)
  const bundle = ultimateBundle || ULTIMATE_BUNDLE

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#141414] font-sans flex flex-col justify-between">
        <div>
          <StoreAnnouncementBar />
          <StoreNavbar />
          <main className="max-w-xl mx-auto px-4 py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 mb-2">Бүтээгдэхүүн олдсонгүй</h1>
            <p className="text-xs text-zinc-500 mb-6">
              Таны хайсан бүтээгдэхүүн одоогоор дэлгүүрт байхгүй эсвэл хараахан нийтлэгдээгүй байна.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#141414] text-white text-xs font-semibold hover:bg-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Дэлгүүр рүү буцах</span>
            </Link>
          </main>
        </div>
        <StoreFooter />
      </div>
    )
  }

  const otherProducts = (products || []).filter((p) => p.id !== product.id).slice(0, 4)

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#141414] font-sans">
      <StoreAnnouncementBar />
      <StoreNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {/* Store Context Notification Banner ("Эднийх юу юу байдаг газар вэ?") */}
        <div className="mb-5 bg-white border border-[#E6E6E3] rounded-xl p-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00B0FF] shrink-0"></span>
              <p className="text-xs text-zinc-600">
                <strong className="text-[#141414] font-semibold">Soniq Store:</strong> Кино, Reels, YouTube эвлүүлэгчдэд зориулсан SFX, LUTs, болон Premiere Pro өргөтгөлүүдийн албан ёсны сан.
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
              <Link
                href="/shop#arsenal"
                className="text-[11px] font-semibold text-[#0088CC] hover:underline flex items-center gap-1"
              >
                <span>Бүх багцуудыг үзэх</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4 flex-wrap">
          <Link href="/shop" className="hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Soniq Store</span>
          </Link>
          <span>/</span>
          <Link href="/shop#arsenal" className="uppercase text-zinc-400 font-mono text-[10px] hover:text-black">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-zinc-800 font-semibold truncate max-w-xs">{product.title}</span>
        </div>

        {/* Main Product Split Card - Compact & Clean */}
        <div className="bg-white border border-[#E6E6E3] rounded-2xl p-4 sm:p-6 shadow-xs mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Product Artwork & Audio Preview */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden border border-[#E6E6E3] bg-zinc-100 group shadow-xs">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  priority
                  className="object-cover"
                />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                  {product.badge && (
                    <div className="bg-[#141414] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {product.badge}
                    </div>
                  )}
                  {product.sampleVideoUrl && (
                    <div className="bg-red-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Film className="w-2.5 h-2.5" />
                      <span>ВИДЕОТОЙ</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div className="w-full grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#E6E6E3]">
                  <span className="text-[10px] text-zinc-400 block font-mono">ХЭМЖЭЭ</span>
                  <span className="font-bold text-[#141414] text-xs">{product.fileSize}</span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#E6E6E3]">
                  <span className="text-[10px] text-zinc-400 block font-mono">ФОРМАТ</span>
                  <span className="font-bold text-[#141414] text-xs">WAV Lossless 24-bit</span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#E6E6E3]">
                  <span className="text-[10px] text-zinc-400 block font-mono">ЛИЦЕНЗ</span>
                  <span className="font-bold text-emerald-600 text-xs">100% Commercial</span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#E6E6E3]">
                  <span className="text-[10px] text-zinc-400 block font-mono">ТАТАЛТ</span>
                  <span className="font-bold text-[#141414] text-xs">WeTransfer Pro</span>
                </div>
              </div>

              {/* Compatible Apps */}
              <div className="w-full mt-2.5 pt-2 border-t border-[#E6E6E3] flex items-center justify-center gap-1.5 flex-wrap text-[10px] text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200/80">Premiere Pro</span>
                <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200/80">DaVinci Resolve</span>
                <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200/80">After Effects</span>
                <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200/80">CapCut</span>
                <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200/80">Final Cut</span>
              </div>
            </div>

            {/* Right: Info, Price, Actions */}
            <div className="md:col-span-7 flex flex-col">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                  {product.category}
                </span>
                <span className="text-zinc-300">·</span>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  Commercial Royalty-Free
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-[#141414] tracking-tight">
                {product.title}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-600 mt-1 leading-relaxed">
                {product.subtitle}
              </p>

              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                {product.description}
              </p>

              {/* Highlights checklist */}
              <div className="space-y-1.5 my-3.5 pt-3 border-t border-[#E6E6E3] text-xs text-zinc-700">
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Price & Checkout Actions */}
              <div className="pt-3 border-t border-[#E6E6E3]">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl sm:text-3xl font-black text-[#141414] tracking-tight">
                    {formatPrice(product.priceMNT, product.priceUSD)}
                  </span>
                  <span className="text-xs text-zinc-400 line-through font-mono">
                    {formatPrice(product.originalPriceMNT, product.originalPriceUSD)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Нэг удаа төлнө · Насан туршийн эрх
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => openCheckoutWithProduct(product)}
                    className="py-2.5 px-5 rounded-full bg-[#141414] hover:bg-black text-white font-semibold text-xs tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Шууд авах</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => addToCart(product, true)}
                    className="py-2.5 px-4 rounded-full bg-white hover:bg-zinc-50 border border-[#E6E6E3] text-zinc-800 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Сагслах</span>
                  </button>
                </div>
              </div>

              {/* Smart Bundle Upsell Card */}
              {bundle && product.id !== bundle.id && (
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-50/70 to-blue-50/70 border border-amber-200/80">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>ХЭМНЭЛТТЭЙ САНАЛ: БҮХ БАГЦЫГ ХАМТАД НЬ АВАХ</span>
                      </div>
                      <p className="text-[11px] text-zinc-700 mt-0.5 leading-snug">
                        Энэ багцыг тусад нь авснаас {bundle.title}-аас авбал илүү хэмнэлттэй: <strong>{formatPrice(bundle.priceMNT, bundle.priceUSD)}</strong>.
                      </p>
                    </div>

                    <button
                      onClick={() => openCheckoutWithProduct(bundle)}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-black text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Bundle авах →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sample Video Showcase if available */}
        {product.sampleVideoUrl && (
          <StoreSampleVideo
            videoUrl={product.sampleVideoUrl}
            productTitle={product.title}
            posterImage={product.image}
            subtitle={product.subtitle}
          />
        )}



        {/* Explore Other Packs from Soniq Store ("Эднийх өөр юу юу байдаг вэ?") */}
        {otherProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#0088CC] uppercase tracking-wider block">
                  SONIQ КАТАЛОГ
                </span>
                <h3 className="text-lg font-bold text-[#141414] tracking-tight">
                  Дэлгүүрийн бусад эрэлттэй багцууд
                </h3>
              </div>
              <Link
                href="/shop#arsenal"
                className="text-xs font-semibold text-[#0088CC] hover:underline flex items-center gap-1"
              >
                <span>Бүгдийг үзэх</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {otherProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E6E6E3] rounded-xl p-3 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-zinc-100 mb-2 border border-zinc-100">
                      <Link href={`/shop/product/${item.slug}`}>
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover hover:scale-102 transition-transform"
                        />
                      </Link>
                    </div>

                    <Link
                      href={`/shop/product/${item.slug}`}
                      className="font-bold text-xs text-[#141414] hover:text-[#0088CC] transition-colors line-clamp-1 block"
                    >
                      {item.title}
                    </Link>
                    <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#E6E6E3] flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[#141414]">
                      {formatPrice(item.priceMNT, item.priceUSD)}
                    </span>

                    <Link
                      href={`/shop/product/${item.slug}`}
                      className="text-[10px] font-bold text-[#0088CC] hover:underline flex items-center gap-0.5"
                    >
                      <span>Үзэх</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <StoreFooter />
      <StoreCartDrawer />
      <StoreCheckoutModal />
    </div>
  )
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = use(params)
  return (
    <StoreProvider>
      <ProductDetailContent slug={resolvedParams.slug} />
    </StoreProvider>
  )
}
