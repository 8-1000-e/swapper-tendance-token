import { NextResponse } from 'next/server'

const POPULAR_TOKENS = [
  'So11111111111111111111111111111111111111112',  // SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // WIF
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',  // JUP
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', // PYTH
  '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', // POPCAT
  'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',  // JTO
  'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',  // ORCA
  'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',  // RENDER
]

interface DexPair {
  baseToken: { address: string; name: string; symbol: string }
  priceUsd?: string
  priceChange?: { h24?: number }
  volume?: { h24?: number }
  marketCap?: number
  fdv?: number
  liquidity?: { usd?: number }
  info?: { imageUrl?: string }
}

interface PopularToken {
  address: string
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  fdv: number
  liquidity: number
  imageUrl: string | null
}

let cache: { data: PopularToken[]; timestamp: number } | null = null
const CACHE_TTL = 30_000 // 30s

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data)
    }

    const res = await fetch(
      `https://api.dexscreener.com/tokens/v1/solana/${POPULAR_TOKENS.join(',')}`,
      { headers: { Accept: 'application/json' }, cache: 'no-store' }
    )
    if (!res.ok) {
      if (cache) return NextResponse.json(cache.data)
      return NextResponse.json([], { status: 502 })
    }

    const pairs: DexPair[] = await res.json()

    // Best pair per token (highest volume)
    const bestPair = new Map<string, DexPair>()
    for (const pair of pairs) {
      const addr = pair.baseToken.address
      const existing = bestPair.get(addr)
      if (!existing || (pair.volume?.h24 ?? 0) > (existing.volume?.h24 ?? 0)) {
        bestPair.set(addr, pair)
      }
    }

    // Keep original order
    const tokens: PopularToken[] = []
    for (const addr of POPULAR_TOKENS) {
      const pair = bestPair.get(addr)
      if (!pair) continue
      tokens.push({
        address: addr,
        symbol: pair.baseToken.symbol,
        name: pair.baseToken.name,
        price: pair.priceUsd ? parseFloat(pair.priceUsd) : 0,
        change24h: pair.priceChange?.h24 ?? 0,
        volume24h: pair.volume?.h24 ?? 0,
        marketCap: pair.marketCap ?? 0,
        fdv: pair.fdv ?? 0,
        liquidity: pair.liquidity?.usd ?? 0,
        imageUrl: pair.info?.imageUrl ?? null,
      })
    }

    cache = { data: tokens, timestamp: Date.now() }
    return NextResponse.json(tokens)
  } catch {
    if (cache) return NextResponse.json(cache.data)
    return NextResponse.json([], { status: 500 })
  }
}
