'use client'

import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface FadeUpProps {
  children: ReactNode
  className?: string
  y?: number
  duration?: number
  delay?: number
  stagger?: number
  /** ScrollTrigger start — default fires when the element is ~1/4 up from the bottom. */
  start?: string
  /** When true, animates direct children with a stagger instead of the wrapper */
  staggerChildren?: boolean
}

/**
 * Scroll-triggered rise-from-below reveal for body copy, cards and panels.
 * Headings use SplitText / ScrollFloat; this covers everything else.
 */
export default function FadeUp({
  children,
  className = '',
  y = 48,
  duration = 1.1,
  delay = 0,
  stagger = 0.14,
  start = 'top 78%',
  staggerChildren = false
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const targets = staggerChildren ? Array.from(el.children) : el

      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'power3.out',
          stagger: staggerChildren ? stagger : 0,
          scrollTrigger: {
            trigger: el,
            start,
            once: true
          }
        }
      )
    },
    { scope: ref, dependencies: [y, duration, delay, stagger, start, staggerChildren] }
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
