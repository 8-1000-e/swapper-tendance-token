export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  fdv: number
  supply: number
  holders: number
  liquidity: number
  description: string
  website?: string
  twitter?: string
  telegram?: string
  discord?: string
  category: TokenCategory[]
  sparkline: number[]
}

export type TokenCategory = 'hot' | 'new' | 'gainer' | 'loser'

export interface OHLCVData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Transaction {
  id: string
  type: 'buy' | 'sell'
  tokenSymbol: string
  amount: number
  price: number
  totalUsd: number
  wallet: string
  timestamp: number
}

export interface WalletBalance {
  token: Token
  amount: number
  valueUsd: number
}

export type Timeframe = '1H' | '4H' | '1D' | '1W' | '1M' | 'ALL'

export interface SwapQuote {
  inputAmount: number
  outputAmount: number
  exchangeRate: number
  priceImpact: number
  minimumReceived: number
  route: string[]
  fee: number
}
