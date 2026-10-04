'use client'

import React, { useRef, useState, useEffect, type RefObject } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, easeInOut, easeOut } from 'motion/react'
import { useLang } from '@/lib/i18n'
import { SoniqWordmark } from '@/components/logo'
import SplitText from '@/components/animations/split-text'
import FadeUp from '@/components/animations/fade-up'
import { SoniqPanel } from '@/components/soniq-panel'

// Scroll-driven upload icons. Зөвхөн mount хийсний дараа рендерлэгддэг тул
// useScroll нь panelWrapRef-ийг hydration дууссаны дараа хэмждэг — ингэснээр
// motion-ий "ref not hydrated" алдаа гарахгүй.
function FloatingUploadIcons({
  targetRef,
  onHighlightChange,
}: {
  targetRef: RefObject<HTMLDivElement | null>
  onHighlightChange: (v: boolean) => void
}) {
  // Панелийн wrapper дэлгэцийн доороос гарч ирээд ГОЛД хүрэх хүртэлх scroll.
  // progress 0 = панель доороос орж ирж эхэлж буй үе, 1 = панелийн төв дэлгэцийн
  // төвд яг тулсан үе — тэр мөчид folder/icon нисч дуусаад upload баталгаажна.
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'center center'],
  })

  // Хөдөлгөөн scroll-ийн сүүлийн хэсэгт (0.45→1) төвлөрнө: эхэндээ icon-ууд
  // хажуудаа тайван, дараа нь gentle ease-ээр Upload товч руу нисэн орно.
  const iconX = useTransform(scrollYProgress, [0.45, 1], [0, 240], { ease: easeInOut })
  const iconY = useTransform(scrollYProgress, [0.45, 1], [0, -115], { ease: easeInOut })
  const iconScale = useTransform(scrollYProgress, [0.45, 1], [1, 0.25], { ease: easeInOut })
  const iconOpacity = useTransform(scrollYProgress, [0.72, 0.96], [1, 0], { ease: easeOut })

  const folderX = useTransform(scrollYProgress, [0.45, 1], [0, -135], { ease: easeInOut })
  const folderY = useTransform(scrollYProgress, [0.45, 1], [0, -15], { ease: easeInOut })
  const folderScale = useTransform(scrollYProgress, [0.45, 1], [1, 0.25], { ease: easeInOut })
  const folderOpacity = useTransform(scrollYProgress, [0.72, 0.96], [1, 0], { ease: easeOut })

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      // Панель дэлгэцийн голд ойртоход (upload дуусах мөч) баталгаажна.
      onHighlightChange(latest > 0.9)
    })
  }, [scrollYProgress, onHighlightChange])

  return (
    <>
      {/* Left App Icon Card (AE extension/.sqp file) */}
      <motion.div
        style={{ x: iconX, y: iconY, scale: iconScale, opacity: iconOpacity }}
        className="absolute left-[-120px] top-[140px] z-20 pointer-events-none hidden md:block"
      >
        <div className="w-14 h-14 bg-[#232326] border border-white/10 rounded-2xl shadow-xl flex items-center justify-center">
          <svg viewBox="0 0 64 64" className="w-9 h-9 text-[#00B0FF]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="32,9 41,14 41,24 32,29 23,24 23,14" className="fill-[#00B0FF]/10 stroke-[#00B0FF]" />
            <polygon points="23,24 32,29 32,39 23,44 14,39 14,29" className="stroke-muted-foreground" />
            <polygon points="41,24 50,29 50,39 41,44 32,39 32,29" className="stroke-muted-foreground" />
          </svg>
        </div>
      </motion.div>

      {/* Right macOS Folder Card */}
      <motion.div
        style={{ x: folderX, y: folderY, scale: folderScale, opacity: folderOpacity }}
        className="absolute right-[-120px] top-[40px] z-20 pointer-events-none flex flex-col items-center hidden md:flex"
      >
        <svg viewBox="0 0 64 64" className="w-16 h-16 filter drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 14C6 11.7909 7.79086 10 10 10H24.5C26.046 10 27.4815 10.887 28.1623 12.2743L29.7254 15.4578C30.0658 16.1514 30.7836 16.5952 31.5566 16.5952H54C56.2091 16.5952 58 18.3844 58 20.5935V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V14Z" fill="#009BF2" />
          <path d="M6 21.5C6 19.2909 7.79086 17.5 10 17.5H54C56.2091 17.5 58 19.2909 58 21.5V48C58 50.2091 56.2091 52 54 52H10C7.79086 52 6 50.2091 6 48V21.5Z" fill="#38B3FF" />
        </svg>
        <span className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-foreground bg-white/70 backdrop-blur-sm border border-black/5 shadow-xs">
          Whoosh
        </span>
      </motion.div>
    </>
  )
}

