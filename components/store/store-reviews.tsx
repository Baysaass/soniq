'use client'

import React from 'react'
import { Star, ShieldCheck } from 'lucide-react'
import { REVIEWS } from '@/lib/store-data'

export function StoreReviews() {
  return (
    <section id="reviews" className="py-8 sm:py-10 bg-[#FAFAFA] border-b border-[#E6E6E3]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold text-[#0088CC] uppercase tracking-wider block mb-1">
            ХЭРЭГЛЭГЧИЙН ҮНЭЛГЭЭ
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#141414] tracking-tight">
            Эвлүүлэгчдийн сэтгэгдэл
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
              ))}
            </div>
            <span className="text-xs font-bold text-[#141414]">4.9 / 5.0</span>
            <span className="text-xs text-zinc-400">· 8,247+ баталгаажсан үнэлгээ</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="rounded-xl bg-white border border-[#E6E6E3] p-4 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">{rev.date}</span>
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed font-normal">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E6E6E3] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#141414]">{rev.name}</h4>
                  <span className="text-[10px] text-zinc-500">{rev.role}</span>
                </div>

                {rev.verified && (
                  <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Баталгаажсан</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
