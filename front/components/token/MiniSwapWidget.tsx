'use client'

import { Token } from '@/types'
import { MOCK_TOKENS } from '@/data/mock'
import SwapWidget from '@/components/swap/SwapWidget'

interface MiniSwapWidgetProps {
  token: Token
}

export default function MiniSwapWidget({ token }: MiniSwapWidgetProps) {
  const usdc = MOCK_TOKENS.find(t => t.symbol === 'USDC')!

  return (
    <SwapWidget
      initialFromToken={usdc}
      initialToToken={token}
      compact
    />
  )
}
