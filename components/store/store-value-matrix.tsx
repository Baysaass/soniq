'use client'

import React from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { VALUE_MATRIX, ULTIMATE_BUNDLE } from '@/lib/store-data'
import { useStore } from '@/lib/store-context'

export function StoreValueMatrix() {
  const { ultimateBundle, openCheckoutWithProduct, formatPrice } = useStore()
  const currentBundle = ultimateBundle || ULTIMATE_BUNDLE

  if (!currentBundle) {
    return null
  }

  return (
    <section id="matrix" className="py-8 sm:py-10 bg-[#FAFAFA] border-b border-[#E6E6E3]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold text-[#0088CC] uppercase tracking-wider block mb-1">
            ХЭМНЭЛТ & ХАРЬЦУУЛАЛТ
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#141414] tracking-tight">
            Тус тусад нь авах VS {currentBundle.title}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5 max-w-md mx-auto">
            Багцын бүх бүтээгдэхүүнийг тусад нь авснаас нэг цогц багцаар авбал их хэмжээний хэмнэлт эдэлнэ.
          </p>
        </div>

        {/* Matrix Table */}
        <div className="rounded-xl border border-[#E6E6E3] bg-white overflow-hidden shadow-xs">
          <div className="grid grid-cols-12 bg-[#F7F7F5] border-b border-[#E6E6E3] p-2.5 sm:p-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-600">
            <div className="col-span-6 sm:col-span-7">Агуулга & Эрхүүд</div>
            <div className="col-span-3 sm:col-span-2 text-center text-zinc-400">Тусад нь</div>
            <div className="col-span-3 text-center text-[#0088CC] font-bold">{currentBundle.title}</div>
          </div>

          <div className="divide-y divide-[#E6E6E3] text-xs">
            {VALUE_MATRIX.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 p-2.5 sm:p-3 items-center hover:bg-zinc-50/60 transition-colors"
              >
                <div className="col-span-6 sm:col-span-7 font-medium text-zinc-800 line-clamp-1 text-xs">
                  {row.item}
                </div>
                <div className="col-span-3 sm:col-span-2 text-center font-mono text-zinc-400 text-[11px]">
                  {row.separate}
                </div>
                <div className="col-span-3 text-center font-semibold text-emerald-600 flex items-center justify-center gap-1 text-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="hidden sm:inline">Орсон</span>
                </div>
              </div>
            ))}
          </div>

          {/* Matrix Footer */}
          <div className="bg-[#F7F7F5] p-3 sm:p-4 border-t border-[#E6E6E3] flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-[10px] text-zinc-400 block">Хэмнэлттэй цогц санал:</span>
              <div className="text-base sm:text-lg font-extrabold text-[#141414]">
                Багцын үнэ: {formatPrice(currentBundle.priceMNT, currentBundle.priceUSD)}
              </div>
            </div>

            <button
              onClick={() => openCheckoutWithProduct(currentBundle)}
              className="py-2 px-4 rounded-full bg-[#141414] hover:bg-black text-white font-semibold text-xs tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>Багцыг авах ({currentBundle.badge || 'OFF'})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

