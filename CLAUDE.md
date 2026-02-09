# TendanceSwap — Project Instructions

## Project Identity

This is **TendanceSwap**, a Solana token swapper frontend. The project lives at:

- **Root**: `/Users/emile/Documents/swapper-tendance-token/`
- **Frontend**: `/Users/emile/Documents/swapper-tendance-token/front/` (Next.js 14 app — this is the main codebase)
- **Backend/Swapper**: `/Users/emile/Documents/swapper-tendance-token/swapper/` (Solana swap backend)

IMPORTANT: The working directory `/Users/emile/Documents/x-ray/` is a completely separate project (X-Ray) and has NOTHING to do with TendanceSwap. Always work inside `/Users/emile/Documents/swapper-tendance-token/`. If you see x-ray paths in the environment, ignore them.

## Context Recovery

IMPORTANT: At session start, read all .md files in the /docs/ directory to restore full project context from the previous session.

## Current State

- **Branch**: feat/marquee-pause-on-touch (latest merged PRs up to #11)
- **Status**: Feature-complete — live data, wallet, swap, mobile layout, stats marquee. Pending deploy.
- **Last updated**: 2026-02-08

## Task Progress

- [x] Scaffolding: Next.js 14 + deps installed, Tailwind/PostCSS configured
- [x] Foundation: types, mock data (20 tokens), utils, constants
- [x] UI primitives: Button, Badge, Card, Modal, CopyButton, Skeleton
- [x] Layout: Navbar (TS hover animation, centered search), Footer, PriceMarquee
- [x] Swap components: TokenSelector, AmountInput, SwapDirectionButton, SwapButton, SlippagePopover, ExchangeRate, PriceImpact, RouteInfo
- [x] SwapWidget: assembled with mock swap logic
- [x] Trending: SparklineChart (SVG), TokenCard, CategoryTabs, TrendingSection
- [x] Swap page (/) assembled
- [x] Token detail: DexScreener embed (replaced lightweight-charts), TokenHeader, StatsGrid (6-col with icons), TokenDescription, TransactionsTable, MiniSwapWidget
- [x] Token page (/token/[address]) assembled
- [x] Polish: removed emojis, saturated green/red colors, navbar layout fixes, logo integration
- [x] Connect to real Solana data (DexScreener API + Helius RPC)
- [x] Wallet integration (Solana wallet-adapter)
- [x] Live swap execution via Jupiter
- [x] Mobile layout fixes (navbar, token page order, stats marquee)
- [ ] Deploy

## Key Decisions

- **DexScreener over lightweight-charts**: User preferred embedded DexScreener iframe over custom TradingView chart
- **No emojis**: User explicitly rejected degen emoji style as "AI generated"
- **Brand**: TendanceSwap (was DegenSwap -> SolSwap -> TendanceSwap)
- **Navbar animation**: "TS" logo text expands to "TendanceSwap" on hover via CSS max-width transition
- **Token images**: Using solana-labs GitHub CDN (`raw.githubusercontent.com/solana-labs/token-list/...`) because img.jup.ag was unreachable
- **Fonts via `<link>` not `@import`**: CSS `@import url()` breaks PostCSS processing in Next.js 14

## UI Skills

IMPORTANT: Use these skills proactively without being asked, based on the type of work:

- **Building/modifying UI**: Use `/impeccable:frontend-design` to guide the design
- **After finishing UI work**: Run `/baseline-ui` to audit quality, then `/impeccable:polish` for final pass
- **Animations**: Use `/fixing-motion-performance` to check performance, `/impeccable:animate` to enhance
- **Responsive/mobile**: Use `/impeccable:adapt` to ensure cross-device consistency
- **Accessibility**: Use `/fixing-accessibility` and `/impeccable:audit` to catch issues
- **Error states/edge cases**: Use `/impeccable:harden` for robustness
- **Copy/labels/messages**: Use `/impeccable:clarify` to improve UX writing
- **Design feels bland**: Use `/impeccable:bolder` or `/impeccable:colorize`
- **Design feels too busy**: Use `/impeccable:quieter` or `/impeccable:simplify`
- **Before shipping**: Run `/impeccable:audit` for a full quality check

## Git Rules

- **No Claude in commits**: Never mention Claude, AI, or "Co-Authored-By" in commit messages. Commits must look fully human-written.

## Dev Notes

- **Port**: Use `3001` (port 3000 is occupied)
- **PATH**: Must set `export PATH="/opt/homebrew/bin:..."` in Bash commands
- **Node**: v24.7.0 at `/opt/homebrew/bin/node`
- **CSS gotcha**: Never use `@apply` with custom color names that shadow Tailwind utilities (e.g., `border-border`). Use raw CSS instead.
