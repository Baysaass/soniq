'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { SoniqMark, SoniqWordmark } from '@/components/logo'

export function Navbar({ onGetClick }: { onGetClick: (e: React.MouseEvent) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLang()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-4 px-4 pointer-events-none font-sans">
      {/* Floating white pill */}
      <div className="pointer-events-auto w-full max-w-3xl flex items-center justify-between px-4 h-12 rounded-full border border-border bg-white/85 shadow-sm backdrop-blur-xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="Soniq home">
          <SoniqMark className="w-7 h-auto" />
          <SoniqWordmark className="h-4 w-auto hidden sm:block" fill="currentColor" />
        </Link>

        {/* Desktop center nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/#features"
            className="px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 rounded-full hover:bg-foreground/5"
          >
            {t('nav_features')}
          </Link>
          <Link
            href="/shop"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold text-foreground hover:text-red-500 transition-colors duration-150 rounded-full hover:bg-foreground/5"
          >
            <span>Дэлгүүр (Store)</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-gradient-to-r from-red-600 to-amber-600 text-white">
              85% OFF
            </span>
          </Link>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          {/* CTA */}
          <a
            href="https://www.instagram.com/_baysaa_notfound/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onGetClick}
            className="hidden sm:inline-flex items-center px-4 py-1.5 text-[13px] font-semibold bg-brand text-white rounded-full hover:opacity-90 transition-opacity duration-150 cursor-pointer"
          >
            {t('nav_get')}
          </a>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-full hover:bg-foreground/8 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-4 h-4 text-foreground" /> : <Menu className="w-4 h-4 text-foreground" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="pointer-events-auto w-full max-w-3xl mt-2 rounded-2xl border border-border bg-white shadow-lg px-4 py-3">
          <nav className="flex flex-col gap-0.5">
            <Link
              href="/#features"
              className="px-3 py-2 text-[14px] text-muted-foreground hover:text-foreground rounded-xl hover:bg-foreground/5 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav_features')}
            </Link>
            <Link
              href="/shop"
              className="px-3 py-2 text-[14px] font-bold text-foreground hover:text-red-500 rounded-xl hover:bg-foreground/5 transition-colors flex items-center justify-between"
              onClick={() => setMobileOpen(false)}
            >
              <span>Дэлгүүр (Store)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-gradient-to-r from-red-600 to-amber-600 text-white">
                85% OFF
              </span>
            </Link>
          </nav>
          <div className="flex items-center justify-end mt-3 pt-3 border-t border-border">
            <a
              href="https://www.instagram.com/_baysaa_notfound/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-[13px] font-semibold bg-brand text-white rounded-full cursor-pointer"
              onClick={(e) => {
                setMobileOpen(false)
                onGetClick(e)
              }}
            >
              {t('nav_get')}
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
