'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Token } from '@/types'
import TokenHeader from '@/components/token/TokenHeader'
import PriceChart from '@/components/token/PriceChart'
import StatsGrid from '@/components/token/StatsGrid'
import TokenDescription from '@/components/token/TokenDescription'
import TransactionsTable from '@/components/token/TransactionsTable'
import MiniSwapWidget from '@/components/token/MiniSwapWidget'
import TopHolders from '@/components/token/TopHolders'

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

export default function TokenPage() {
  const params = useParams<{ address: string }>()
  const address = params.address

  const [token, setToken] = useState<Token | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`/api/token/${address}`)
        if (res.status === 404) {
          if (!cancelled) setError('Token not found')
          return
        }
        if (!res.ok) throw new Error(`${res.status}`)
        const data: Token = await res.json()
        if (!cancelled) setToken(data)
      } catch {
        if (!cancelled) setError('Failed to load token')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 30_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [address])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
      </div>
    )
  }

  if (error || !token) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="text-center py-20 text-gray-600 text-sm">{error || 'Token not found'}</div>
      </div>
    )
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 py-4"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-white transition-colors mb-4 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back
      </Link>

      <TokenHeader token={token} />

      <div className="mt-4">
        <StatsGrid token={token} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Chart — always first */}
        <div className="lg:col-span-2 order-1">
          <PriceChart token={token} />
        </div>

        {/* Swap widget — second on mobile, sidebar on desktop */}
        <div className="order-2 lg:order-3 lg:row-start-1 lg:col-start-3 lg:row-span-3">
          <div className="lg:sticky lg:top-20 space-y-4">
            <MiniSwapWidget token={token} />
            <TokenDescription token={token} />
            <TopHolders token={token} />
          </div>
        </div>

        {/* Transactions — after swap on mobile */}
        <div className="lg:col-span-2 order-3 lg:order-2">
          <TransactionsTable token={token} />
        </div>
      </div>
    </motion.div>
  )
}
