'use client'

import { useLang, type TranslationKey } from '@/lib/i18n'
import CountUp from '@/components/animations/count-up'
import FadeUp from '@/components/animations/fade-up'

const STATS: {
  to: number
  suffix?: string
  separator?: string
  labelKey: TranslationKey
}[] = [
  { to: 600, separator: ',', suffix: '+', labelKey: 'stat1_label' },
  { to: 120, labelKey: 'stat2_label' },
  { to: 12, labelKey: 'stat3_label' },
  { to: 60, labelKey: 'stat4_label' },
]

export function Stats() {
  const { t } = useLang()

  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <FadeUp staggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {STATS.map(({ to, suffix, separator, labelKey }) => (
            <div key={labelKey} className="flex flex-col items-center">
              <p className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-2 tabular-nums">
                <CountUp to={to} separator={separator} duration={1.6} />
                {suffix}
              </p>
              <p className="text-[13px] text-muted-foreground">{t(labelKey) as string}</p>
            </div>
          ))}
        </FadeUp>
      </div>
    </section>
  )
}
