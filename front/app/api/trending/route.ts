import { NextResponse } from 'next/server'
import type { TrendingToken } from '@/types'

interface BoostToken {
  chainId: string
  tokenAddress: string
  totalAmount: number
}

interface DexPair {
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  priceUsd?: string
  volume?: { h24?: number }
  priceChange?: { h24?: number }
  liquidity?: { usd?: number }
  marketCap?: number
  fdv?: number
  pairCreatedAt?: number
  info?: {
    imageUrl?: string
  }
}

let cache: { data: TrendingToken[]; timestamp: number } | null = null
const CACHE_TTL = 60_000 // 60 seconds

async function fetchTrending(): Promise<TrendingToken[]> {
  // 1. Fetch top boosted tokens
  const boostRes = await fetch('https://api.dexscreener.com/token-boosts/top/v1', {
    headers: { Accept: 'application/json' },
  })
  if (!boostRes.ok) throw new Error(`Boost API ${boostRes.status}`)

  const boosts: BoostToken[] = await boostRes.json()

  // Filter Solana tokens and aggregate boost amounts per address
  const boostMap: Record<string, number> = {}
  for (const b of boosts) {
    if (b.chainId !== 'solana') continue
    boostMap[b.tokenAddress] = (boostMap[b.tokenAddress] ?? 0) + b.totalAmount
  }

  const addresses = Object.keys(boostMap).slice(0, 30)
  if (addresses.length === 0) return []

  // 2. Fetch trading data in one batch
  const tokenRes = await fetch(
    `https://api.dexscreener.com/tokens/v1/solana/${addresses.join(',')}`,
    { headers: { Accept: 'application/json' } },
  )
  if (!tokenRes.ok) throw new Error(`Token API ${tokenRes.status}`)

  const pairs: DexPair[] = await tokenRes.json()

  // 3. Pick the pair with highest volume per token
  const bestPair: Record<string, DexPair> = {}
  for (const pair of pairs) {
    const addr = pair.baseToken.address
    const existing = bestPair[addr]
    if (!existing || (pair.volume?.h24 ?? 0) > (existing.volume?.h24 ?? 0)) {
      bestPair[addr] = pair
    }
  }

  // 4. Build TrendingToken array
  const tokens: TrendingToken[] = []
  for (const addr of addresses) {
    const pair = bestPair[addr]
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
      pairCreatedAt: pair.pairCreatedAt ?? null,
      boostAmount: boostMap[addr],
    })
  }

  tokens.sort((a, b) => b.boostAmount - a.boostAmount)
  return tokens
}

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data)
    }

    const data = await fetchTrending()
    cache = { data, timestamp: Date.now() }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Trending API error:', error)
    if (cache) return NextResponse.json(cache.data)
    return NextResponse.json([], { status: 502 })
  }
}
