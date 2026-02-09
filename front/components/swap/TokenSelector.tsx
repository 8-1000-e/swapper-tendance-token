'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { Token } from '@/types'
import { formatPrice, formatPercent, cn } from '@/lib/utils'

interface TokenSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (token: Token) => void
  excludeToken?: Token | null
}

interface SearchResult {
  address: string
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  fdv: number
  liquidity: number
  imageUrl: string | null
}

function resultToToken(r: SearchResult): Token {
  return {
    address: r.address,
    symbol: r.symbol,
    name: r.name,
    price: r.price,
    change24h: r.change24h,
    volume24h: r.volume24h,
    marketCap: r.marketCap,
    fdv: r.fdv,
    liquidity: r.liquidity,
    imageUrl: r.imageUrl ?? undefined,
  }
}

export default function TokenSelector({ isOpen, onClose, onSelect, excludeToken }: TokenSelectorProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [popular, setPopular] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [popularLoaded, setPopularLoaded] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Load popular tokens on first open
  useEffect(() => {
    if (!isOpen || popularLoaded) return

    async function loadPopular() {
      try {
        const res = await fetch('/api/popular')
        if (!res.ok) return
        const data: SearchResult[] = await res.json()
        setPopular(data)
        setPopularLoaded(true)
      } catch {
        // silent
      }
    }
    loadPopular()
  }, [isOpen, popularLoaded])

  // Search tokens
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)

    const timeout = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error()
        const data: SearchResult[] = await res.json()
        if (!controller.signal.aborted) {
          setResults(data)
          setLoading(false)
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([])
          setLoading(false)
        }
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  const tokens = query.trim().length >= 2
    ? results.filter(t => t.address !== excludeToken?.address)
    : popular.filter(t => t.address !== excludeToken?.address)

  const handleSelect = (r: SearchResult) => {
    onSelect(resultToToken(r))
    onClose()
    setQuery('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select a token">
      <div className="p-4">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or symbol..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-bg-elevated border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-purple/50 transition-colors"
            autoFocus
          />
          {loading && (
            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-500" />
          )}
        </div>

        {!query.trim() && popular.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Popular tokens</p>
            <div className="flex flex-wrap gap-2">
              {popular.filter(t => t.address !== excludeToken?.address).map(token => (
                <button
                  key={token.address}
                  onClick={() => handleSelect(token)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated hover:bg-bg-hover border border-border hover:border-border-bright transition-all text-sm"
                >
                  <img
                    src={token.imageUrl || `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%2312121A"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="16">${token.symbol[0]}</text></svg>`}
                    alt={token.symbol}
                    className="w-5 h-5 rounded-full"
                    onError={e => { (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%2312121A"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="16">${token.symbol[0]}</text></svg>` }}
                  />
                  <span className="font-medium">{token.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1 max-h-[340px] overflow-y-auto">
          {loading && tokens.length === 0 && query.trim().length >= 2 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <Loader2 size={16} className="inline animate-spin mr-2" />
              Searching...
            </div>
          ) : tokens.length > 0 ? (
            tokens.map(token => (
              <button
                key={token.address}
                onClick={() => handleSelect(token)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-hover transition-colors text-left"
              >
                <img
                  src={token.imageUrl || `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%2312121A"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="16">${token.symbol[0]}</text></svg>`}
                  alt={token.symbol}
                  className="w-9 h-9 rounded-full"
                  onError={e => { (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%2312121A"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="16">${token.symbol[0]}</text></svg>` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{token.symbol}</span>
                    <span className="text-xs text-gray-500 truncate">{token.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {formatPrice(token.price)}
                  </div>
                </div>
                <span
                  className={cn(
                    'text-xs font-mono font-semibold',
                    token.change24h >= 0 ? 'text-neon-green' : 'text-red-400'
                  )}
                >
                  {formatPercent(token.change24h)}
                </span>
              </button>
            ))
          ) : query.trim().length >= 2 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No tokens found
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}
