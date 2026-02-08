'use client'

import { Token } from '@/types'

interface PriceChartProps {
  token: Token
}

export default function PriceChart({ token }: PriceChartProps) {
  const embedUrl = `https://dexscreener.com/solana/${token.address}?embed=1&theme=dark&info=0&trades=0`

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <iframe
        src={embedUrl}
        title={`${token.symbol} chart`}
        className="w-full border-0"
        style={{ height: 500 }}
        allow="clipboard-write"
        loading="lazy"
      />
    </div>
  )
}
