'use client'

import { motion } from 'framer-motion'
import { Token } from '@/types'
import { formatNumber, formatAddress } from '@/lib/utils'

interface TopHoldersProps {
  token: Token
}

export default function TopHolders({ token }: TopHoldersProps) {
  if (!token.topHolders || token.topHolders.length === 0) return null

  const maxPct = token.topHolders[0].percentage

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <span className="text-[10px] uppercase tracking-wider text-gray-500">Top Holders</span>
      </div>
      <div className="divide-y divide-border/50">
        {token.topHolders.map((holder, i) => (
          <div key={holder.address} className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
            <span className="text-[10px] text-gray-600 font-mono w-4 text-right tabular-nums">
              {i + 1}
            </span>

            {/* Bar + address stacked */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <a
                  href={`https://solscan.io/account/${holder.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-gray-400 hover:text-white transition-colors"
                >
                  {formatAddress(holder.address)}
                </a>
                <div className="flex items-center gap-3 text-right">
                  <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">
                    {formatNumber(holder.amount)}
                  </span>
                  <span className="text-xs font-mono font-semibold text-white tabular-nums w-14 text-right">
                    {holder.percentage < 0.01 ? '<0.01' : holder.percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-neon-purple/40"
                  initial={{ width: 0 }}
                  animate={{ width: `${maxPct > 0 ? (holder.percentage / maxPct) * 100 : 0}%` }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' as const }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
