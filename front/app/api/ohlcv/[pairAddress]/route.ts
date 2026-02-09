import { NextResponse } from 'next/server'

interface CacheEntry {
  data: unknown[]
  timestamp: number
}

// In-memory cache: key = "pairAddress:tf"
const cache: Record<string, CacheEntry> = {}
const CACHE_TTL = 120_000 // 2 minutes

export async function GET(
  request: Request,
  { params }: { params: { pairAddress: string } }
) {
  const { pairAddress } = params
  const { searchParams } = new URL(request.url)
  const tf = searchParams.get('tf') || '1H'

  const cacheKey = `${pairAddress}:${tf}`

  // Return cached data if still fresh
  const cached = cache[cacheKey]
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data)
  }

  // Map timeframe to DexPaprika interval + start offset
  let interval: string
  let limit: number
  let startOffset: number // ms ago from now

  switch (tf) {
    case '1H':
      interval = '1m'
      limit = 60
      startOffset = 60 * 60 * 1000
      break
    case '4H':
      interval = '5m'
      limit = 48
      startOffset = 4 * 60 * 60 * 1000
      break
    case '1D':
      interval = '15m'
      limit = 96
      startOffset = 24 * 60 * 60 * 1000
      break
    case '1W':
      interval = '1h'
      limit = 168
      startOffset = 7 * 24 * 60 * 60 * 1000
      break
    case '1M':
      interval = '4h'
      limit = 180
      startOffset = 30 * 24 * 60 * 60 * 1000
      break
    default:
      interval = '1h'
      limit = 168
      startOffset = 7 * 24 * 60 * 60 * 1000
  }

  const start = new Date(Date.now() - startOffset).toISOString()

  try {
    const url = `https://api.dexpaprika.com/networks/solana/pools/${pairAddress}/ohlcv?start=${start}&limit=${limit}&interval=${interval}`
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    // On rate limit, return stale cache if available
    if (res.status === 429) {
      if (cached) return NextResponse.json(cached.data)
      return NextResponse.json([], { status: 502 })
    }

    if (!res.ok) {
      if (cached) return NextResponse.json(cached.data)
      return NextResponse.json([], { status: 502 })
    }

    const raw = await res.json()

    // DexPaprika returns array of { time_open, time_close, open, high, low, close, volume }
    const candles = (Array.isArray(raw) ? raw : []).map((c: any) => ({
      time: new Date(c.time_open).getTime(),
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close),
      volume: Number(c.volume),
    }))

    cache[cacheKey] = { data: candles, timestamp: Date.now() }
    return NextResponse.json(candles)
  } catch (error) {
    console.error('OHLCV API error:', error)
    if (cached) return NextResponse.json(cached.data)
    return NextResponse.json([], { status: 500 })
  }
}
