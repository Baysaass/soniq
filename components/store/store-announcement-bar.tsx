'use client'

import React, { useState, useEffect } from 'react'
import { Clock, ShieldCheck, Zap } from 'lucide-react'
import { useStore } from '@/lib/store-context'

export function StoreAnnouncementBar() {
  const { currency, setCurrency, settings } = useStore()

  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 48,
    seconds: 15,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return { hours: 2, minutes: 59, seconds: 59 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDigits = (n: number) => n.toString().padStart(2, '0')

  const announcementText = settings?.announcementText || 'Бүх багц 85% хямдралтай · WeTransfer шууд таталт'

  return (
    <div className="bg-[#141414] text-white text-[11px] py-1.5 px-3 border-b border-black/10 select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        {/* Left: Offer text */}
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00B0FF] text-white tracking-wider uppercase">
            НЭЭЛТИЙН УРАМШУУЛАЛ
          </span>
          <span className="text-zinc-300 font-medium">
            {announcementText}
          </span>
        </div>

        {/* Right side: Countdown & Currency */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[10px]">
            <Clock className="w-3 h-3 text-[#00B0FF]" />
            <span className="hidden sm:inline">Хугацаа:</span>
            <span className="font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">
              {formatDigits(timeLeft.hours)}:{formatDigits(timeLeft.minutes)}:{formatDigits(timeLeft.seconds)}
            </span>
          </div>

          <div className="flex items-center bg-white/10 p-0.5 rounded text-[10px]">
            <button
              onClick={() => setCurrency('MNT')}
              className={`px-1.5 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                currency === 'MNT' ? 'bg-white text-black shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ₮ MNT
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-1.5 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                currency === 'USD' ? 'bg-white text-black shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              $ USD
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

