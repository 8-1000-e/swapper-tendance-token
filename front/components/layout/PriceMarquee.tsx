'use client'

import { MOCK_TOKENS } from '@/data/mock'
import { formatPrice, formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function PriceMarquee() {
  const displayTokens = MOCK_TOKENS.filter(t => t.category.length > 0).slice(0, 12)
  const items = [...displayTokens, ...displayTokens] // duplicate for seamless loop

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
