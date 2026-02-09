'use client'

import { Token } from '@/types'
import { USDC_ADDRESS } from '@/lib/constants'
import SwapWidget from '@/components/swap/SwapWidget'

interface MiniSwapWidgetProps {
  token: Token
}

const USDC_TOKEN: Token = {
  address: USDC_ADDRESS,
  symbol: 'USDC',
  name: 'USD Coin',
  price: 1,
  change24h: 0,
  volume24h: 0,
  marketCap: 0,
  fdv: 0,
  liquidity: 0,
}

export default function MiniSwapWidget({ token }: MiniSwapWidgetProps) {
  return (
    <SwapWidget
      initialFromToken={USDC_TOKEN}
      initialToToken={token}
      compact
    />
  )
}
