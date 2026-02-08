export const USDC_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
export const SOL_ADDRESS = 'So11111111111111111111111111111111111111112'
export const WSOL_ADDRESS = 'So11111111111111111111111111111111111111112'

export const DEFAULT_SLIPPAGE = 0.5 // 0.5%
export const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0, 3.0]

export const CATEGORY_LABELS = {
  hot: { label: 'Hot' },
  new: { label: 'New' },
  gainer: { label: 'Gainers' },
  loser: { label: 'Losers' },
} as const

export const TIMEFRAMES = ['1H', '4H', '1D', '1W', '1M', 'ALL'] as const
