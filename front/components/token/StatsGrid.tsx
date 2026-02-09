'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Token } from '@/types'
import { formatNumber, formatPercent, cn } from '@/lib/utils'

interface StatsGridProps {
  token: Token
}

export default function StatsGrid({ token }: StatsGridProps) {
  const [txnTf, setTxnTf] = useState<'5m' | '1h' | '6h' | '24h'>('24h')

  const changes = [
    { label: '5min', val: token.change5m },
    { label: '1h', val: token.change1h },
    { label: '6h', val: token.change6h },
    { label: '1d', val: token.change24h },
  ]

  const volumes = [
    { label: '5min', val: token.volume5m },
    { label: '1h', val: token.volume1h },
    { label: '6h', val: token.volume6h },
    { label: '1d', val: token.volume24h },
  ].filter(v => v.val && v.val > 0) as { label: string; val: number }[]

  const maxVol = Math.max(...volumes.map(v => v.val), 1)

  const txnMap = { '5m': token.txns5m, '1h': token.txns1h, '6h': token.txns6h, '24h': token.txns24h }
  const txns = txnMap[txnTf]

  const hasChanges = changes.some(c => c.val !== undefined)
  const hasVolumes = volumes.length > 0
  const hasTxns = !!token.txns24h

  if (!hasChanges && !hasVolumes && !hasTxns) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

      {/* Price Change — colored chips */}
      {hasChanges && (
        <div className="border border-border rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-4">Price Change</div>
          <div className="grid grid-cols-2 gap-2">
            {changes.map(({ label, val }) => {
              const pos = val !== undefined && val >= 0
              const neg = val !== undefined && val < 0
              return (
                <div
                  key={label}
                  className={cn(
                    'rounded-lg px-3 py-2.5',
                    pos && 'bg-[#00FF66]/[0.06]',
                    neg && 'bg-[#FF3B3B]/[0.06]',
                    val === undefined && 'bg-white/[0.02]'
                  )}
                >
                  <div className="text-[10px] text-gray-500 mb-1">{label}</div>
                  {val !== undefined ? (
                    <div className={cn(
                      'text-base font-mono font-bold',
                      pos ? 'text-[#00FF66]' : 'text-[#FF3B3B]'
                    )}>
                      {formatPercent(val)}
                    </div>
                  ) : (
                    <div className="text-base text-gray-700 font-mono">—</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Volume — horizontal bars with labels inside */}
      {hasVolumes && (
        <div className="border border-border rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-4">Volume</div>
          <div className="space-y-2.5">
            {volumes.map(({ label, val }) => {
              const pct = (val / maxVol) * 100
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500 font-mono">{label}</span>
                    <span className="text-xs font-mono font-semibold text-white">${formatNumber(val)}</span>
                  </div>
                  <div className="h-2.5 rounded bg-white/[0.04] overflow-hidden">
                    <motion.div
                      className="h-full rounded bg-neon-purple/40"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' as const }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Transactions — big number + ratio */}
      {hasTxns && (
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-wider text-gray-500">Transactions</span>
            <div className="flex bg-white/[0.04] rounded-md p-0.5">
              {([
                { key: '5m' as const, label: '5min' },
                { key: '1h' as const, label: '1h' },
                { key: '6h' as const, label: '6h' },
                { key: '24h' as const, label: '1d' },
              ]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTxnTf(key)}
                  className={cn(
                    'text-[10px] px-2 py-1 rounded transition-all font-mono',
                    txnTf === key
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-400'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {txns ? (
            <motion.div
              key={txnTf}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <div className="text-2xl font-mono font-bold text-white mb-3">
                {formatNumber(txns.buys + txns.sells)}
              </div>

              {/* Buy/Sell ratio bar */}
              {(txns.buys + txns.sells) > 0 && (
                <div>
                  <div className="flex h-3 rounded overflow-hidden gap-0.5 mb-2">
                    <motion.div
                      className="bg-[#00FF66] rounded-l"
                      initial={{ width: 0 }}
                      animate={{ width: `${(txns.buys / (txns.buys + txns.sells)) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' as const }}
                    />
                    <div className="bg-[#FF3B3B] rounded-r flex-1" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#00FF66]">{formatNumber(txns.buys)} buys</span>
                    <span className="text-[#FF3B3B]">{formatNumber(txns.sells)} sells</span>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-sm text-gray-700 font-mono">—</div>
          )}
        </div>
      )}
    </div>
  )
}
