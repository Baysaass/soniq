'use client'

import React, { useState, useEffect } from 'react'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { ULTIMATE_BUNDLE } from '@/lib/store-data'
import { useStore } from '@/lib/store-context'

export function StoreStickyBar() {
  const { ultimateBundle, openCheckoutWithProduct, formatPrice } = useStore()
  const [show, setShow] = useState(false)

  const bundle = ultimateBundle || ULTIMATE_BUNDLE

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShow(true)
      } else {
        setShow(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!show || !bundle) return null

  return (
    <aside aria-label="Quick Purchase Floating Bar" className="fixed bottom-4 left-4 right-4 z-40 max-w-3xl mx-auto animate-in slide-in-from-bottom duration-200">
      <div className="bg-white/95 border border-[#E6E6E3] rounded-full p-2.5 sm:px-5 shadow-lg backdrop-blur-md flex items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E5F6FF] text-[#0088CC] shrink-0">
            {bundle.badge || '85% OFF'}
          </span>
          <span className="font-bold text-xs text-[#141414] truncate">
            {bundle.title}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-xs font-black text-[#141414]">
              {formatPrice(bundle.priceMNT, bundle.priceUSD)}
            </span>
          </div>

          <button
            onClick={() => openCheckoutWithProduct(bundle)}
            className="py-1.5 px-4 rounded-full bg-[#141414] hover:bg-black text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Шууд авах</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  )
}
