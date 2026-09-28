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
} from 'lucide-react'
import { ULTIMATE_BUNDLE } from '@/lib/store-data'
import { useStore } from '@/lib/store-context'

export function StoreHero() {
  const {
    ultimateBundle,
    addToCart,
    openCheckoutWithProduct,
    formatPrice,
  } = useStore()

  const currentBundle = ultimateBundle || ULTIMATE_BUNDLE

  return (
    <section id="bundle" className="pt-6 pb-10 bg-[#FAFAFA] border-b border-[#E6E6E3]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Store Context & Directory Strip ("Эднийх юу юу байдаг газар вэ?") */}
        <div className="mb-6 bg-white border border-[#E6E6E3] rounded-xl p-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#E6E6E3]/70">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00B0FF] animate-pulse"></span>
              <span className="text-[12px] font-bold text-[#141414] tracking-tight">
                SONIQ STORE АРСЕНАЛ
              </span>
              <span className="text-zinc-400 text-[11px]">·</span>
              <span className="text-[11px] text-zinc-500 hidden sm:inline">
                Монголын кино & видео бүтээгчдэд зориулсан мэргэжлийн дижитал сан
              </span>
            </div>

            <Link
              href="/"
              className="text-[11px] font-semibold text-[#0088CC] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Soniq Premiere Extension үзэх</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 4 Core Pillars Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2.5 text-left">
            <a
              href="#arsenal"
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-50 transition-colors group"
            >
              <div className="w-7 h-7 rounded-md bg-[#E5F6FF] text-[#0088CC] flex items-center justify-center shrink-0">
                <Music2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-zinc-900 group-hover:text-[#0088CC] truncate">
                  5,000+ Sound FX
                </div>
                <div className="text-[10px] text-zinc-500 truncate">Braams, Whoosh, Reels</div>
              </div>
            </a>

            <a
              href="#arsenal"
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-50 transition-colors group"
            >
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Palette className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-zinc-900 group-hover:text-amber-600 truncate">
                  500+ Cine LUTs
                </div>
                <div className="text-[10px] text-zinc-500 truncate">Sony, Canon, iPhone Log</div>
              </div>
            </a>

            <a
              href="#arsenal"
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-50 transition-colors group"
            >
              <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Film className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-zinc-900 group-hover:text-indigo-600 truncate">
                  Presets & FX
                </div>
                <div className="text-[10px] text-zinc-500 truncate">Motion blur, Speed ramps</div>
              </div>
            </a>

            <Link
              href="/"
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-50 transition-colors group"
            >
              <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-zinc-900 group-hover:text-black truncate">
                  Soniq Extension
                </div>
                <div className="text-[10px] text-zinc-500 truncate">Premiere Pro апп</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Featured Ultimate Bundle Bento Card OR Welcome Banner */}
        {currentBundle ? (
          <div className="bg-white border border-[#E6E6E3] rounded-2xl p-4 sm:p-6 shadow-xs hover:shadow-sm transition-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-center">
              {/* Left: Product Artwork & Audio Preview */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] max-w-[360px] rounded-xl overflow-hidden border border-[#E6E6E3] bg-zinc-100 group shadow-xs">
                  <Image
                    src={currentBundle.image}
                    alt={currentBundle.title}
                    fill
                    priority
                    className="object-cover group-hover:scale-101 transition-transform duration-300"
                  />

                  {/* Badge & Video indicator */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <div className="bg-[#141414] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                      {currentBundle.badge || '85% ХЭМНЭЛТ'}
                    </div>
                    {currentBundle.sampleVideoUrl && (
                      <Link
                        href={`/shop/product/${currentBundle.slug}`}
                        className="bg-red-600/90 hover:bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 transition-colors"
                      >
                        <Film className="w-2.5 h-2.5" />
                        <span>ВИДЕОТОЙ</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Compatibility tags */}
                <div className="flex items-center justify-center gap-1 mt-2.5 flex-wrap text-[10px] text-zinc-500">
                  {(currentBundle.compatibility || ['Premiere Pro', 'DaVinci Resolve', 'After Effects', 'CapCut']).map((c, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200/80 font-medium">{c}</span>
                  ))}
                </div>
              </div>

              {/* Right: Info, Price, Actions */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E5F6FF] text-[#0088CC] border border-[#00B0FF]/20">
                    ХАМГИЙН ӨНДӨР БОРЛУУЛАЛТТАЙ
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    ИЖ БҮРЭН ЦОГЦ АРСЕНАЛ
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-[#141414] tracking-tight leading-snug">
                  {currentBundle.title}
                </h1>

                <p className="text-xs sm:text-[13px] text-zinc-600 mt-1 leading-relaxed">
                  {currentBundle.subtitle}
                </p>

                {/* 4 bullet points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5 text-xs text-zinc-700">
                  <div className="flex items-center gap-2 bg-[#F7F7F5] p-2 rounded-lg border border-[#E6E6E3]">
                    <Sparkles className="w-3.5 h-3.5 text-[#00B0FF] shrink-0" />
                    <span className="text-[11px] font-medium">Бүх багцын SFX дуу авиа</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#F7F7F5] p-2 rounded-lg border border-[#E6E6E3]">
                    <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-medium">WeTransfer өндөр хурдны шууд таталт</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#F7F7F5] p-2 rounded-lg border border-[#E6E6E3]">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="text-[11px] font-medium">100% Royalty Free арилжааны лиценз</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#F7F7F5] p-2 rounded-lg border border-[#E6E6E3]">
                    <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-[11px] font-medium">Шинэ дуунууд насан туршдаа үнэгүй</span>
                  </div>
                </div>

                {/* Price & Purchase CTA */}
                <div className="mt-4 pt-3.5 border-t border-[#E6E6E3] flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-[11px] text-zinc-400 line-through font-mono block">
                      {formatPrice(currentBundle.originalPriceMNT, currentBundle.originalPriceUSD)}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-[28px] font-black text-[#141414] tracking-tight">
                        {formatPrice(currentBundle.priceMNT, currentBundle.priceUSD)}
                      </span>
                      <span className="text-[10px] font-bold text-[#0088CC] bg-[#E5F6FF] px-1.5 py-0.5 rounded">
                        Нэг удаа төлнө
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openCheckoutWithProduct(currentBundle)}
                      className="py-2 px-4.5 rounded-full bg-[#141414] hover:bg-black text-white font-semibold text-xs tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Шууд авах</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => addToCart(currentBundle, true)}
                      className="py-2 px-3.5 rounded-full bg-white hover:bg-zinc-50 border border-[#E6E6E3] text-zinc-800 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Сагслах
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E6E6E3] rounded-2xl p-6 sm:p-8 shadow-xs text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5F6FF] text-[#0088CC] text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SONIQ DIGITAL CREATIVE STORE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141414] tracking-tight max-w-2xl mx-auto">
              Монголын Кино & Видео Бүтээгчдэд Зориулсан Мэргэжлийн Дижитал Сан
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2 max-w-xl mx-auto leading-relaxed">
              WeTransfer өндөр хурдны шууд таталт, 100% Commercial Royalty-Free лиценз бүхий дууны сан, өнгө, Premiere Pro өргөтгөлүүд.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 max-w-2xl mx-auto text-left">
              <div className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E6E6E3]">
                <div className="text-[#0088CC] font-bold text-xs mb-0.5">5,000+ SFX</div>
                <div className="text-[11px] text-zinc-500">Lossless 24-bit WAV дуунууд</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E6E6E3]">
                <div className="text-amber-600 font-bold text-xs mb-0.5">Cine LUTs</div>
                <div className="text-[11px] text-zinc-500">Sony, Canon, iPhone Log</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E6E6E3]">
                <div className="text-indigo-600 font-bold text-xs mb-0.5">WeTransfer Pro</div>
                <div className="text-[11px] text-zinc-500">Шууд татах холбоос</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E6E6E3]">
                <div className="text-emerald-600 font-bold text-xs mb-0.5">Royalty Free</div>
                <div className="text-[11px] text-zinc-500">Арилжааны бүрэн эрхтэй</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
