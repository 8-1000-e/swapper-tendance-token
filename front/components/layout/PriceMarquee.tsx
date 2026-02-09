'use client'

import { useState, useEffect } from 'react'
import { formatPrice, formatPercent, cn } from '@/lib/utils'

interface MarqueeToken {
  symbol: string
  price: number
  change24h: number
}

export default function PriceMarquee() {
  const [tokens, setTokens] = useState<MarqueeToken[]>([])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/trending')
        if (!res.ok) return
        const data = await res.json()
        const items: MarqueeToken[] = (data ?? []).slice(0, 12).map((t: any) => ({
          symbol: t.symbol,
          price: t.price,
          change24h: t.change24h,
        }))
        if (items.length > 0) setTokens(items)
      } catch {
        // silent
      }
    }
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [])

  if (tokens.length === 0) return null

  const items = [...tokens, ...tokens] // duplicate for seamless loop

  return (
    <div className="w-full overflow-hidden border-b border-border bg-bg-surface/50">
      <div className="animate-marquee flex items-center gap-8 py-2 whitespace-nowrap w-max">
        {items.map((token, i) => (
          <div key={`${token.symbol}-${i}`} className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-medium">{token.symbol}</span>
            <span className="text-white font-mono">{formatPrice(token.price)}</span>
            <span
              className={cn(
                'font-mono font-semibold',
                token.change24h >= 0 ? 'text-neon-green' : 'text-red-400'
              )}
            >
              {formatPercent(token.change24h)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
