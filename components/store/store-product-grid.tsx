'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Plus,
  Check,
  Search,
  ArrowRight,
  ExternalLink,
  Film,
  Layers,
} from 'lucide-react'
import { STORE_PRODUCTS } from '@/lib/store-data'
import { useStore } from '@/lib/store-context'

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

  const filteredProducts = (products || []).filter((product) => {
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

  const sfxCount = (products || []).filter((p) => p.category === 'sfx').length
  const lutsCount = (products || []).filter((p) => p.category === 'luts').length
  const pluginsCount = (products || []).filter((p) => p.category === 'plugins').length

  const categories = [
    { key: 'all', label: `Бүгд (${(products || []).length})` },
    { key: 'sfx', label: `Sound FX (${sfxCount})` },
    { key: 'luts', label: `LUTs & Өнгө (${lutsCount})` },
    { key: 'plugins', label: `Presets & Хэрэгслүүд (${pluginsCount})` },
  ]

  const isItemInCart = (id: string) => cart.some((item) => item.product.id === id)

  return (
    <section id="arsenal" className="py-8 sm:py-10 bg-white border-b border-[#E6E6E3]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-bold text-[#0088CC] uppercase tracking-wider bg-[#E5F6FF] px-2 py-0.5 rounded">
                ДЭЛГҮҮРИЙН КАТАЛОГ
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#141414] tracking-tight">
              Бүх бүтээгдэхүүнүүд ({filteredProducts.length})
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Татах арга: WeTransfer шууд таталт · Арилжааны бүрэн эрхтэй
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Багц хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#F7F7F5] border border-[#E6E6E3] text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#00B0FF] transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 scrollbar-none">
          {categories.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'bg-[#F7F7F5] text-zinc-600 hover:text-black hover:bg-zinc-200/70 border border-[#E6E6E3]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid OR Loading Skeleton OR Empty State */}
        {!productsLoaded && filteredProducts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-[#E6E6E3] rounded-xl p-3 shadow-xs animate-pulse">
                <div className="aspect-[16/10] rounded-lg bg-zinc-200 mb-2.5" />
                <div className="h-2.5 bg-zinc-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-zinc-200 rounded w-3/4 mb-1.5" />
                <div className="h-3 bg-zinc-100 rounded w-full mb-3" />
                <div className="h-8 bg-zinc-200 rounded-lg w-full mt-2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[#E6E6E3] rounded-2xl bg-[#FAFAFA] p-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {filteredProducts.map((product) => {
              const inCart = isItemInCart(product.id)

            return (
              <div
                key={product.id}
                className="bg-white border border-[#E6E6E3] rounded-xl p-3 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Product Artwork */}
                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-zinc-100 mb-2.5 border border-zinc-100">
                    <Link href={`/shop/product/${product.slug}`} className="block w-full h-full">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    </Link>

                    <div className="absolute top-2 left-2 flex items-center gap-1 flex-wrap">
                      {product.badge && (
                        <div className="bg-[#141414]/90 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                          {product.badge}
                        </div>
                      )}
                      {product.sampleVideoUrl && (
                        <div className="bg-red-600/90 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5" title="Sample видео үзэх">
                          <Film className="w-2.5 h-2.5" />
                          <span>Demo</span>
                        </div>
                      )}
                      {product.images && product.images.length > 1 && (
                        <div className="bg-black/85 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5" title={`${product.images.length} зурагтай галерей`}>
                          <Layers className="w-2.5 h-2.5 text-[#00B0FF]" />
                          <span>{product.images.length}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mb-1">
                    <span className="uppercase">{product.category}</span>
                    <span>{product.fileSize}</span>
                  </div>

                  <Link
                    href={`/shop/product/${product.slug}`}
                    className="font-bold text-xs text-[#141414] hover:text-[#0088CC] transition-colors line-clamp-1 block"
                  >
                    {product.title}
                  </Link>

                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                    {product.subtitle}
                  </p>
                </div>

                {/* Price & Actions */}
                <div className="mt-3 pt-2.5 border-t border-[#E6E6E3]">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-extrabold text-[13px] text-[#141414]">
                      {formatPrice(product.priceMNT, product.priceUSD)}
                    </span>
                    <span className="text-[10px] text-zinc-400 line-through font-mono">
                      {formatPrice(product.originalPriceMNT, product.originalPriceUSD)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => openCheckoutWithProduct(product)}
                      className="py-1.5 px-2 rounded-lg bg-[#141414] hover:bg-black text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Шууд авах</span>
                    </button>

                    <button
                      onClick={() => addToCart(product, true)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors border cursor-pointer flex items-center justify-center gap-1 ${
                        inCart
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-[#F7F7F5] hover:bg-zinc-200/70 text-zinc-800 border-[#E6E6E3]'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Нэмэгдсэн</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Сагслах</span>
                        </>
                      )}
                    </button>
                  </div>

                  <Link
                    href={`/shop/product/${product.slug}`}
                    className="mt-2 text-[10px] font-medium text-zinc-400 hover:text-[#0088CC] flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Дэлгэрэнгүй & Сонсох</span>
                    <ArrowRight className="w-2.5 h-2.5" />
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
