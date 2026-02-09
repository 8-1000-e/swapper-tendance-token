'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Token } from '@/types'

interface PriceChartProps {
  token: Token
}

export default function PriceChart({ token }: PriceChartProps) {
  const [loading, setLoading] = useState(true)

  if (!token.pairAddress) {
    return (
      <div className="border border-border rounded-xl">
        <div className="flex items-center justify-center h-[600px] text-xs text-gray-600">
          No chart data available
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden relative">
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center z-10 bg-[#0A0A0F]"
          >
            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
          </motion.div>
        )}
      </AnimatePresence>
      <iframe
        src={`https://dexscreener.com/solana/${token.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
        className="w-full border-0"
        style={{ height: 600 }}
        onLoad={() => setLoading(false)}
        title={`${token.symbol} chart`}
        allow="clipboard-write"
      />
    </div>
  )
}
