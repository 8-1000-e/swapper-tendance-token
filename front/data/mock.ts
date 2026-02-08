import { Token, OHLCVData, Transaction, TokenCategory } from '@/types'

function generateSparkline(basePrice: number, change: number, points: number = 24): number[] {
  const data: number[] = []
  let price = basePrice * (1 - change / 100)
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1)
    const target = basePrice
    price = price + (target - price) * 0.1 + (Math.random() - 0.48) * basePrice * 0.03
    data.push(Math.max(price * 0.5, price))
  }
  data[data.length - 1] = basePrice
  return data
}

export const MOCK_TOKENS: Token[] = [
  {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    price: 178.42,
    change24h: 5.23,
    volume24h: 2_840_000_000,
    marketCap: 82_000_000_000,
    fdv: 104_000_000_000,
    supply: 459_000_000,
    holders: 5_200_000,
    liquidity: 1_200_000_000,
    description: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale.',
    website: 'https://solana.com',
    twitter: 'solana',
    telegram: 'solana',
    discord: 'solana',
    category: ['hot'],
    sparkline: [],
  },
  {
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    price: 0.00002847,
    change24h: 12.45,
    volume24h: 456_000_000,
    marketCap: 1_900_000_000,
    fdv: 2_600_000_000,
    supply: 66_700_000_000_000,
    holders: 890_000,
    liquidity: 45_000_000,
    description: 'The first Solana dog coin. For the people, by the people.',
    website: 'https://bonkcoin.com',
    twitter: 'bonaborman',
    telegram: 'bonaborman',
    category: ['hot', 'gainer'],
    sparkline: [],
  },
  {
    address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    symbol: 'WIF',
    name: 'dogwifhat',
    decimals: 6,
    price: 2.34,
    change24h: -3.21,
    volume24h: 389_000_000,
    marketCap: 2_340_000_000,
    fdv: 2_340_000_000,
    supply: 998_900_000,
    holders: 234_000,
    liquidity: 38_000_000,
    description: 'A dog with a hat. That\'s it. That\'s the token.',
    website: 'https://dogwifcoin.org',
    twitter: 'dogwifcoin',
    telegram: 'dogwifcoin',
    category: ['hot', 'loser'],
    sparkline: [],
  },
  {
    address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    symbol: 'JUP',
    name: 'Jupiter',
    decimals: 6,
    price: 1.12,
    change24h: 2.87,
    volume24h: 198_000_000,
    marketCap: 1_510_000_000,
    fdv: 11_200_000_000,
    supply: 1_350_000_000,
    holders: 412_000,
    liquidity: 120_000_000,
    description: 'Jupiter is the key liquidity aggregator for Solana, offering the widest range of tokens and best route discovery.',
    website: 'https://jup.ag',
    twitter: 'jupiterexchange',
    telegram: 'jupiterexchange',
    discord: 'jup',
    category: ['hot', 'gainer'],
    sparkline: [],
  },
  {
    address: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    symbol: 'PYTH',
    name: 'Pyth Network',
    decimals: 6,
    price: 0.42,
    change24h: -1.56,
    volume24h: 87_000_000,
    marketCap: 1_510_000_000,
    fdv: 4_200_000_000,
    supply: 3_600_000_000,
    holders: 189_000,
    liquidity: 56_000_000,
    description: 'Pyth delivers real-time market data to financial dApps across 40+ blockchains.',
    website: 'https://pyth.network',
    twitter: 'PythNetwork',
    category: ['hot'],
    sparkline: [],
  },
  {
    address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    symbol: 'RAY',
    name: 'Raydium',
    decimals: 6,
    price: 5.67,
    change24h: 8.92,
    volume24h: 145_000_000,
    marketCap: 1_500_000_000,
    fdv: 3_120_000_000,
    supply: 263_000_000,
    holders: 167_000,
    liquidity: 89_000_000,
    description: 'An on-chain order book AMM powering the evolution of DeFi on Solana.',
    website: 'https://raydium.io',
    twitter: 'RaydiumProtocol',
    telegram: 'raydiumprotocol',
    discord: 'raydium',
    category: ['hot', 'gainer'],
    sparkline: [],
  },
  {
    address: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
    symbol: 'ORCA',
    name: 'Orca',
    decimals: 6,
    price: 4.21,
    change24h: -2.34,
    volume24h: 34_000_000,
    marketCap: 420_000_000,
    fdv: 420_000_000,
    supply: 100_000_000,
    holders: 98_000,
    liquidity: 32_000_000,
    description: 'Orca is the most user-friendly concentrated liquidity DEX on Solana.',
    website: 'https://orca.so',
    twitter: 'orca_so',
    discord: 'orca',
    category: ['hot'],
    sparkline: [],
  },
  {
    address: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',
    symbol: 'RENDER',
    name: 'Render',
    decimals: 8,
    price: 8.94,
    change24h: 4.12,
    volume24h: 167_000_000,
    marketCap: 4_600_000_000,
    fdv: 4_600_000_000,
    supply: 517_000_000,
    holders: 78_000,
    liquidity: 67_000_000,
    description: 'The Render Network is a leading provider of decentralized GPU based rendering solutions.',
    website: 'https://rendernetwork.com',
    twitter: 'rendernetwork',
    category: ['gainer'],
    sparkline: [],
  },
  {
    address: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
    symbol: 'JTO',
    name: 'Jito',
    decimals: 9,
    price: 3.45,
    change24h: 6.78,
    volume24h: 112_000_000,
    marketCap: 420_000_000,
    fdv: 3_450_000_000,
    supply: 121_600_000,
    holders: 156_000,
    liquidity: 45_000_000,
    description: 'Jito is a major liquid staking protocol on Solana, powering MEV-optimized staking.',
    website: 'https://jito.network',
    twitter: 'jabormanfi',
    discord: 'jito',
    category: ['gainer'],
    sparkline: [],
  },
  {
    address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    symbol: 'POPCAT',
    name: 'Popcat',
    decimals: 9,
    price: 1.23,
    change24h: 18.45,
    volume24h: 234_000_000,
    marketCap: 1_200_000_000,
    fdv: 1_200_000_000,
    supply: 979_000_000,
    holders: 345_000,
    liquidity: 28_000_000,
    description: 'Popcat is a memecoin inspired by the famous Popcat internet meme.',
    twitter: 'PopcatSolana',
    telegram: 'popcatsolana',
    category: ['hot', 'gainer'],
    sparkline: [],
  },
  {
    address: 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5',
    symbol: 'MEW',
    name: 'cat in a dogs world',
    decimals: 5,
    price: 0.0089,
    change24h: -8.92,
    volume24h: 78_000_000,
    marketCap: 790_000_000,
    fdv: 790_000_000,
    supply: 88_888_888_888,
    holders: 212_000,
    liquidity: 15_000_000,
    description: 'MEW is a cat in a dogs world. The first major cat memecoin on Solana.',
    twitter: 'mabormanso',
    telegram: 'mabormanportal',
    category: ['hot', 'loser'],
    sparkline: [],
  },
  {
    address: '7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3',
    symbol: 'SLERF',
    name: 'SLERF',
    decimals: 9,
    price: 0.34,
    change24h: -15.67,
    volume24h: 45_000_000,
    marketCap: 340_000_000,
    fdv: 340_000_000,
    supply: 999_990_000,
    holders: 145_000,
    liquidity: 12_000_000,
    description: 'The token whose LP was accidentally burned. A legendary Solana moment.',
    twitter: 'slaborman',
    category: ['loser'],
    sparkline: [],
  },
  {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    price: 1.00,
    change24h: 0.01,
    volume24h: 5_600_000_000,
    marketCap: 44_000_000_000,
    fdv: 44_000_000_000,
    supply: 44_000_000_000,
    holders: 3_200_000,
    liquidity: 8_000_000_000,
    description: 'USDC is a fully collateralized US dollar stablecoin by Circle.',
    website: 'https://circle.com',
    twitter: 'circle',
    category: [],
    sparkline: [],
  },
  {
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    price: 1.00,
    change24h: -0.02,
    volume24h: 3_200_000_000,
    marketCap: 120_000_000_000,
    fdv: 120_000_000_000,
    supply: 120_000_000_000,
    holders: 2_100_000,
    liquidity: 5_000_000_000,
    description: 'Tether is the most widely used stablecoin in the crypto ecosystem.',
    website: 'https://tether.to',
    twitter: 'Tether_to',
    category: [],
    sparkline: [],
  },
  {
    address: 'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p91oHH',
    symbol: 'WEN',
    name: 'Wen',
    decimals: 5,
    price: 0.000189,
    change24h: 7.34,
    volume24h: 23_000_000,
    marketCap: 132_000_000,
    fdv: 132_000_000,
    supply: 699_999_000_000,
    holders: 421_000,
    liquidity: 8_000_000,
    description: 'WEN is a meme token that was airdropped to Jupiter users. Community-driven.',
    twitter: 'wabormanso',
    category: ['new', 'gainer'],
    sparkline: [],
  },
  {
    address: 'TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6',
    symbol: 'TNSR',
    name: 'Tensor',
    decimals: 9,
    price: 0.87,
    change24h: -4.56,
    volume24h: 34_000_000,
    marketCap: 130_000_000,
    fdv: 870_000_000,
    supply: 150_000_000,
    holders: 67_000,
    liquidity: 12_000_000,
    description: 'Tensor is the leading NFT marketplace and trading platform on Solana.',
    website: 'https://tensor.trade',
    twitter: 'tensor_hq',
    discord: 'tensor',
    category: ['loser'],
    sparkline: [],
  },
  {
    address: 'SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y',
    symbol: 'SHDW',
    name: 'Shadow Token',
    decimals: 9,
    price: 0.56,
    change24h: 3.21,
    volume24h: 12_000_000,
    marketCap: 89_000_000,
    fdv: 336_000_000,
    supply: 160_000_000,
    holders: 34_000,
    liquidity: 6_000_000,
    description: 'Shadow Drive provides decentralized storage on Solana.',
    website: 'https://shadow.cloud',
    twitter: 'geabormanomfdn',
    category: ['new'],
    sparkline: [],
  },
  {
    address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    symbol: 'mSOL',
    name: 'Marinade Staked SOL',
    decimals: 9,
    price: 198.34,
    change24h: 5.45,
    volume24h: 67_000_000,
    marketCap: 1_100_000_000,
    fdv: 1_100_000_000,
    supply: 5_500_000,
    holders: 178_000,
    liquidity: 340_000_000,
    description: 'mSOL is a liquid staking token representing staked SOL via Marinade Finance.',
    website: 'https://marinade.finance',
    twitter: 'MarinadeFinance',
    discord: 'mndao',
    category: ['gainer'],
    sparkline: [],
  },
  {
    address: 'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1',
    symbol: 'bSOL',
    name: 'BlazeStake Staked SOL',
    decimals: 9,
    price: 192.12,
    change24h: 5.12,
    volume24h: 23_000_000,
    marketCap: 340_000_000,
    fdv: 340_000_000,
    supply: 1_770_000,
    holders: 45_000,
    liquidity: 78_000_000,
    description: 'bSOL is a liquid staking token from BlazeStake, offering MEV-boosted staking rewards.',
    website: 'https://stake.solblaze.org',
    twitter: 'solaborman',
    category: ['new'],
    sparkline: [],
  },
  {
    address: 'ZEUS1aR7aX8DFFJf5QjWj2ftDDdNTroMNGo8YoQm3Gq',
    symbol: 'ZEUS',
    name: 'Zeus Network',
    decimals: 6,
    price: 0.67,
    change24h: 11.23,
    volume24h: 56_000_000,
    marketCap: 112_000_000,
    fdv: 670_000_000,
    supply: 167_000_000,
    holders: 89_000,
    liquidity: 18_000_000,
    description: 'Zeus Network is a permissionless communication layer connecting Solana and Bitcoin.',
    website: 'https://zeusnetwork.xyz',
    twitter: 'zeabormanwork',
    discord: 'zeus',
    category: ['new', 'gainer'],
    sparkline: [],
  },
]

