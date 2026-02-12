# Setup — TendanceSwap Frontend

## Prerequisites
- Node.js (tested with v24.7.0 at `/opt/homebrew/bin/node`)
- npm

## Installation

```bash
cd /Users/emile/Documents/swapper-tendance-token/front
npm install
```

## Dependencies Installed
- next@14, react@18, react-dom@18
- typescript, @types/react, @types/react-dom, @types/node
- tailwindcss@3, postcss, autoprefixer
- framer-motion
- lucide-react
- clsx, tailwind-merge

## Dev Server

```bash
cd /Users/emile/Documents/swapper-tendance-token/front
export PATH="/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
npm run dev -- -p 3001
```

**Port 3000 is occupied** on this machine — always use port 3001.

Open http://localhost:3001

## Build

```bash
npm run build
```

## Config Files
- `tailwind.config.ts` — Custom colors, animations, fonts
- `postcss.config.mjs` — Standard Tailwind + autoprefixer
- `next.config.js` — Image remote patterns (raw.githubusercontent.com)
- `tsconfig.json` — Path alias `@/*` → `./*`

## Logo
- User's custom logo at `front/public/logo.png`
- Purple-pink-gold gradient lightning bolt design
