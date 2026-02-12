# Debugging Notes

## CSS Completely Broken — No Styles Loading (2026-02-08)

### Symptoms
- Page rendered HTML structure but appeared completely unstyled (white text on white bg, no layout)
- All Tailwind classes present in HTML but no CSS rules applied
- No errors in terminal build output

### Investigation
1. First suspected Tailwind config issue — config was fine
2. Discovered `@import url('https://fonts.googleapis.com/...')` in globals.css after `@tailwind` directives
3. Moved `@import` before `@tailwind` — still broken
4. Found `* { @apply border-border; }` (from shadcn/ui pattern) conflicting because `border` is both a Tailwind utility AND our custom color name
5. Removed the global reset — still broken
6. Root cause: `@import url()` in CSS fundamentally breaks PostCSS processing in Next.js 14

### Fix (3 steps)
1. **Moved fonts to `<link>` tags** in `layout.tsx` `<head>` — completely removed all `@import` from CSS
2. **Removed `* { @apply border-border }`** global reset
3. **Rewrote all `@apply` component classes** (`.glass`, `.glass-hover`, `.glow-*`) to raw CSS with explicit hex values

### Key Lesson
Never use `@import url()` in a CSS file that contains `@tailwind` directives. PostCSS processes the file and can silently fail when encountering `@import`. Use `<link>` tags in HTML instead.

---

## lightweight-charts v5 API Change (2026-02-08)

### Symptoms
- `Property 'addAreaSeries' does not exist on type 'IChartApi'. Did you mean 'addSeries'?`
- TypeScript compilation error

### Root Cause
lightweight-charts v5 changed the API. Methods like `chart.addAreaSeries()` were replaced with `chart.addSeries(AreaSeries, options)`.

### Fix
```typescript
import { createChart, AreaSeries, HistogramSeries } from 'lightweight-charts'
const series = chart.addSeries(AreaSeries, { lineColor: '#39FF14' })
```

### Note
This was later replaced entirely by DexScreener iframe embed, so lightweight-charts was uninstalled.

---

## Next.js 14 params — Not a Promise (2026-02-08)

### Symptoms
- Token detail page returned 404
- `use(params)` caused runtime error

### Root Cause
In Next.js 14, page `params` is a direct object `{ address: string }`. The `Promise<params>` pattern is Next.js 15+.

### Fix
```typescript
// Wrong (Next.js 15):
import { use } from 'react'
export default function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params)

// Correct (Next.js 14):
export default function Page({ params }: { params: { address: string } }) {
  const { address } = params
```

---

## Token Images Not Loading (2026-02-08)

### Symptoms
- All token cards showed fallback SVG (first 2 letters of symbol)
- Network tab showed failed requests to `img.jup.ag`

### Root Cause
Jupiter's image CDN (`img.jup.ag`) was unreachable at time of development.

### Fix
Switched to `raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/{address}/logo.png`

Updated `next.config.js` remotePatterns accordingly.

---

## Framer Motion Ease Type Error (2026-02-08)

### Symptoms
- TypeScript error: `ease: [0.25, 0.46, 0.45, 0.94]` incompatible with Framer Motion's `Easing` type
- `number[]` doesn't satisfy the cubic bezier tuple type

### Root Cause
Framer Motion expects `ease` to be a named string (`'easeOut'`, `'easeInOut'`) or a `[number, number, number, number]` tuple. A plain `number[]` doesn't satisfy the tuple type.

### Fix
Use named easings instead of numeric arrays:
```typescript
// Wrong:
ease: [0.25, 0.46, 0.45, 0.94]

// Correct:
ease: 'easeOut' as const
// Or cast the tuple:
ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
```

---

## Mobile Navbar Overlap (2026-02-08)

### Symptoms
- On mobile, wallet button overlapped the search bar
- Search bar was absolutely positioned with `left-1/2 -translate-x-1/2`

### Fix
Restructured to 2 rows on mobile:
- Row 1: Logo + nav links + wallet button (normal flex)
- Row 2 (`md:hidden`): Full-width search bar
- Desktop: Single row with search in flex flow (`hidden md:block flex-1 max-w-md mx-auto`)
