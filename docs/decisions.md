# Decision Log

## 2026-02-08: Initial Build

### Stack Choice
- **Decision**: Next.js 14 (App Router) + Tailwind CSS v3 + Framer Motion
- **Rationale**: Modern React stack, App Router for file-based routing, Tailwind for rapid styling
- **Alternatives**: Vite + React (simpler but no SSR), Next.js 15 (too new, API changes)

### DexScreener over lightweight-charts
- **Decision**: Replace lightweight-charts TradingView widget with DexScreener iframe embed
- **Context**: User preferred the DexScreener UX and real-time data display
- **Rationale**: DexScreener provides real chart data for Solana tokens out of the box; lightweight-charts required mock OHLCV data
- **Trade-off**: Less customization control, dependency on external service

### Remove Degen/Emoji Branding
- **Decision**: Remove all emojis from UI, keep neon color palette
- **Context**: User felt emojis looked "too AI generated" and not modern
- **Rationale**: Clean professional aesthetic with colorful accents is more appealing

### Brand: TendanceSwap
- **Decision**: Final name is TendanceSwap (French wordplay on "tendance" = trending)
- **History**: DegenSwap -> SolSwap -> TendanceSwap

### Fonts via HTML `<link>` Tags
- **Decision**: Load Google Fonts (Space Grotesk, JetBrains Mono) via `<link>` in layout.tsx `<head>`, NOT via CSS `@import`
- **Context**: `@import url()` in globals.css broke PostCSS processing, causing ALL styles to disappear
- **Rationale**: `<link>` tags bypass PostCSS entirely and are the recommended approach for Next.js

### Raw CSS over @apply for Custom Components
- **Decision**: Use raw CSS (hex colors, explicit properties) for `.glass`, `.glass-hover`, `.glow-*` classes instead of `@apply`
- **Context**: `@apply border-border` caused silent CSS failure because `border` is both a Tailwind utility and our custom color name
- **Rationale**: Raw CSS avoids all ambiguity and is more reliable with custom Tailwind color configs

### Token Image CDN
- **Decision**: Use `raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/{address}/logo.png`
- **Context**: `img.jup.ag` CDN was unreachable, all token images showed fallback SVG
- **Alternative considered**: Direct Jupiter CDN (down at time of development)

## 2026-02-08: Token Page Redesign

### StatsGrid: 3-Panel Design over Card Grid
- **Decision**: Replace 13 identical glass cards with 3 focused panels (Price Changes, Volume, Transactions)
- **Context**: User found the card grid repetitive and ugly. First tried a unified table (user hated it: "c'est encore pire"). Settled on 3 bordered panels with distinct visual treatments.
- **Iterations**: Glass cards → Animated glass cards → Unified table (rejected) → 3 separated panels (approved: "c'est insane")
- **Rationale**: Each panel has a distinct visual treatment (colored chips, horizontal bars, ratio bars) that makes the data scannable

### TokenHeader: Inline Stats Strip
- **Decision**: Move MCap/FDV/Liq/Vol/Supply/Age into a compact inline strip below the token name instead of separate stat cards
- **Context**: Reduces vertical space, keeps data accessible
- **Mobile**: Auto-scrolling marquee with pause-on-touch for manual scrolling

### Mobile Layout: CSS Order Reordering
- **Decision**: Use CSS `order` property to reorder token page sections on mobile (Chart → Swap → Transactions) vs desktop (Chart/Transactions left, Swap sidebar right)
- **Rationale**: Users on mobile want quick swap access before scrolling through transaction history

### Navbar: Separate Mobile Search Row
- **Decision**: Split navbar into 2 rows on mobile (logo+wallet top, full-width search bottom)
- **Context**: Wallet button was overlapping the centered search bar on small screens
- **Fix**: `hidden md:block` for desktop inline search, separate `md:hidden` row below for mobile search

### Marquee Pause on Touch
- **Decision**: Use CSS `animation-play-state: paused` on hover/active to let users manually scroll the stats marquee
- **Implementation**: `.pause-on-interact` utility class + `@media (pointer: coarse)` for touch devices
