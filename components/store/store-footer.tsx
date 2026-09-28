'use client'

import React from 'react'
import Link from 'next/link'
import { SoniqMark, SoniqWordmark } from '@/components/logo'
import { STORE_SETTINGS } from '@/lib/store-data'
import { useStore } from '@/lib/store-context'

export function StoreFooter() {
  const { settings } = useStore()
  const bankInfo = settings?.bankInfo || STORE_SETTINGS.bankInfo
  return (
    <footer className="pt-12 pb-8 px-4 sm:px-6 bg-white border-t border-[#E6E6E3] font-sans text-xs text-zinc-500">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E6E6E3]">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2.5">
              <SoniqMark className="w-6 h-auto" />
              <SoniqWordmark className="h-3.5 w-auto text-[#141414]" fill="currentColor" />
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E5F6FF] text-[#0088CC] border border-[#00B0FF]/25">
                STORE
              </span>
            </div>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              Видео эвлүүлэгчид ба контент бүтээгчдэд зориулсан мэргэжлийн дуу авиа, өнгө, моушн хэрэгслүүдийн дижитал дэлгүүр.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-zinc-800 text-xs mb-2.5">Холбоосууд</h4>
            <ul className="space-y-1.5 text-xs text-zinc-500">
              <li>
                <Link href="/shop" className="hover:text-black transition-colors">
                  Бүх бүтээгдэхүүн
                </Link>
              </li>
              <li>
                <a href="#bundle" className="hover:text-black transition-colors">
                  Ultimate Bundle 2026
                </a>
              </li>
              <li>
                <Link href="/" className="hover:text-black transition-colors">
                  Soniq Extension сайт
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-zinc-800 text-xs mb-2.5">Дэмжлэг</h4>
            <ul className="space-y-1.5 text-xs text-zinc-500">
              <li>
                <a
                  href={bankInfo.supportInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors"
                >
                  Instagram: @_baysaa_notfound
                </a>
              </li>
              <li>
                <a
                  href={bankInfo.supportTelegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors"
                >
                  Telegram: @baysaa_vfx
                </a>
              </li>
              <li className="text-[11px] text-zinc-400 pt-1">
                Файл түгээлт: WeTransfer Pro
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
          <p>© 2026 SONIQ (shop.soniq.click). Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="flex items-center gap-4">
            <span>100% Royalty Free License</span>
            <span>·</span>
            <span>Монгол улсад хөгжүүлэв</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
