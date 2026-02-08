'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { Token } from '@/types'
import { formatPrice, formatPercent, formatAddress, getTokenImageUrl, cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import CopyButton from '@/components/ui/CopyButton'

interface TokenHeaderProps {
  token: Token
}

export default function TokenHeader({ token }: TokenHeaderProps) {
  const isPositive = token.change24h >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center gap-4"
    >
      <img
        src={getTokenImageUrl(token.address)}
        alt={token.symbol}
        className="w-14 h-14 rounded-full"
        onError={e => {
          (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><circle cx="28" cy="28" r="28" fill="%231A1A28"/><text x="28" y="36" text-anchor="middle" fill="white" font-size="20" font-family="sans-serif">${token.symbol.slice(0, 2)}</text></svg>`
        }}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold">{token.name}</h1>
          <Badge variant="purple">{token.symbol}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span className="font-mono">{formatAddress(token.address)}</span>
          <CopyButton text={token.address} />
        </div>
      </div>
      <div className="text-left sm:text-right">
        <div className="text-3xl font-bold font-mono">
          {formatPrice(token.price)}
        </div>
        <span
          className={cn(
            'inline-block text-lg font-mono font-bold mt-1 px-2 py-0.5 rounded',
            isPositive
              ? 'text-[#00FF66] bg-[#00FF66]/15'
              : 'text-[#FF3B3B] bg-[#FF3B3B]/15'
          )}
        >
          {formatPercent(token.change24h)}
        </span>
      </div>
    </motion.div>
  )
}
