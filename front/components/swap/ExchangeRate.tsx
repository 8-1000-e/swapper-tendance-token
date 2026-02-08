'use client'

import { useState } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { Token } from '@/types'

interface ExchangeRateProps {
  tokenFrom: Token | null
  tokenTo: Token | null
  rate: number | null
}

export default function ExchangeRate({ tokenFrom, tokenTo, rate }: ExchangeRateProps) {
  const [inverted, setInverted] = useState(false)

  if (!tokenFrom || !tokenTo || !rate) return null

  const displayRate = inverted ? 1 / rate : rate
  const fromSymbol = inverted ? tokenTo.symbol : tokenFrom.symbol
  const toSymbol = inverted ? tokenFrom.symbol : tokenTo.symbol

  return (
    <button
      onClick={() => setInverted(!inverted)}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
    >
      <ArrowRightLeft size={12} />
      <span className="font-mono">
        1 {fromSymbol} = {displayRate < 0.01 ? displayRate.toFixed(8) : displayRate.toFixed(4)} {toSymbol}
      </span>
    </button>
  )
}
