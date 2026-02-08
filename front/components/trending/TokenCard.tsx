'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Token } from '@/types'
import { formatPrice, formatPercent, formatCompactNumber, getTokenImageUrl, cn } from '@/lib/utils'
import SparklineChart from './SparklineChart'

interface TokenCardProps {
  token: Token
  index: number
}

export default function TokenCard({ token, index }: TokenCardProps) {
  const isPositive = token.change24h >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/token/${token.address}`}>
        <div className="glass-hover p-4 group">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={getTokenImageUrl(token.address)}
              alt={token.symbol}
              className="w-9 h-9 rounded-full"
              onError={e => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%231A1A28"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif">${token.symbol.slice(0, 2)}</text></svg>`
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm group-hover:text-neon-purple transition-colors">
                  {token.symbol}
                </span>
                <span className="text-xs text-gray-500 truncate">{token.name}</span>
              </div>
              <div className="text-xs text-gray-500 font-mono">
                Vol ${formatCompactNumber(token.volume24h)}
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="font-mono font-semibold text-sm">
                {formatPrice(token.price)}
              </div>
              <span
                className={cn(
                  'inline-block text-xs font-mono font-bold mt-1 px-1.5 py-0.5 rounded',
                  isPositive
                    ? 'text-[#00FF66] bg-[#00FF66]/15'
                    : 'text-[#FF3B3B] bg-[#FF3B3B]/15'
                )}
              >
                {formatPercent(token.change24h)}
              </span>
            </div>
            <SparklineChart
              data={token.sparkline}
              positive={isPositive}
              width={80}
              height={32}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
