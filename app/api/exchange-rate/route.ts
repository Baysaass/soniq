import { NextResponse } from 'next/server'
import { getStoreSettingsAsync } from '@/lib/settings-db'

interface ExchangeRateCache {
  rate: number
  timestamp: number
}

let cachedRate: ExchangeRateCache | null = null
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour cache
const DEFAULT_FALLBACK_RATE = 3600 // Current market baseline

async function fetchLiveMntRate(): Promise<number> {
  const now = Date.now()
  if (cachedRate && now - cachedRate.timestamp < CACHE_TTL_MS) {
    return cachedRate.rate
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    })

    if (res.ok) {
      const data = await res.json()
      const mntRate = Number(data?.rates?.MNT)
      if (mntRate && mntRate > 1000 && mntRate < 10000) {
        cachedRate = {
          rate: mntRate,
          timestamp: now,
        }
        return mntRate
      }
    }
  } catch (err) {
    console.warn('[Exchange Rate API] Live fetch error, falling back to cached/default:', err)
  }

  if (cachedRate) return cachedRate.rate
  return DEFAULT_FALLBACK_RATE
}

export async function GET() {
  try {
    const settings = await getStoreSettingsAsync()
    const liveRate = await fetchLiveMntRate()
    const customRate = Number(settings?.usdExchangeRate) || 0
    const activeRate = customRate > 0 ? customRate : liveRate

    return NextResponse.json({
      success: true,
      rate: activeRate,
      liveRate: Math.round(liveRate * 100) / 100,
      customRate: customRate > 0 ? customRate : null,
      source: customRate > 0 ? 'custom' : 'live',
      formatted: `1 USD = ${Math.round(activeRate).toLocaleString()}₮`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      rate: DEFAULT_FALLBACK_RATE,
      liveRate: DEFAULT_FALLBACK_RATE,
      customRate: null,
      source: 'fallback',
      formatted: `1 USD = ${DEFAULT_FALLBACK_RATE.toLocaleString()}₮`,
      timestamp: new Date().toISOString(),
    })
  }
}
