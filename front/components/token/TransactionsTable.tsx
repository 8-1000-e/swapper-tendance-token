'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Token } from '@/types'
import { formatAddress, formatNumber, formatPrice, timeAgo, cn } from '@/lib/utils'

interface Trade {
  id: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  totalUsd: number
  wallet: string
  timestamp: number
}

interface TransactionsTableProps {
  token: Token
}

export default function TransactionsTable({ token }: TransactionsTableProps) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const prevIdsRef = useRef<Set<string>>(new Set())
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!token.pairAddress) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`/api/trades/${token.pairAddress}?t=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`${res.status}`)
        const data: Trade[] = await res.json()
        if (!cancelled) {
          const newIds = new Set<string>()
          data.forEach(t => {
            if (!prevIdsRef.current.has(t.id) && prevIdsRef.current.size > 0) {
              newIds.add(t.id)
            }
          })
          if (newIds.size > 0) {
            setFreshIds(newIds)
            setTimeout(() => setFreshIds(new Set()), 1500)
          }
          prevIdsRef.current = new Set(data.map(t => t.id))
          setTrades(data)
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 3_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [token.pairAddress])

  if (!token.pairAddress) return null

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-gray-500">Recent Trades</span>
        {!loading && trades.length > 0 && (
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#00FF66]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
        </div>
      ) : trades.length === 0 ? (
        <div className="text-center py-10 text-xs text-gray-600">No recent trades</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-border">
                <th className="text-left px-2 sm:px-4 py-2 font-medium w-12">Side</th>
                <th className="text-right px-2 sm:px-4 py-2 font-medium">Amount</th>
                <th className="text-right px-2 sm:px-4 py-2 font-medium hidden sm:table-cell">Price</th>
                <th className="text-right px-2 sm:px-4 py-2 font-medium">Total</th>
                <th className="text-right px-2 sm:px-4 py-2 font-medium hidden md:table-cell">Maker</th>
                <th className="text-right px-2 sm:px-4 py-2 font-medium w-14 sm:w-16">Age</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {trades.map(tx => {
                  const isFresh = freshIds.has(tx.id)
                  const isBuy = tx.type === 'buy'
                  return (
                    <motion.tr
                      key={tx.id}
                      initial={isFresh ? { opacity: 0, backgroundColor: isBuy ? 'rgba(0,255,102,0.06)' : 'rgba(255,59,59,0.06)' } : undefined}
                      animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0)' }}
                      transition={{ duration: 1 }}
                      className="border-b border-border/30 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-2 sm:px-4 py-2">
                        <span className={cn(
                          'font-mono font-semibold',
                          isBuy ? 'text-[#00FF66]' : 'text-[#FF3B3B]'
                        )}>
                          {isBuy ? 'BUY' : 'SELL'}
                        </span>
                      </td>
                      <td className="text-right px-2 sm:px-4 py-2 font-mono text-gray-300">
                        {formatNumber(tx.amount)}
                      </td>
                      <td className="text-right px-2 sm:px-4 py-2 font-mono text-gray-400 hidden sm:table-cell">
                        {formatPrice(tx.price)}
                      </td>
                      <td className="text-right px-2 sm:px-4 py-2 font-mono text-white">
                        ${formatNumber(tx.totalUsd)}
                      </td>
                      <td className="text-right px-2 sm:px-4 py-2 font-mono hidden md:table-cell">
                        <a
                          href={`https://solscan.io/account/${tx.wallet}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-white transition-colors"
                        >
                          {formatAddress(tx.wallet)}
                        </a>
                      </td>
                      <td className="text-right px-2 sm:px-4 py-2 text-gray-600">
                        {timeAgo(tx.timestamp)}
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
