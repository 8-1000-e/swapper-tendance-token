'use client'

import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getTokenByAddress } from '@/data/mock'
import TokenHeader from '@/components/token/TokenHeader'
import PriceChart from '@/components/token/PriceChart'
import StatsGrid from '@/components/token/StatsGrid'
import TokenDescription from '@/components/token/TokenDescription'
import TransactionsTable from '@/components/token/TransactionsTable'
import MiniSwapWidget from '@/components/token/MiniSwapWidget'

export default function TokenPage({ params }: { params: { address: string } }) {
  const { address } = params
  const token = getTokenByAddress(address)

  if (!token) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        <span>Back to swap</span>
      </Link>

      <TokenHeader token={token} />

      {/* Stats — full width, prominent */}
      <div className="mt-6">
        <StatsGrid token={token} />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <PriceChart token={token} />
          <TokenDescription token={token} />
          <TransactionsTable token={token} />
        </div>

        <div className="space-y-6">
          <div className="lg:sticky lg:top-24">
            <MiniSwapWidget token={token} />
          </div>
        </div>
      </div>
    </div>
  )
}
