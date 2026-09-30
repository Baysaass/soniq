'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft, Layers, Sparkles, HelpCircle } from 'lucide-react'
import { SoniqMark, SoniqWordmark } from '@/components/logo'
import { useStore } from '@/lib/store-context'

export function StoreNavbar() {
  const { cartCount, setIsCartOpen } = useStore()

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
        {/* Logo & Store indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/shop" className="flex items-center gap-2 group" aria-label="Soniq Store">
            <div className="relative">
              <SoniqMark className="w-6 h-auto text-[#0088CC] group-hover:scale-105 transition-transform duration-200" />
            </div>
            <SoniqWordmark className="h-4 w-auto text-[#141414] group-hover:opacity-90 transition-opacity" fill="currentColor" />
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E5F6FF] text-[#0088CC] border border-[#00B0FF]/30 tracking-wider shadow-xs">
              STORE
            </span>
          </Link>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-[13px] font-medium text-zinc-600">
          <a
            href="/shop#bundle"
            className="hover:text-[#141414] hover:bg-zinc-100/80 px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0088CC]" />
            <span>Ultimate Bundle</span>
          </a>
          <a
            href="/shop#arsenal"
            className="hover:text-[#141414] hover:bg-zinc-100/80 px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Бүх багцууд</span>
          </a>
          <a
            href="/shop#faq"
            className="hover:text-[#141414] hover:bg-zinc-100/80 px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5"
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
            className="hidden sm:flex items-center gap-1.5 text-[12px] font-medium text-zinc-600 hover:text-[#141414] px-3 py-1.5 rounded-full hover:bg-zinc-100/80 transition-colors"
            title="Soniq Extension үндсэн сайт"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Extension сайт</span>
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-[#141414] hover:bg-black text-white px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Сагс үзэх"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="tracking-wide">САГС</span>
            {cartCount > 0 ? (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#0088CC] text-white text-[10px] font-bold rounded-full animate-in zoom-in-50 duration-200">
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


