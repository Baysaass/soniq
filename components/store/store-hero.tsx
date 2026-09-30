'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShieldCheck,
  Download,
  Sparkles,
  Layers,
  ArrowRight,
  Film,
  Music2,
  Palette,
  Cpu,
  CheckCircle2,
  Zap,
  FolderLock,
  Headphones,
} from 'lucide-react'
import { ULTIMATE_BUNDLE } from '@/lib/store-data'
import { useStore } from '@/lib/store-context'
import { FileFormatBadgeList } from '@/components/store/file-format-badge'

export function StoreHero() {
  const {
    ultimateBundle,
    addToCart,
    openCheckoutWithProduct,
    formatPrice,
  } = useStore()

  const currentBundle = ultimateBundle || ULTIMATE_BUNDLE

  return (
    <section id="bundle" className="relative pt-6 pb-12 bg-gradient-to-b from-[#F2F7FD] via-[#FAFAFA] to-[#FAFAFA] border-b border-[#E6E6E3] overflow-hidden">
      {/* Subtle Background Radial Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(0,136,204,0.08),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Trust & Value Micro-Ticker */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none text-[11px] text-zinc-600">
          <div className="flex items-center gap-1.5 shrink-0 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-zinc-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-zinc-900">Google Drive Шууд таталт</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-zinc-200/80 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-zinc-900">100% Арилжааны зориулалттай</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-zinc-200/80 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-zinc-900">Figma, Word, PDF & SFX багцууд</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-zinc-200/80 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-zinc-900">Хаан Банк шууд дансаар</span>
          </div>
        </div>

        {/* 4 Pillars Category Bento Strip */}
        <div className="mb-6 bg-white/95 backdrop-blur-xs border border-zinc-200/90 rounded-2xl p-3.5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0088CC]" />
              <span className="text-xs font-black tracking-wider uppercase text-zinc-900">
                SONIQ STORE АРСЕНАЛ
              </span>
              <span className="text-zinc-300">·</span>
              <span className="text-xs text-zinc-500 hidden md:inline">
                Бүтээгчид & график дизайнеруудад зориулсан мэргэжлийн дижитал хэрэгслүүд
              </span>
            </div>

            <Link
              href="/"
              className="text-xs font-bold text-[#0088CC] hover:text-[#006699] flex items-center gap-1 transition-colors self-start sm:self-auto group"
            >
              <span>Soniq Premiere Extension</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Bento Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3">
            <a
              href="#arsenal"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50/70 hover:bg-blue-50/50 border border-zinc-200/60 hover:border-blue-300 transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#0088CC] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-900 group-hover:text-[#0088CC] truncate">
                  Дизайн & Загварууд
                </div>
                <div className="text-[10px] text-zinc-500 font-mono truncate">Figma, Word, PDF, PSD</div>
              </div>
            </a>

            <a
              href="#arsenal"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50/70 hover:bg-amber-50/50 border border-zinc-200/60 hover:border-amber-300 transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Palette className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-900 group-hover:text-amber-700 truncate">
                  Өнгө шүүлтүүр & LUTs
                </div>
                <div className="text-[10px] text-zinc-500 font-mono truncate">Sony, iPhone, 3D LUT</div>
              </div>
            </a>

            <a
              href="#arsenal"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50/70 hover:bg-emerald-50/50 border border-zinc-200/60 hover:border-emerald-300 transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Music2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-900 group-hover:text-emerald-700 truncate">
                  Аудио & Sound FX
                </div>
                <div className="text-[10px] text-zinc-500 font-mono truncate">Reels, Video, Lossless</div>
              </div>
            </a>

            <Link
              href="/"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50/70 hover:bg-purple-50/50 border border-zinc-200/60 hover:border-purple-300 transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-900 group-hover:text-purple-700 truncate">
                  Soniq Workflow Tools
                </div>
                <div className="text-[10px] text-zinc-500 font-mono truncate">Бүтээмжийн плагин</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Featured Spotlight Card */}
        {currentBundle && (
          <div className="relative bg-white border border-zinc-200 rounded-3xl p-5 sm:p-7 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            {/* Ambient Corner Accent */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/10 via-indigo-400/5 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Left Column: Artwork */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] max-w-[400px] rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 group shadow-xs">
                  <Image
                    src={currentBundle.image}
                    alt={currentBundle.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover group-hover:scale-102 transition-transform duration-500"
                  />

                  {/* Badge & Video indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
                    <div className="bg-[#141414]/90 backdrop-blur-xs text-white text-[10px] font-black px-3 py-1 rounded-full shadow-xs tracking-wider uppercase">
                      {currentBundle.badge || 'ОНЦЛОХ БАГЦ'}
                    </div>
                    {currentBundle.sampleVideoUrl && (
                      <Link
                        href={`/shop/product/${currentBundle.slug}`}
                        className="bg-red-600/90 hover:bg-red-600 text-white text-[9px] font-bold px-2 py-0.8 rounded-full shadow-xs flex items-center gap-1 transition-colors"
                      >
                        <Film className="w-3 h-3" />
                        <span>Үзэх</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Formats Strip */}
                <div className="mt-3 w-full flex items-center justify-center">
                  {(() => {
                    const fmts = Array.isArray(currentBundle.fileFormats) && currentBundle.fileFormats.length > 0
                      ? currentBundle.fileFormats
                      : (currentBundle.format ? currentBundle.format.split(',').map((s) => s.trim()).filter(Boolean) : [])
                    if (fmts.length > 0) {
                      return <FileFormatBadgeList formats={fmts} size="sm" />
                    }
                    return null
                  })()}
                </div>
              </div>

              {/* Right Column: Info, Price, Actions */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#0088CC] border border-blue-200">
                    ХАМГИЙН ӨНДӨР ЭРЭЛТТЭЙ
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">·</span>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Google Drive Шууд таталт
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight leading-snug">
                  {currentBundle.title}
                </h1>

                <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
                  {currentBundle.subtitle}
                </p>

                {/* 4 Feature Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 text-xs">
                  <div className="flex items-center gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/70">
                    <Sparkles className="w-4 h-4 text-[#0088CC] shrink-0" />
                    <span className="font-semibold text-zinc-800">Бүрэн засварлах эх файлууд</span>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/70">
                    <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-zinc-800">Google Drive хурдан таталт</span>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/70">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-zinc-800">100% Арилжааны зориулалттай</span>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/70">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-semibold text-zinc-800">Насан туршийн үнэгүй эрх</span>
                  </div>
                </div>

                {/* Price & Checkout Action Bar */}
                <div className="mt-5 pt-4 border-t border-zinc-200 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    {currentBundle.originalPriceMNT > currentBundle.priceMNT && (
                      <span className="text-xs text-zinc-400 line-through font-mono block">
                        {formatPrice(currentBundle.originalPriceMNT, currentBundle.originalPriceUSD)}
                      </span>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                        {formatPrice(currentBundle.priceMNT, currentBundle.priceUSD)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Нэг удаа төлнө
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openCheckoutWithProduct(currentBundle)}
                      className="py-2.5 px-6 rounded-full bg-[#141414] hover:bg-black text-white text-xs font-bold tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Шууд авах</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => addToCart(currentBundle, true)}
                      className="py-2.5 px-4 rounded-full bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Сагслах
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
