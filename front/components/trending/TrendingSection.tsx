'use client'

import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, Loader2 } from 'lucide-react'
import { TokenCategory, TrendingToken } from '@/types'
import CategoryTabs from './CategoryTabs'
import TokenCard from './TokenCard'

function SkeletonCard() {
  return (
    <div className="glass-hover p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-white/5" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-16 bg-white/5 rounded" />
          <div className="h-3 w-20 bg-white/5 rounded" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-16 bg-white/5 rounded" />
          <div className="h-5 w-14 bg-white/5 rounded" />
        </div>
        <div className="w-20 h-8 bg-white/5 rounded" />
      </div>
    </div>
  )
}

export default function TrendingSection() {
  const [tokens, setTokens] = useState<TrendingToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<TokenCategory>('hot')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/trending')
        if (!res.ok) throw new Error(`${res.status}`)
        const data: TrendingToken[] = await res.json()
        if (!cancelled) {
          setTokens(data)
          setError(null)
        }
      } catch {
        if (!cancelled) setError('Failed to load trending tokens')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    switch (category) {
      case 'hot':
        return [...tokens].sort((a, b) => b.boostAmount - a.boostAmount)
      case 'gainer':
        return tokens.filter(t => t.change24h > 0).sort((a, b) => b.change24h - a.change24h)
      case 'loser':
        return tokens.filter(t => t.change24h < 0).sort((a, b) => a.change24h - b.change24h)
      case 'new':
        return [...tokens]
          .filter(t => t.pairCreatedAt !== null)
          .sort((a, b) => (b.pairCreatedAt ?? 0) - (a.pairCreatedAt ?? 0))
    }
  }, [tokens, category])

  return (
    <section className="w-full max-w-6xl mx-auto px-4 mt-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={24} className="text-neon-purple" />
          <h2 className="text-2xl font-bold">Trending</h2>
        </div>
        <CategoryTabs active={category} onChange={setCategory} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-gray-500">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No tokens in this category
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((token, i) => (
            <TokenCard key={token.address} token={token} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}
