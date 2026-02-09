import { NextResponse } from 'next/server'

interface GeckoTrade {
  attributes: {
    tx_hash: string
    tx_from_address: string
    from_token_amount: string
    to_token_amount: string
    price_from_in_usd: string
    price_to_in_usd: string
    block_timestamp: string
    kind: 'buy' | 'sell'
    volume_in_usd: string
    from_token_address: string
    to_token_address: string
  }
}

export interface TradeData {
  id: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  totalUsd: number
  wallet: string
  timestamp: number
}

interface CacheEntry {
  data: TradeData[]
  timestamp: number
}

const cache: Record<string, CacheEntry> = {}
const CACHE_TTL = 5_000 // 5s — trades update fast but GeckoTerminal rate limits at ~30/min

export async function GET(
  _request: Request,
  { params }: { params: { pairAddress: string } }
) {
  const { pairAddress } = params

  // Return cached if fresh
  const cached = cache[pairAddress]
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    const response = NextResponse.json(cached.data)
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    return response
  }

  try {
    const res = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/solana/pools/${pairAddress}/trades`,
      { headers: { Accept: 'application/json' }, cache: 'no-store' }
    )

    // Rate limited — return stale cache
    if (res.status === 429) {
      if (cached) {
        const response = NextResponse.json(cached.data)
        response.headers.set('Cache-Control', 'no-store, max-age=0')
        return response
      }
      return NextResponse.json([], { status: 502 })
    }

    if (!res.ok) {
      if (cached) {
        const response = NextResponse.json(cached.data)
        response.headers.set('Cache-Control', 'no-store, max-age=0')
        return response
      }
      return NextResponse.json([], { status: 502 })
    }

    const json = await res.json()
    const rawTrades: GeckoTrade[] = json.data ?? []

    const trades: TradeData[] = rawTrades.slice(0, 25).map(t => {
      const a = t.attributes
      const isBuy = a.kind === 'buy'

      // buy: user sends quote (SOL), receives base token
      // sell: user sends base token, receives quote (SOL)
      const amount = isBuy ? parseFloat(a.to_token_amount) : parseFloat(a.from_token_amount)
      const totalUsd = parseFloat(a.volume_in_usd)
      // Derive token price from volume / amount (avoids SOL price confusion)
      const price = amount > 0 ? totalUsd / amount : 0

      return {
        id: a.tx_hash,
        type: a.kind,
        amount,
        price,
        totalUsd,
        wallet: a.tx_from_address,
        timestamp: new Date(a.block_timestamp).getTime(),
      }
    })

    // Update cache
    cache[pairAddress] = { data: trades, timestamp: Date.now() }

    const response = NextResponse.json(trades)
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    return response
  } catch (error) {
    console.error('Trades API error:', error)
    if (cached) {
      const response = NextResponse.json(cached.data)
      response.headers.set('Cache-Control', 'no-store, max-age=0')
      return response
    }
    return NextResponse.json([], { status: 500 })
  }
}