// Generate sparklines for all tokens
MOCK_TOKENS.forEach(token => {
  token.sparkline = generateSparkline(token.price, token.change24h)
})

export function generatePriceHistory(token: Token, timeframe: string): OHLCVData[] {
  const now = Date.now()
  let points: number
  let interval: number

  switch (timeframe) {
    case '1H': points = 60; interval = 60_000; break
    case '4H': points = 48; interval = 5 * 60_000; break
    case '1D': points = 96; interval = 15 * 60_000; break
    case '1W': points = 84; interval = 2 * 3600_000; break
    case '1M': points = 90; interval = 8 * 3600_000; break
    case 'ALL': points = 120; interval = 24 * 3600_000; break
    default: points = 96; interval = 15 * 60_000
  }

  const data: OHLCVData[] = []
  let price = token.price * (1 - token.change24h / 100 * (timeframe === '1H' ? 0.3 : 1))
  const volatility = token.price * 0.015

  for (let i = 0; i < points; i++) {
    const time = Math.floor((now - (points - i) * interval) / 1000)
    const change = (Math.random() - 0.47) * volatility
    const open = price
    const close = price + change
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    const volume = token.volume24h / points * (0.5 + Math.random())

    data.push({ time, open, high, low, close: Math.max(close, 0.000001), volume })
    price = close
  }

  // Ensure last candle close matches current price
  if (data.length > 0) {
    data[data.length - 1].close = token.price
  }

  return data
}

