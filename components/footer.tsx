'use client'

import { useLang } from '@/lib/i18n'
import { SoniqMark, SoniqWordmark } from '@/components/logo'
import SplitText from '@/components/animations/split-text'
import FadeUp from '@/components/animations/fade-up'

export function Footer({ onGetClick }: { onGetClick: (plan: 'starter' | 'full', e?: React.MouseEvent) => void }) {
  const { t, lang } = useLang()

  return (
    <footer className="pt-24 pb-10 px-6 border-t border-border font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Closing CTA */}
        <div className="text-center mb-20 flex flex-col items-center">
          <FadeUp y={24} className="mb-6">
            <SoniqMark className="w-12 h-auto mx-auto" />
          </FadeUp>
          <SplitText
            key={`footer-${lang}`}
            text={t('footer_headline') as string}
            tag="h2"
            className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-balance mb-4"
            splitType="chars"
            delay={45}
            duration={1}
            threshold={0.35}
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            rootMargin="0px"
            textAlign="center"
          />
          <FadeUp y={20}>
            <p className="text-base text-muted-foreground mb-8">{t('footer_sub') as string}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={(e) => onGetClick('starter', e)}
                className="inline-flex items-center px-6 py-2.5 bg-white text-foreground text-sm font-semibold rounded-full border border-border hover:border-brand/40 hover:shadow-md transition-all cursor-pointer"
              >
                Starter — {t('pkg_starter_price')}
              </button>
              <button
                onClick={(e) => onGetClick('full', e)}
                className="inline-flex items-center px-6 py-2.5 bg-amber-400 text-white text-sm font-bold rounded-full shadow-md shadow-amber-500/20 hover:opacity-90 transition-all cursor-pointer"
              >
                Full — {t('pkg_full_price')}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{t('footer_no_cc') as string}</p>
          </FadeUp>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <div className="flex items-center gap-2.5">
            <SoniqMark className="w-6 h-auto" />
            <SoniqWordmark className="h-3.5 w-auto" fill="currentColor" />
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/_baysaa_notfound/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Instagram
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <span className="text-xs text-muted-foreground">{t('footer_copyright') as string}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
