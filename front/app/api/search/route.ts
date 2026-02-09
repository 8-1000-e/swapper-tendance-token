import { NextRequest, NextResponse } from 'next/server'

interface DexPair {
  chainId: string
  baseToken: { address: string; name: string; symbol: string }
  priceUsd?: string
  priceChange?: { h24?: number }
  volume?: { h24?: number }
  marketCap?: number
  fdv?: number
  liquidity?: { usd?: number }
  info?: { imageUrl?: string }
}

interface SearchResult {
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

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 1) {
    return NextResponse.json([])
  }

  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`,
      { headers: { Accept: 'application/json' }, cache: 'no-store' }
    )
    if (!res.ok) {
      return NextResponse.json([])
    }

    const data = await res.json()
    const pairs: DexPair[] = data.pairs ?? []

    // Only Solana pairs
    const solanaPairs = pairs.filter(p => p.chainId === 'solana')

    // Deduplicate by token address, keep best pair (highest volume)
    const tokenMap = new Map<string, { pair: DexPair; volume: number }>()
    for (const pair of solanaPairs) {
      const addr = pair.baseToken.address
      const vol = pair.volume?.h24 ?? 0
      const existing = tokenMap.get(addr)
      if (!existing || vol > existing.volume) {
        tokenMap.set(addr, { pair, volume: vol })
      }
    }

    const results: SearchResult[] = Array.from(tokenMap.values())
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 8)
      .map(({ pair }) => ({
        address: pair.baseToken.address,
        symbol: pair.baseToken.symbol,
        name: pair.baseToken.name,
        price: pair.priceUsd ? parseFloat(pair.priceUsd) : 0,
        change24h: pair.priceChange?.h24 ?? 0,
        volume24h: pair.volume?.h24 ?? 0,
        marketCap: pair.marketCap ?? 0,
        fdv: pair.fdv ?? 0,
        liquidity: pair.liquidity?.usd ?? 0,
        imageUrl: pair.info?.imageUrl ?? null,
      }))

    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
