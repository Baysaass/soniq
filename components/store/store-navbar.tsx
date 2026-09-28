'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft, Layers, Sparkles, HelpCircle } from 'lucide-react'
import { SoniqMark, SoniqWordmark } from '@/components/logo'
import { useStore } from '@/lib/store-context'

export function StoreNavbar() {
  const { cartCount, setIsCartOpen } = useStore()

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E6E6E3] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo & Store indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/shop" className="flex items-center gap-2 group" aria-label="Soniq Store">
            <SoniqMark className="w-5.5 h-auto text-[#00B0FF]" />
            <SoniqWordmark className="h-3.5 w-auto text-[#141414] group-hover:opacity-85 transition-opacity" fill="currentColor" />
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E5F6FF] text-[#0088CC] border border-[#00B0FF]/25 tracking-wide">
              STORE
            </span>
          </Link>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium text-zinc-600">
          <a
            href="/shop#bundle"
            className="hover:text-[#141414] hover:bg-zinc-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00B0FF]" />
            <span>Ultimate Bundle</span>
          </a>
          <a
            href="/shop#arsenal"
            className="hover:text-[#141414] hover:bg-zinc-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Бүх багцууд</span>
          </a>
          <a
            href="/shop#matrix"
            className="hover:text-[#141414] hover:bg-zinc-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
          >
            <span>Хэмнэлт</span>
          </a>
          <a
            href="/shop#faq"
            className="hover:text-[#141414] hover:bg-zinc-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span>FAQ</span>
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Back to Extension website */}
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 text-[12px] font-medium text-zinc-600 hover:text-[#141414] px-2.5 py-1.5 rounded-full hover:bg-zinc-100 transition-colors"
            title="Soniq Extension үндсэн сайт"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Extension сайт</span>
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 bg-[#141414] hover:bg-black text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer"
            aria-label="Сагс үзэх"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="tracking-wide">САГС</span>
            {cartCount > 0 ? (
              <span className="flex items-center justify-center min-w-4 h-4 px-1 bg-[#00B0FF] text-white text-[10px] font-bold rounded-full">
                {cartCount}
              </span>
            ) : (
              <span className="text-[10px] text-zinc-400 font-normal">0</span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

