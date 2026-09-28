'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { FAQS } from '@/lib/store-data'

export function StoreFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="py-8 sm:py-10 bg-white border-b border-[#E6E6E3]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold text-[#0088CC] uppercase tracking-wider block mb-1">
            АСУУЛТ & ХАРИУЛТ
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#141414] tracking-tight">
            Түгээмэл асуултууд
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Таталт, төлбөр болон лицензийн талаарх гол мэдээллүүд
          </p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx

            return (
              <div
                key={idx}
                className="rounded-xl border border-[#E6E6E3] bg-[#FAFAFA] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 font-semibold text-xs sm:text-sm text-[#141414] hover:text-[#0088CC] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#0088CC]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-600 leading-relaxed border-t border-[#E6E6E3]/60 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
