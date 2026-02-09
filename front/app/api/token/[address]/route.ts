import { NextResponse } from 'next/server'
import type { Token, TokenTopHolder } from '@/types'

interface DexPair {
  pairAddress: string
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  priceNative?: string
  priceUsd?: string
  txns?: {
    m5?: { buys?: number; sells?: number }
    h1?: { buys?: number; sells?: number }
    h6?: { buys?: number; sells?: number }
    h24?: { buys?: number; sells?: number }
  }
  volume?: { m5?: number; h1?: number; h6?: number; h24?: number }
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number }
  liquidity?: { usd?: number }
  marketCap?: number
  fdv?: number
  pairCreatedAt?: number
  info?: {
    imageUrl?: string
    websites?: { url: string; label?: string }[]
    socials?: { url: string; type: string }[]
  }
}

interface HeliusAsset {
  content?: {
    metadata?: {
      description?: string
      name?: string
      symbol?: string
    }
  }
  authorities?: { address: string; scopes: string[] }[]
  token_info?: {
    supply?: number
    decimals?: number
    price_info?: {
      price_per_token?: number
    }
    mint_authority?: string
    freeze_authority?: string
  }
}

interface LargestAccount {
  address: string
  uiAmount: number
  decimals: number
  amount: string
}

const HELIUS_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'

async function fetchHeliusAsset(address: string): Promise<HeliusAsset | null> {
  try {
    const res = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAsset',
        params: { id: address, displayOptions: { showFungible: true } },
      }),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.result ?? null
  } catch {
    return null
  }
}

async function fetchTopHolders(address: string, decimals: number, totalSupply: number): Promise<TokenTopHolder[]> {
  try {
    const res = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenLargestAccounts',
        params: [address],
      }),
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    const accounts: LargestAccount[] = data.result?.value ?? []

    const uiSupply = totalSupply / Math.pow(10, decimals)

    return accounts.slice(0, 10).map((acc) => ({
      address: acc.address,
      amount: acc.uiAmount,
      percentage: uiSupply > 0 ? (acc.uiAmount / uiSupply) * 100 : 0,
    }))
  } catch {
    return []
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { address: string } }
) {
  const { address } = params

  try {
    // Fetch DexScreener and Helius in parallel
    const [dexRes, heliusAsset] = await Promise.all([
      fetch(
        `https://api.dexscreener.com/tokens/v1/solana/${address}`,
        { headers: { Accept: 'application/json' }, cache: 'no-store' }
      ),
      fetchHeliusAsset(address),
    ])

    if (!dexRes.ok) {
      return NextResponse.json({ error: 'DexScreener API error' }, { status: 502 })
    }

    const pairs: DexPair[] = await dexRes.json()
    if (!pairs || pairs.length === 0) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 })
    }

    // Pick the pair with highest volume
    let best = pairs[0]
    for (const pair of pairs) {
      if ((pair.volume?.h24 ?? 0) > (best.volume?.h24 ?? 0)) {
        best = pair
      }
    }

    // Extract socials
    const socials = best.info?.socials ?? []
    const twitterSocial = socials.find(s => s.type === 'twitter')
    const telegramSocial = socials.find(s => s.type === 'telegram')
    const discordSocial = socials.find(s => s.type === 'discord')

    // Helius data
    const tokenInfo = heliusAsset?.token_info
    const decimals = tokenInfo?.decimals ?? 0
    const rawSupply = tokenInfo?.supply ?? 0
    const uiSupply = rawSupply / Math.pow(10, decimals)
    const description = heliusAsset?.content?.metadata?.description

    // Fetch top holders (needs supply info from Helius)
    const topHolders = rawSupply > 0
      ? await fetchTopHolders(address, decimals, rawSupply)
      : []

    // Check for mint/freeze authority
    const hasMintAuthority = !!tokenInfo?.mint_authority
    const hasFreezeAuthority = !!tokenInfo?.freeze_authority

    const token: Token = {
      address: best.baseToken.address,
      pairAddress: best.pairAddress,
      symbol: best.baseToken.symbol,
      name: best.baseToken.name,
      decimals,
      price: best.priceUsd ? parseFloat(best.priceUsd) : 0,
      priceNative: best.priceNative ? parseFloat(best.priceNative) : undefined,
      change24h: best.priceChange?.h24 ?? 0,
      change1h: best.priceChange?.h1 ?? undefined,
      change6h: best.priceChange?.h6 ?? undefined,
      change5m: best.priceChange?.m5 ?? undefined,
      volume24h: best.volume?.h24 ?? 0,
      volume1h: best.volume?.h1 ?? undefined,
      volume6h: best.volume?.h6 ?? undefined,
      volume5m: best.volume?.m5 ?? undefined,
      marketCap: best.marketCap ?? 0,
      fdv: best.fdv ?? 0,
      liquidity: best.liquidity?.usd ?? 0,
      supply: uiSupply > 0 ? uiSupply : undefined,
      imageUrl: best.info?.imageUrl ?? undefined,
      website: best.info?.websites?.[0]?.url ?? undefined,
      twitter: twitterSocial?.url ?? undefined,
      telegram: telegramSocial?.url ?? undefined,
      discord: discordSocial?.url ?? undefined,
      description: description ?? undefined,
      pairCreatedAt: best.pairCreatedAt ?? undefined,
      txns24h: best.txns?.h24 ? { buys: best.txns.h24.buys ?? 0, sells: best.txns.h24.sells ?? 0 } : undefined,
      txns1h: best.txns?.h1 ? { buys: best.txns.h1.buys ?? 0, sells: best.txns.h1.sells ?? 0 } : undefined,
      txns6h: best.txns?.h6 ? { buys: best.txns.h6.buys ?? 0, sells: best.txns.h6.sells ?? 0 } : undefined,
      txns5m: best.txns?.m5 ? { buys: best.txns.m5.buys ?? 0, sells: best.txns.m5.sells ?? 0 } : undefined,
      topHolders: topHolders.length > 0 ? topHolders : undefined,
      mintAuthority: hasMintAuthority || undefined,
      freezeAuthority: hasFreezeAuthority || undefined,
    }

    return NextResponse.json(token)
  } catch (error) {
    console.error('Token API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
