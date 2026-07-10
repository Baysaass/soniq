'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView, easeInOut } from 'motion/react'
import { CloudUpload, Check, Star, ChevronUp, Play, Search } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import SplitText from '@/components/animations/split-text'
import FadeUp from '@/components/animations/fade-up'

// FxExpandMockup — hero-гийн extension шиг нэг SFX row сунаж, Modifier + FX
// тохиргоо гарч ирнэ. Modifier-ууд ээлжлэн солигдож slider-ууд зөөлөн хөдөлж,
// "нэг дуу → олон төрлийн эффект" гэдгийг харуулна.
const FX_MODS = [
  { name: 'Original', vol: 100, bass: 0, speed: 100 },
  { name: 'Tight', vol: 118, bass: -2, speed: 100 },
  { name: 'Deep', vol: 100, bass: 6, speed: 85 },
  { name: 'Fast', vol: 100, bass: 0, speed: 140 },
  { name: 'Slow', vol: 100, bass: 0, speed: 70 },
  { name: 'Echo', vol: 96, bass: 1, speed: 100 },
  { name: 'Hall', vol: 92, bass: 3, speed: 100 },
  { name: 'Underwater', vol: 110, bass: 4, speed: 60 },
] as const

function FxSlider({ label, pct, value }: { label: string; pct: number; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[52px] shrink-0 text-[12px] font-medium text-[#6B7280]">{label}</span>
      <div className="relative flex-1 h-4 flex items-center">
        <div className="w-full h-1 rounded-full bg-[#E8E8E8]" />
        <div
          className="absolute left-0 h-1 rounded-full bg-brand transition-[width] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-[0_1px_4px_rgba(15,17,21,0.3)] transition-[left] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
      </div>
      <span className="w-[46px] shrink-0 text-right text-[12px] font-semibold text-foreground tabular-nums">
        {value}
      </span>
    </div>
  )
}

function FxExpandMockup() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.4 })
  const [open, setOpen] = useState(false)
  const [modIndex, setModIndex] = useState(0)
  const mod = FX_MODS[modIndex]

  // Харагдацад ороход эхлээд row сунана, дараа нь modifier-ууд ээлжилнэ.
  useEffect(() => {
    if (!isInView) {
      setOpen(false)
      setModIndex(0)
      return
    }
    const openTimer = setTimeout(() => setOpen(true), 500)
    const cycle = setInterval(() => {
      setModIndex((i) => (i + 1) % FX_MODS.length)
    }, 1500)
    return () => {
      clearTimeout(openTimer)
      clearInterval(cycle)
    }
  }, [isInView])

  const volPct = (mod.vol / 150) * 100
  const bassPct = ((mod.bass + 12) / 24) * 100
  const speedPct = ((mod.speed - 25) / 175) * 100

  return (
    <div ref={ref} className="w-full max-w-lg mx-auto mt-8">
      <div className="rounded-2xl border border-[#E6E6E3] bg-white shadow-lg overflow-hidden text-left">
        {/* Sound row */}
        <div className="flex items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-brand flex items-end justify-center gap-[2px] pb-2.5 shrink-0">
              {[6, 11, 7, 13, 8].map((h, i) => (
                <span key={i} className="w-[3px] rounded-full bg-white/95" style={{ height: `${h}px` }} />
              ))}
            </div>
            <div className="min-w-0">
              <h4 className="text-[15px] font-semibold text-foreground leading-tight truncate">1 Click Mouse</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">SFX · click, mouse</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Star className="w-4 h-4 text-border" />
            <motion.div animate={{ rotate: open ? 0 : 180 }} transition={{ duration: 0.4, ease: easeInOut }}>
              <ChevronUp className="w-4 h-4 text-brand" />
            </motion.div>
            <span className="px-4 py-1.5 text-[13px] font-semibold rounded-full bg-brand text-white shadow-xs">
              Insert
            </span>
          </div>
        </div>

        {/* Expandable FX panel */}
        <motion.div
          initial={false}
          animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="px-4 pt-3 pb-4 bg-[#FAFBFC] border-t border-[#EFF0F3]">
            {/* Modifier chips */}
            <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-muted-foreground mb-2.5">Modifier</p>
            <div className="flex flex-wrap gap-1.5 pb-3 mb-3 border-b border-[#EFF0F3]">
              {FX_MODS.map((m, i) => (
                <span
                  key={m.name}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors duration-300 ${
                    i === modIndex ? 'bg-[#E5F6FF] text-brand' : 'bg-[#F1F2F5] text-[#6B7280]'
                  }`}
                >
                  {m.name}
                </span>
              ))}
            </div>

            {/* Sliders */}
            <div className="flex flex-col gap-2.5">
              <FxSlider label="Volume" pct={volPct} value={`${Math.round(mod.vol)}%`} />
              <FxSlider label="Bass" pct={bassPct} value={`${mod.bass > 0 ? '+' : ''}${mod.bass} dB`} />
              <FxSlider label="Speed" pct={speedPct} value={`${Math.round(mod.speed)}%`} />
              <FxSlider label="Fade in" pct={0} value="0s" />
              <FxSlider label="Fade out" pct={0} value="0s" />
            </div>

            {/* Reverse + Reset */}
            <div className="flex items-center justify-between mt-3.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[12.5px] font-medium text-foreground">Reverse</span>
                <span className="w-9 h-[21px] rounded-full bg-[#78788029] relative">
                  <span className="absolute top-0.5 left-0.5 w-[17px] h-[17px] rounded-full bg-white shadow-sm" />
                </span>
              </div>
              <span className="text-[12px] font-semibold text-brand">Reset</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// SearchRevealMockup — Soniq Panel-ийн search хэсэг.
// Scroll хийхэд "Whoosh" гэж бичигдэж, тухайн хайлтын үр дүнгүүд
// нэг нэгээрээ stagger-ээр гарч ирнэ.
const WHOOSH_RESULTS = [
  { id: 'w1', title: 'Whoosh — Fast', subtitle: 'SFX · whoosh, fast, air', duration: '0:01', bars: [5, 12, 8, 15, 6, 10, 14, 7] },
  { id: 'w2', title: 'Whoosh — Slow', subtitle: 'SFX · whoosh, slow, sweep', duration: '0:03', bars: [4, 7, 11, 6, 9, 13, 5, 8] },
  { id: 'w3', title: 'Whoosh — Deep', subtitle: 'SFX · whoosh, deep, bass', duration: '0:02', bars: [8, 14, 6, 11, 15, 9, 7, 12] },
  { id: 'w4', title: 'Whoosh — Echo', subtitle: 'SFX · whoosh, echo, reverb', duration: '0:04', bars: [6, 9, 13, 7, 11, 5, 14, 10] },
] as const

function SearchRevealMockup() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.45 })
  const [typedText, setTypedText] = useState('')
  const [visibleCount, setVisibleCount] = useState(0)
  const targetText = 'Whoosh'

  // Typing animation — бичиж дуусаад SFX мөрүүдийг нэг нэгээр гаргана
  useEffect(() => {
    if (!isInView) {
      setTypedText('')
      setVisibleCount(0)
      return
    }

    let charIndex = 0
    setTypedText('')
    setVisibleCount(0)

    // 1. Бичигдэх хэсэг
    const typeTimer = setInterval(() => {
      if (charIndex < targetText.length) {
        setTypedText(targetText.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typeTimer)
        // 2. Бичиж дуусаад мөрүүдийг stagger-ээр нэмнэ
        let rowIndex = 0
        const revealTimer = setInterval(() => {
          rowIndex++
          setVisibleCount(rowIndex)
          if (rowIndex >= WHOOSH_RESULTS.length) {
            clearInterval(revealTimer)
          }
        }, 220)
      }
    }, 180)

    return () => {
      clearInterval(typeTimer)
    }
  }, [isInView])

  return (
    <div ref={ref} className="w-full max-w-[390px] mx-auto mt-8">
      <div className="rounded-[24px] border border-[#E6E6E3] bg-white shadow-lg overflow-hidden text-left">
        {/* Header — Soniq Logo */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span className="text-[#00B0FF] font-black text-xl tracking-tight" style={{ fontFamily: 'var(--font-display, system-ui)' }}>Sonįq</span>
          <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#0099FF] bg-[#E5F6FF] rounded-full border border-dashed border-[#00B0FF]">
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </div>
        </div>

        {/* Search bar — typing animation */}
        <div className="px-4 pb-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
            <div className="w-full pl-9 pr-4 py-2 bg-[#F3F3F0] text-sm rounded-xl flex items-center min-h-[36px]">
              {typedText ? (
                <span className="font-semibold text-foreground">{typedText}</span>
              ) : (
                <span className="text-muted-foreground/50">Search</span>
              )}
              {isInView && (
                <span className="w-[1.5px] h-4 bg-brand ml-0.5 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Results — staggered reveal */}
        <div className="px-3 pb-4 space-y-0">
          {WHOOSH_RESULTS.map((sfx, i) => (
            <motion.div
              key={sfx.id}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={
                i < visibleCount
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 14, scale: 0.97 }
              }
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between gap-2 px-2 py-2.5 rounded-xl hover:bg-[#F7F7F5] transition-colors"
            >
              {/* Left: Waveform icon + info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand flex items-end justify-center gap-[2px] pb-2 shrink-0">
                  {sfx.bars.map((h, bi) => (
                    <span key={bi} className="w-[2.5px] rounded-full bg-white/90" style={{ height: `${h}px` }} />
                  ))}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[14px] font-semibold text-foreground leading-tight truncate">{sfx.title}</h4>
                  <p className="text-[10.5px] text-muted-foreground mt-0.5 truncate">{sfx.subtitle}</p>
                </div>
              </div>

              {/* Right: duration + actions */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-muted-foreground/60 font-medium tabular-nums">{sfx.duration}</span>
                <Play className="w-3.5 h-3.5 text-muted-foreground/40" />
                <Star className="w-3.5 h-3.5 text-border" />
                <span className="px-3.5 py-1 text-[11px] font-semibold rounded-full bg-brand text-white shadow-xs">
                  Insert
                </span>
              </div>
            </motion.div>
          ))}

          {/* Empty state placeholder (before results appear) */}
          {visibleCount === 0 && typedText.length > 0 && (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// TimelineMockup — SFX нь Premiere Pro / After Effects-ийн timeline-ийн playhead
// дээр gentle ease-ээр нэмэгдэж буйг харуулна. App-ууд ээлжлэн солигдоно.
const TL_APPS = [
  {
    key: 'ppro',
    name: 'Premiere Pro',
    short: 'Pr',
    tint: '#9A7CFF',
    badge: 'bg-[#2A1F4D] text-[#C6B2FF]',
    clip: 'from-[#7C5CFF] to-[#5B3FD6]',
    videoLabel: 'V1 · Sequence',
  },
  {
    key: 'aeft',
    name: 'After Effects',
    short: 'Ae',
    tint: '#9CC0FF',
    badge: 'bg-[#1E2A4D] text-[#AEC6FF]',
    clip: 'from-[#5B8DEF] to-[#3B63D6]',
    videoLabel: 'V1 · Comp',
  },
] as const

function TimelineMockup() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.5 })
  const [appIndex, setAppIndex] = useState(0)
  const app = TL_APPS[appIndex]

  // App-ыг loop бүрийн төгсгөлд солино (доорх chip анимацийн 4.4s үетэй синк).
  useEffect(() => {
    if (!isInView) return
    const id = setInterval(() => {
      setAppIndex((i) => (i + 1) % TL_APPS.length)
    }, 4400)
    return () => clearInterval(id)
  }, [isInView])

  return (
    <div ref={ref} className="w-full max-w-lg mx-auto mt-10">
      <div className="rounded-2xl border border-[#26262B] bg-[#191A1E] shadow-xl overflow-hidden text-left">
        {/* Window header — app switcher */}
        <div className="flex items-center gap-2 px-4 h-10 border-b border-white/8 bg-[#202127]">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="ml-2 flex items-center gap-2 overflow-hidden">
            <motion.span
              key={app.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeInOut }}
              className="flex items-center gap-1.5"
            >
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black"
                style={{ background: '#0F1013', color: app.tint, boxShadow: `inset 0 0 0 1px ${app.tint}55` }}
              >
                {app.short}
              </span>
              <span className="text-[12px] font-semibold text-white/85">{app.name}</span>
            </motion.span>
          </div>
          <span className="ml-auto text-[10px] font-medium text-white/35">Timeline</span>
        </div>

        {/* Timeline body */}
        <div className="relative px-4 pt-3 pb-4">
          {/* Ruler */}
          <div className="flex items-center gap-3 mb-2 pl-12">
            <div className="relative flex-1 h-4">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/10" />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <span key={i} className="absolute top-1/2 -translate-y-1/2 w-px h-1.5 bg-white/15" style={{ left: `${i * 14.28}%` }} />
              ))}
            </div>
          </div>

          {/* Playhead — chip буусан цэг дээр */}
          <div className="absolute top-2 bottom-4 z-20 pointer-events-none" style={{ left: 'calc(3rem + 52%)' }}>
            <div className="w-px h-full bg-[#E5484D]/80 mx-auto" />
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-sm bg-[#E5484D]" />
          </div>

          {/* Video track */}
          <div className="flex items-center gap-3 mb-1.5">
            <span className="w-11 shrink-0 text-[9px] font-bold text-white/40 text-right">{app.videoLabel}</span>
            <div className="flex-1 h-8 rounded-md bg-[#232429] border border-white/6 overflow-hidden flex items-center">
              <div className="h-full w-[62%] bg-gradient-to-b from-[#3A3B42] to-[#2C2D33] border-r border-black/40 flex items-center px-2">
                <span className="text-[9px] font-semibold text-white/40 truncate">clip.mp4</span>
              </div>
            </div>
          </div>

          {/* Audio track — SFX энд буна */}
          <div className="flex items-center gap-3">
            <span className="w-11 shrink-0 text-[9px] font-bold text-white/40 text-right">A1 · Audio</span>
            <div className="relative flex-1 h-9 rounded-md bg-[#202127] border border-white/6 overflow-hidden">
              {/* буулгах слот (playhead-ийн байрлалд) */}
              <div className="absolute inset-y-0 left-[52%] w-[34%]">
                {/* Унаж буй SFX clip — gentle ease-ээр орж, барьж, дараа нь дараагийн app руу шилжинэ */}
                <motion.div
                  key={app.key}
                  initial={{ y: -30, opacity: 0, scaleY: 0.7 }}
                  animate={
                    isInView
                      ? { y: [-30, 0, 0, -30], opacity: [0, 1, 1, 0], scaleY: [0.7, 1, 1, 0.7] }
                      : { y: -30, opacity: 0, scaleY: 0.7 }
                  }
                  transition={{ duration: 4.4, times: [0, 0.22, 0.86, 1], ease: easeInOut, repeat: Infinity }}
                  className={`absolute inset-1 rounded-[5px] bg-gradient-to-b ${app.clip} shadow-lg flex items-center px-1.5 origin-bottom`}
                >
                  {/* mini waveform */}
                  <div className="flex items-end gap-[2px] h-4">
                    {[5, 10, 7, 13, 8, 15, 6, 11, 9, 14, 7, 5].map((h, i) => (
                      <span key={i} className="w-[2px] rounded-full bg-white/85" style={{ height: `${h}px` }} />
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Insert ✓ badge — chip суусан үед гарч ирнэ */}
              <motion.div
                key={`${app.key}-badge`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={isInView ? { opacity: [0, 0, 1, 1, 0], scale: [0.6, 0.6, 1, 1, 0.8] } : { opacity: 0 }}
                transition={{ duration: 4.4, times: [0, 0.24, 0.34, 0.82, 0.94], ease: easeInOut, repeat: Infinity }}
                className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow-md"
              >
                <Check className="w-2.5 h-2.5" />
                <span>Insert</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* App dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {TL_APPS.map((a, i) => (
          <span
            key={a.key}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === appIndex ? 20 : 6,
              background: i === appIndex ? a.tint : 'rgba(0,0,0,0.15)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function SoniqFeatures() {
  const { t, lang } = useLang()

  return (
    <section id="features" className="py-24 px-6 select-none bg-white">
      <div className="max-w-4xl mx-auto space-y-40">
        
        {/* Section 2: "Нэг дуугаар олон төрлийн эффект" */}
        <div className="text-center flex flex-col items-center">
          <SplitText
            key={`feat2-title-${lang}`}
            text={t('feat2_headline') as string}
            tag="h2"
            className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-5"
            splitType="chars"
            delay={30}
            duration={0.8}
            ease="power3.out"
            textAlign="center"
          />
          <FadeUp y={20}>
            <p className="text-[15px] md:text-[16px] text-muted-foreground max-w-lg mx-auto leading-relaxed mb-8 text-pretty">
              {t('feat2_body') as string}
            </p>
          </FadeUp>

          {/* FX / Modifier expand mockup */}
          <FadeUp y={30} className="w-full max-w-lg">
            <FxExpandMockup />
          </FadeUp>

          {/* Subtext */}
          <FadeUp y={20} delay={0.2}>
            <p className="text-[11px] text-muted-foreground/60 max-w-sm mx-auto leading-relaxed mt-4 select-none font-semibold">
              {t('feat2_note') as string}
            </p>
          </FadeUp>
        </div>

        {/* Section 3: "Өөрийн SFX багцуудыг үүсгэ." */}
        <div className="text-center flex flex-col items-center">
          <SplitText
            key={`feat3-title-${lang}`}
            text={t('feat3_headline') as string}
            tag="h2"
            className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-4"
            splitType="chars"
            delay={30}
            duration={0.8}
            ease="power3.out"
            textAlign="center"
          />

          {/* Search + SFX Reveal Mockup */}
          <FadeUp y={24} className="w-full max-w-[390px]">
            <SearchRevealMockup />
          </FadeUp>
        </div>

        {/* Section 4: Timeline руу шууд (Premiere Pro + After Effects) */}
        <div className="text-center flex flex-col items-center">
          <SplitText
            key={`feat4-title-${lang}`}
            text={t('feat4_headline') as string}
            tag="h2"
            className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-5"
            splitType="chars"
            delay={30}
            duration={0.8}
            ease="power3.out"
            textAlign="center"
          />
          <FadeUp y={20}>
            <p className="text-[15px] md:text-[16px] text-muted-foreground max-w-lg mx-auto leading-relaxed mb-2 text-pretty">
              {t('feat4_body') as string}
            </p>
          </FadeUp>

          {/* Timeline animation */}
          <FadeUp y={30} className="w-full max-w-lg">
            <TimelineMockup />
          </FadeUp>
        </div>

      </div>
    </section>
  )
}
