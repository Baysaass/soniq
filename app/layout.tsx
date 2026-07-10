import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LangProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Soniq — See your sound',
  description:
    'Soniq is an audio-reactive motion toolkit for After Effects and Premiere Pro. Beat-synced keyframes, live waveforms and 120 visualizer presets.',
  keywords: [
    'soniq',
    'audio reactive',
    'after effects extensions',
    'premiere pro plugins',
    'beat sync',
    'audio visualizer',
    'motion graphics',
  ],
  openGraph: {
    title: 'Soniq — See your sound',
    description:
      'Audio-reactive motion toolkit for After Effects and Premiere Pro. Beat-synced keyframes, live waveforms, 120 visualizer presets.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="mn" className="bg-background" suppressHydrationWarning>
      <body className="font-sans">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  )
}
