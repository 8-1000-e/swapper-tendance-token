export interface TokenTxns {
  buys: number
  sells: number
}

export interface TokenTopHolder {
  address: string
  amount: number
  percentage: number
}

export interface Token {
  address: string
  pairAddress?: string
  symbol: string
  name: string
  decimals?: number
  price: number
  priceNative?: number
  change24h: number
  change1h?: number
  change6h?: number
  change5m?: number
  volume24h: number
  volume1h?: number
  volume6h?: number
  volume5m?: number
  marketCap: number
  fdv: number
  supply?: number
  holders?: number
  liquidity: number
  description?: string
  imageUrl?: string
  website?: string
  twitter?: string
  telegram?: string
  discord?: string
  category?: TokenCategory[]
  sparkline?: number[]
  pairCreatedAt?: number
  txns24h?: TokenTxns
  txns1h?: TokenTxns
  txns6h?: TokenTxns
  txns5m?: TokenTxns
  topHolders?: TokenTopHolder[]
  mintAuthority?: boolean
  freezeAuthority?: boolean
}

export type TokenCategory = 'hot' | 'new' | 'gainer' | 'loser'

export interface TrendingToken {
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
  pairCreatedAt: number | null
  boostAmount: number
}

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