export function Hero({
  onGetClick,
  starterHref = '/shop?plan=starter',
  fullHref = '/shop?plan=full',
}: {
  onGetClick?: (plan: 'starter' | 'full', e?: React.MouseEvent) => void
  starterHref?: string
  fullHref?: string
}) {
  const { t, lang } = useLang()
  const panelWrapRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [highlightUpload, setHighlightUpload] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <section
      id="top"
      className="min-h-screen pt-36 pb-20 px-6 flex flex-col justify-start items-center overflow-x-hidden relative font-sans"
    >
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
        {/* Centered Title & Subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center">
          {/* Logo / Wordmark */}
          <FadeUp y={20} className="mb-6">
            <SoniqWordmark className="h-8 md:h-10 w-auto" />
          </FadeUp>

          {/* Headline */}
          <SplitText
            key={`hero-title-${lang}`}
            text={t('hero_headline') as string}
            tag="h1"
            className="text-[38px] md:text-[52px] lg:text-[60px] font-semibold tracking-tight leading-[1.1] text-foreground mb-6"
            splitType="chars"
            delay={30}
            duration={0.8}
            ease="power3.out"
            textAlign="center"
          />

          {/* Subtitle / Body Copy */}
          <p className="text-[16px] md:text-[17px] text-muted-foreground leading-relaxed max-w-xl text-balance">
            {t('hero_body') as string}
          </p>

          {/* Two Package Cards */}
          <FadeUp y={16} delay={0.15} className="mt-10 w-full max-w-md">
            <div className="grid grid-cols-2 gap-3">
              {/* Starter */}
              <Link
                href={starterHref}
                onClick={(e) => {
                  if (onGetClick) onGetClick('starter', e)
                }}
                className="group relative flex flex-col items-center gap-1.5 px-4 py-5 rounded-2xl border border-border bg-white hover:border-brand/40 hover:shadow-md hover:shadow-brand/5 transition-all duration-200 cursor-pointer text-center"
              >
                <span className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">{t('pkg_starter_name')}</span>
                <span className="text-[26px] font-bold text-foreground tracking-tight leading-none">{t('pkg_starter_price')}</span>
                <span className="text-[11px] font-semibold text-brand">{t('pkg_starter_sfx')}</span>
                <span className="text-[10px] text-muted-foreground mt-1">{t('pkg_starter_desc')}</span>
              </Link>

              {/* Full (recommended) */}
              <Link
                href={fullHref}
                onClick={(e) => {
                  if (onGetClick) onGetClick('full', e)
                }}
                className="group relative flex flex-col items-center gap-1.5 px-4 py-5 rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-50/80 to-white hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/10 transition-all duration-200 cursor-pointer text-center"
              >
                {/* Badge */}
                <span className="absolute -top-2.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-[9px] font-bold text-white shadow-sm">
                  {t('pkg_full_badge')}
                </span>
                <span className="text-[11px] font-bold text-amber-600/80 uppercase tracking-wider">{t('pkg_full_name')}</span>
                <span className="text-[26px] font-bold text-foreground tracking-tight leading-none">{t('pkg_full_price')}</span>
                <span className="text-[11px] font-semibold text-amber-600">{t('pkg_full_sfx')}</span>
                <span className="text-[10px] text-muted-foreground mt-1">{t('pkg_full_desc')}</span>
              </Link>
            </div>
            <p className="text-[12px] text-muted-foreground/70 mt-3 text-center">{t('hero_note')}</p>
          </FadeUp>
        </div>

        {/* Floating Icons & SoniqPanel Wrapper */}
        <div ref={panelWrapRef} className="relative w-full max-w-[390px] mt-8 flex justify-center items-center">
          {mounted && (
            <FloatingUploadIcons targetRef={panelWrapRef} onHighlightChange={setHighlightUpload} />
          )}

          {/* SoniqPanel — upload дуусахад SFX-үүд нэг нэгээр нэмэгдэнэ */}
          <SoniqPanel highlightUpload={highlightUpload} revealItems={highlightUpload} />
        </div>
      </div>
    </section>
  )
}
