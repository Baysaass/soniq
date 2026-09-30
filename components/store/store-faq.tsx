'use client'

import React, { useState } from 'react'
import { ChevronDown, HelpCircle, MessageCircle, Send } from 'lucide-react'
import { FAQS, STORE_SETTINGS } from '@/lib/store-data'
import { useStore } from '@/lib/store-context'

export function StoreFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { settings } = useStore()
  const bankInfo = settings?.bankInfo || STORE_SETTINGS.bankInfo

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="py-12 sm:py-16 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E5F6FF] text-[#0088CC] border border-[#00B0FF]/25 mb-2.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#0088CC]" />
            <span>АСУУЛТ & ХАРИУЛТ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141414] tracking-tight">
            Түгээмэл асуултууд
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Таталт, төлбөр болон лицензийн талаарх гол мэдээллүүд
          </p>
        </div>

        {/* Bento FAQ Accordion */}
        <div className="space-y-2.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx

            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-zinc-300 bg-white shadow-sm ring-1 ring-black/5'
                    : 'border-zinc-200 bg-white/70 hover:bg-white hover:border-zinc-300'
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-4.5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-[#141414] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 text-[11px] font-mono font-bold text-zinc-500 shrink-0">
                      0{idx + 1}
                    </span>
                    <span className="hover:text-[#0088CC] transition-colors">{faq.q}</span>
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      isOpen ? 'bg-[#0088CC] text-white rotate-180' : 'bg-zinc-100 text-zinc-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-[13px] text-zinc-600 leading-relaxed border-t border-zinc-100 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bento Help Card */}
        <div className="mt-8 p-5 rounded-2xl bg-white border border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E5F6FF] flex items-center justify-center text-[#0088CC] shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#141414]">Өөр асуух зүйл байна уу?</h4>
              <p className="text-[11px] text-zinc-500">Манай туслах баг Telegram & Instagram-аар шуурхай хариулна.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={bankInfo.supportTelegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0088CC] hover:bg-[#0077B5] text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram дэмжлэг</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
