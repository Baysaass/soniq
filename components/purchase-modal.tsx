'use client'

import React, { useEffect } from 'react'
import { X, ExternalLink, Zap, Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export type PlanType = 'starter' | 'full'

interface PurchaseModalProps {
  isOpen: boolean
  selectedPlan: PlanType
  onClose: () => void
}

const PLANS: Record<PlanType, { icon: React.ReactNode; gradient: string; border: string; glow: string }> = {
  starter: {
    icon: <Zap className="w-6 h-6" />,
    gradient: 'from-brand/15 to-brand/5',
    border: 'border-brand/25',
    glow: 'bg-brand/15',
  },
  full: {
    icon: <Crown className="w-6 h-6" />,
    gradient: 'from-amber-500/15 to-amber-500/5',
    border: 'border-amber-500/25',
    glow: 'bg-amber-500/15',
  },
}

export function PurchaseModal({ isOpen, selectedPlan, onClose }: PurchaseModalProps) {
  const plan = PLANS[selectedPlan]

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  const planLabel = selectedPlan === 'starter' ? 'Starter' : 'Full'
  const planPrice = selectedPlan === 'starter' ? '29,900₮' : '59,900₮'
  const planSfx = selectedPlan === 'starter' ? '150+ SFX' : '500+ SFX'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-[#131315]/95 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center z-10"
          >
            {/* Top Glow */}
            <div className={`absolute top-[-50px] w-48 h-24 ${plan.glow} rounded-full blur-xl pointer-events-none`} />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-muted-foreground/60 hover:text-foreground rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Plan Icon */}
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-b ${plan.gradient} border ${plan.border} flex items-center justify-center ${selectedPlan === 'full' ? 'text-amber-400' : 'text-brand'} mb-4 shadow-xs shrink-0`}>
              {plan.icon}
            </div>

            {/* Selected plan pill */}
            <div className={`px-3 py-1 rounded-full text-[11px] font-bold mb-4 ${selectedPlan === 'full' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-brand/10 text-brand border border-brand/20'}`}>
              Soniq {planLabel} · {planSfx} · {planPrice}
            </div>

            {/* Title */}
            <h3 className="text-lg md:text-xl font-bold text-white mb-3 tracking-tight">
              Захиалга өгөх заавар
            </h3>

            {/* Message */}
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-6 select-none font-medium text-pretty">
              Вэбсайт дээрх онлайн төлбөр төлөлтийн систем хөгжүүлэгдэж байгаа тул та манай Instagram хаяг руу DM бичин{' '}
              <span className="text-white font-semibold">Soniq {planLabel}</span> захиалгаа баталгаажуулна уу.
            </p>

            {/* Buttons */}
            <div className="flex flex-col items-center gap-2.5 w-full">
              <a
                href="https://www.instagram.com/_baysaa_notfound/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className={`w-full flex items-center justify-center gap-2 px-5 py-3 text-white text-sm font-bold rounded-xl hover:opacity-95 shadow-md transition-all cursor-pointer ${selectedPlan === 'full' ? 'bg-amber-500 shadow-amber-500/25' : 'bg-brand shadow-brand/25'}`}
              >
                <span>Instagram руу шилжих</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onClose}
                className="w-full px-5 py-2.5 bg-white/5 text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl border border-white/8 hover:bg-white/8 transition-all cursor-pointer"
              >
                Хаах
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
