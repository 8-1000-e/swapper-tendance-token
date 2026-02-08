'use client'

import SwapWidget from '@/components/swap/SwapWidget'
import TrendingSection from '@/components/trending/TrendingSection'

export default function SwapPage() {
  return (
    <div className="min-h-screen">
      {/* Hero - Swap Widget */}
      <section className="pt-12 pb-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            Swap <span className="gradient-degen-text">Instantly</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            The fastest way to swap Solana tokens. Powered by Jupiter Ultra.
          </p>
        </div>
        <SwapWidget />
      </section>

      {/* Trending Tokens */}
      <TrendingSection />
    </div>
  )
}