const MOCK_WALLETS = [
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
  '3Kzh9qAqVWQhEsfQxTUm6xJKmbRZiL4U5TY3EJCZ9kM2',
  'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
  '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  'ASTy5VKQmQFP4i4y3pFcg1MNShw24m3VtFcB3SLvEdm3',
  '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  'BkuPHJjPEspuwY1Gcg7DoyHWdMHm1V5Nks4gTi4629hG',
]

export function generateTransactions(token: Token, count: number = 25): Transaction[] {
  const txs: Transaction[] = []
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    const type = Math.random() > 0.45 ? 'buy' : 'sell' as const
    const amount = Math.random() * 10000 * (1 / Math.max(token.price, 0.001))
    const priceVariation = token.price * (1 + (Math.random() - 0.5) * 0.01)
    txs.push({
      id: `tx-${token.symbol}-${i}`,
      type,
      tokenSymbol: token.symbol,
      amount,
      price: priceVariation,
      totalUsd: amount * priceVariation,
      wallet: MOCK_WALLETS[Math.floor(Math.random() * MOCK_WALLETS.length)],
      timestamp: now - Math.floor(Math.random() * 3600_000 * 24),
    })
  }

  return txs.sort((a, b) => b.timestamp - a.timestamp)
}

export function getTokenByAddress(address: string): Token | undefined {
  return MOCK_TOKENS.find(t => t.address === address)
}

export function getTokensByCategory(category: TokenCategory): Token[] {
  return MOCK_TOKENS.filter(t => t.category.includes(category))
}

export function searchTokens(query: string): Token[] {
  const q = query.toLowerCase()
  return MOCK_TOKENS.filter(
    t => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
  )
}
