# Current Task — TendanceSwap Frontend

## Status: Feature-complete, pending deploy

All core features built and functional with live Solana data. Multiple PRs merged.

## What Was Built

### Page 1: Swap (`/`)
- SwapWidget (glass card, glow purple) with token selectors, amount input, flip button, exchange rate, price impact, route info, slippage settings
- TokenSelector modal with search and token list
- TrendingSection below: filterable grid (Hot, New, Gainers, Losers) from DexScreener trending API
- PriceMarquee at top with scrolling token prices
- Swap success popup with celebration animation

### Page 2: Token Detail (`/token/[address]`)
- **TokenHeader**: compact layout with inline stats strip (MCap · FDV · Liq · Vol · Supply · Age), social links, security badges (Mint/Freeze authority), auto-scroll marquee on mobile with pause-on-touch
- **StatsGrid**: 3-column design — Price Changes (colored chips), Volume (horizontal bars), Transactions (buy/sell ratio bars) — each with multi-timeframe data (5min, 1h, 6h, 1d)
- **PriceChart**: DexScreener iframe embed (600px height) with loading overlay
- **TokenDescription**: minimal bordered panel with token description
- **TopHolders**: staggered rows with animated percentage bars
- **TransactionsTable**: live trades from DexScreener API with fresh-trade flash animation, green pulsing live dot
- **MiniSwapWidget**: in sidebar (token pre-selected), sticky on desktop

### Layout
- Navbar: 2-row mobile layout (logo+wallet top, search bottom), single row desktop
- Mobile token page: Chart → Swap → Transactions (reordered via CSS `order`)
- Desktop token page: 3-column grid, sidebar with swap/description/holders sticky

### Live Data
- API routes in `front/app/api/` proxying DexScreener + Helius
- `/api/token/[address]` — token info from DexScreener pairs
- `/api/trending` — trending tokens
- `/api/trades/[pairAddress]` — recent trades (polls every 3s)
- `/api/ohlcv/[pairAddress]` — OHLCV data
- `/api/search` — token search via DexScreener
- `/api/popular` — popular tokens for search dropdown

### Wallet & Swap
- Solana wallet-adapter integration (Phantom, Solflare, etc.)
- Live swap execution via Jupiter
- Swap success popup with celebration animation

## What's Next

1. **Deploy**: Vercel or similar

## How to Run

```bash
cd /Users/emile/Documents/swapper-tendance-token/front
export PATH="/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
npm run dev -- -p 3001
```

Then open http://localhost:3001
