'use client'

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { TokenCategory } from '@/types'
import { getTokensByCategory } from '@/data/mock'
import CategoryTabs from './CategoryTabs'
import TokenCard from './TokenCard'

export default function TrendingSection() {
  const [category, setCategory] = useState<TokenCategory>('hot')
  const tokens = getTokensByCategory(category)

  return (
    <section className="w-full max-w-6xl mx-auto px-4 mt-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={24} className="text-neon-purple" />
          <h2 className="text-2xl font-bold">Trending</h2>
        </div>
        <CategoryTabs active={category} onChange={setCategory} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tokens.map((token, i) => (
          <TokenCard key={token.address} token={token} index={i} />
        ))}
      </div>

      {tokens.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No tokens in this category
        </div>
      )}
    </section>
  )
}
