'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Plus,
  Check,
  Search,
  ArrowRight,
  Film,
  Layers,
  Zap,
  X,
  Sparkles,
} from 'lucide-react'
import { useStore } from '@/lib/store-context'
import { FileFormatBadgeList } from '@/components/store/file-format-badge'

export function StoreProductGrid() {
  const {
    products,
    productsLoaded,
    addToCart,
    openCheckoutWithProduct,
    formatPrice,
    cart,
  } = useStore()

  const [activeTab, setActiveTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const allProducts = products || []

  const filteredProducts = allProducts.filter((product) => {
    if (activeTab !== 'all' && product.category !== activeTab) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        product.title.toLowerCase().includes(q) ||
        product.subtitle.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q)
      )
    }
    return true
  })

  const sfxCount = allProducts.filter((p) => p.category === 'sfx').length
  const lutsCount = allProducts.filter((p) => p.category === 'luts').length
  const pluginsCount = allProducts.filter((p) => p.category === 'plugins').length

  const categories = [
    { key: 'all', label: 'Бүгд', count: allProducts.length },
    { key: 'sfx', label: 'Sound FX', count: sfxCount },
    { key: 'luts', label: 'LUTs & Өнгө', count: lutsCount },
    { key: 'plugins', label: 'Presets & Хэрэгслүүд', count: pluginsCount },
  ]

  const isItemInCart = (id: string) => cart.some((item) => item.product.id === id)

  return (
    <section id="arsenal" className="py-10 sm:py-14 bg-white border-b border-zinc-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E5F6FF] text-[#0088CC] border border-[#00B0FF]/25 mb-2">
              <Sparkles className="w-3 h-3 text-[#0088CC]" />
              <span>ДЭЛГҮҮРИЙН КАТАЛОГ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141414] tracking-tight">
              Бүх бүтээгдэхүүнүүд
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Google Drive шууд таталт · 100% арилжааны бүрэн эрхтэй
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Багц хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-8 py-2 rounded-full bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#0088CC] focus:ring-2 focus:ring-[#0088CC]/15 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {categories.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#141414] text-white shadow-sm shadow-black/10'
                    : 'bg-zinc-100/80 text-zinc-600 hover:text-black hover:bg-zinc-200/70 border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Product Cards Grid OR Loading Skeleton OR Empty State */}
        {!productsLoaded && filteredProducts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs animate-pulse">
                <div className="aspect-[16/10] rounded-xl bg-zinc-200/70 mb-3" />
                <div className="h-3 bg-zinc-200/70 rounded w-1/3 mb-2" />
                <div className="h-4 bg-zinc-200/70 rounded w-3/4 mb-2" />
                <div className="h-3 bg-zinc-100 rounded w-full mb-4" />
                <div className="h-9 bg-zinc-200/70 rounded-xl w-full mt-2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50 p-8">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 mb-1">
              {searchQuery.trim() ? 'Хайлтын илэрц олдсонгүй' : 'Одоогоор бүтээгдэхүүн бүртгэгдээгүй байна'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              {searchQuery.trim()
                ? `"${searchQuery}" түлхүүр үгээр тохирох бүтээгдэхүүн олдсонгүй. Өөр үгээр хайна уу.`
                : 'Админ удирдлагын хэсгээс бүтээгдэхүүн нэмснээр энд шууд байрших болно.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
            {filteredProducts.map((product) => {
              const inCart = isItemInCart(product.id)
              const hasDiscount =
                product.originalPriceMNT && product.originalPriceMNT > product.priceMNT

              return (
                <div
                  key={product.id}
                  className="bg-white border border-zinc-200/80 hover:border-zinc-300 rounded-2xl p-3.5 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1"
                >
                  <div>
                    {/* Product Artwork Container */}
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-zinc-100 mb-3 border border-zinc-100/80">
                      <Link href={`/shop/product/${product.slug}`} className="block w-full h-full">
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </Link>

                      {/* Top floating badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap z-10">
                        {product.badge && (
                          <div className="bg-[#141414]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            {product.badge}
                          </div>
                        )}
                        {product.sampleVideoUrl && (
                          <div
                            className="bg-rose-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
                            title="Sample видео үзэх"
                          >
                            <Film className="w-2.5 h-2.5" />
                            <span>Demo</span>
                          </div>
                        )}
                        {product.images && product.images.length > 1 && (
                          <div
                            className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
                            title={`${product.images.length} зурагтай галерей`}
                          >
                            <Layers className="w-2.5 h-2.5 text-[#00B0FF]" />
                            <span>{product.images.length}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category & File Formats */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mb-1.5 gap-2">
                      <span className="uppercase tracking-wider shrink-0 text-zinc-500 font-semibold text-[10px]">
                        {product.category}
                      </span>
                      {(() => {
                        const fmts =
                          Array.isArray(product.fileFormats) && product.fileFormats.length > 0
                            ? product.fileFormats
                            : product.format
                            ? product.format.split(',').map((s) => s.trim()).filter(Boolean)
                            : []
                        if (fmts.length > 0) {
                          return <FileFormatBadgeList formats={fmts} size="xs" max={2} />
                        }
                        if (product.fileSize) {
                          return <span className="truncate">{product.fileSize}</span>
                        }
                        return null
                      })()}
                    </div>

                    {/* Product Title */}
                    <Link
                      href={`/shop/product/${product.slug}`}
                      className="font-bold text-sm text-[#141414] hover:text-[#0088CC] transition-colors line-clamp-1 block"
                    >
                      {product.title}
                    </Link>

                    {/* Subtitle */}
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                      {product.subtitle}
                    </p>
                  </div>

                  {/* Price & Actions Bento Bottom */}
                  <div className="mt-3.5 pt-3 border-t border-zinc-100">
                    <div className="flex items-baseline justify-between mb-2.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-sm sm:text-base text-[#141414]">
                          {formatPrice(product.priceMNT, product.priceUSD)}
                        </span>
                        {product.originalPriceMNT && (
                          <span className="text-[11px] text-zinc-400 line-through font-mono">
                            {formatPrice(product.originalPriceMNT, product.originalPriceUSD)}
                          </span>
                        )}
                      </div>
                      {hasDiscount && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                          ХЯМДРАЛТАЙ
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openCheckoutWithProduct(product)}
                        className="py-2 px-2.5 rounded-xl bg-[#141414] hover:bg-black text-white text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Zap className="w-3.5 h-3.5 text-[#00B0FF]" />
                        <span>Шууд авах</span>
                      </button>

                      <button
                        onClick={() => addToCart(product, true)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all duration-150 border cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                          inCart
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200'
                        }`}
                      >
                        {inCart ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Нэмэгдсэн</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Сагслах</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Detail link */}
                    <Link
                      href={`/shop/product/${product.slug}`}
                      className="mt-2.5 text-[11px] font-medium text-zinc-400 hover:text-[#0088CC] flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>
                        {product.previewSoundType && product.previewSoundType !== 'none'
                          ? 'Дэлгэрэнгүй & Сонсох'
                          : 'Дэлгэрэнгүй үзэх'}
                      </span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
