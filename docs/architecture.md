# Architecture — TendanceSwap Frontend

## Directory Structure

```
front/
├── app/
│   ├── layout.tsx              # Root layout: fonts (<link>), Navbar, Footer, PriceMarquee, WalletProvider
│   ├── page.tsx                # Swap page: SwapWidget + TrendingSection
│   ├── globals.css             # Tailwind directives + raw CSS components (.glass, .pause-on-interact, etc.)
│   ├── token/[address]/page.tsx # Token detail page (3-col grid, CSS order for mobile)
│   └── api/                    # API routes proxying external services
│       ├── token/[address]/route.ts   # DexScreener pairs API → Token data
│       ├── trending/route.ts          # DexScreener trending tokens
│       ├── trades/[pairAddress]/route.ts # DexScreener trades
│       ├── ohlcv/[pairAddress]/route.ts  # DexScreener OHLCV
│       ├── search/route.ts            # DexScreener token search
│       └── popular/route.ts           # Popular tokens for search dropdown
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # 2-row mobile (logo+wallet | search), 1-row desktop, live search dropdown
│   │   ├── Footer.tsx
│   │   └── PriceMarquee.tsx    # Infinite scroll ticker
│   ├── swap/
│   │   ├── SwapWidget.tsx      # Main orchestrator (wallet-connected swap via Jupiter)
│   │   ├── TokenSelector.tsx   # Modal with search input + scrollable token list
│   │   ├── AmountInput.tsx
│   │   ├── SwapDirectionButton.tsx  # Animated flip button
│   │   ├── SwapButton.tsx
│   │   ├── SlippagePopover.tsx
│   │   ├── ExchangeRate.tsx
│   │   ├── PriceImpact.tsx
│   │   └── RouteInfo.tsx
│   ├── trending/
│   │   ├── TrendingSection.tsx # Filter tabs + token grid from DexScreener API
│   │   ├── CategoryTabs.tsx    # Hot, New, Gainers, Losers (no emojis)
│   │   ├── TokenCard.tsx       # Card with sparkline, price, 24h change
│   │   └── SparklineChart.tsx  # Pure SVG polyline (no canvas/library)
│   ├── token/
│   │   ├── TokenHeader.tsx     # Compact: icon, name, inline stats marquee, socials, security badges
│   │   ├── PriceChart.tsx      # DexScreener iframe embed (600px)
│   │   ├── StatsGrid.tsx       # 3-panel: Price Changes | Volume | Transactions (multi-timeframe)
│   │   ├── TokenDescription.tsx # Minimal bordered panel
│   │   ├── TopHolders.tsx      # Staggered rows with animated % bars
│   │   ├── TransactionsTable.tsx # Live trades, flash animation, green live dot
│   │   └── MiniSwapWidget.tsx  # Sidebar swap (token pre-selected)
│   └── ui/
│       ├── Button.tsx, Badge.tsx, Card.tsx, Modal.tsx, CopyButton.tsx, Skeleton.tsx
├── data/mock.ts                # 20 tokens (still used as fallback seed data)
├── hooks/useTokenSearch.ts
├── lib/
│   ├── utils.ts                # cn(), formatPrice(), formatNumber(), formatPercent(), formatAddress(), timeAgo()
│   └── constants.ts            # CATEGORIES, SOL/USDC addresses
├── types/index.ts              # Token (expanded: priceNative, change5m/1h/6h, volume5m/1h/6h, txns, topHolders, mintAuthority, freezeAuthority, etc.)
├── tailwind.config.ts          # Custom colors (neon-*), animations (marquee, spin-border), fonts
├── next.config.js              # remotePatterns for GitHub CDN
└── postcss.config.mjs
```

## Data Flow

- **Live data**: API routes in `app/api/` proxy DexScreener and Helius APIs
- Token pages fetch from `/api/token/[address]` with 30s refresh interval
- Trades poll from `/api/trades/[pairAddress]` every 3s
- Trending tokens from `/api/trending`
- Search from `/api/search?q=...` with 300ms debounce
- `SwapWidget` manages state (fromToken, toToken, amount, slippage) and executes swaps via Jupiter when wallet connected
- Token pages use `useParams()` (Next.js 14 — direct object, NOT Promise)

## Styling System

- **Base**: Tailwind CSS v3 with custom theme in `tailwind.config.ts`
- **Custom colors**: `neon-green` (#39FF14), `neon-purple` (#BF40BF), `neon-pink` (#FF6EC7), `neon-yellow` (#FFD700), `neon-cyan` (#00FFFF)
- **Background colors**: `bg-primary` (#0A0A0F), `bg-surface` (#12121A), `bg-elevated` (#1A1A28), `bg-hover` (#22222E)
- **Component classes**: `.glass`, `.glass-hover`, `.glow-purple`, `.gradient-degen`, `.gradient-degen-text`, `.pause-on-interact` — all raw CSS in globals.css
- **Animations**: Framer Motion for page transitions, stagger effects, trade flash; CSS for marquee (auto-scroll + pause-on-touch), glow-pulse, spin-border

## Key Patterns

### Mobile Stats Marquee
Stats strip in TokenHeader auto-scrolls on mobile via CSS `animate-marquee` (translateX 0% → -50% with duplicated content for seamless loop). Paused on hover/touch via `.pause-on-interact` utility. Disabled on desktop via `sm:animate-none`.

### Responsive Token Page Layout
Uses CSS `order` property for different mobile vs desktop layouts:
- Mobile: Chart (order-1) → Swap (order-2) → Transactions (order-3)
- Desktop: Chart/Transactions (left 2 cols) | Swap/Description/Holders (right sticky sidebar)

### Live Trade Flash
TransactionsTable tracks trade IDs across polls. New trades get a `freshIds` set, triggering a Framer Motion background-color flash (green for buy, red for sell) that fades over 1.5s.

## Backend

- `/swapper/` contains TypeScript module for swapping SPL tokens via Jupiter Ultra API
- API routes in `front/app/api/` handle all data fetching (DexScreener + Helius)
