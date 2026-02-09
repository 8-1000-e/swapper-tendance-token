'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { formatPrice, formatPercent, cn } from '@/lib/utils'

const WalletButton = dynamic(
  () => import('@/components/wallet/WalletButton'),
  { ssr: false }
)

interface SearchResult {
  address: string
  symbol: string
  name: string
  price: number
  change24h: number
  imageUrl: string | null
}

export default function Navbar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [popular, setPopular] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [popularLoaded, setPopularLoaded] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleLogoTap = useCallback((e: React.MouseEvent) => {
    if (window.innerWidth >= 768) return
    tapCountRef.current++
    if (tapCountRef.current >= 3) {
      e.preventDefault()
      tapCountRef.current = 0
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current)
      window.location.href = window.location.pathname + '?_=' + Date.now()
      return
    }
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current)
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0 }, 600)
  }, [])

  // Load popular tokens once
  useEffect(() => {
    if (popularLoaded) return
    async function load() {
      try {
        const res = await fetch('/api/popular')
        if (!res.ok) return
        const data: SearchResult[] = await res.json()
        setPopular(data)
        setPopularLoaded(true)
      } catch { /* silent */ }
    }
    load()
  }, [popularLoaded])

  // Live search
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

  const hasQuery = query.trim().length >= 2
  const displayTokens = hasQuery ? results : popular
  const showDropdown = focused && (hasQuery || popular.length > 0)

  function TokenRow({ token }: { token: SearchResult }) {
    return (
      <button
        key={token.address}
        onMouseDown={() => {
          router.push(`/token/${token.address}`)
          setQuery('')
          setFocused(false)
        }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-hover transition-colors text-left"
      >
        <img
          src={token.imageUrl || `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%2312121A"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="16">${token.symbol.slice(0, 2)}</text></svg>`}
          alt={token.symbol}
          className="w-7 h-7 rounded-full"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm">{token.symbol}</span>
          <span className="text-xs text-gray-500 ml-2 truncate">{token.name}</span>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-mono text-gray-300">{formatPrice(token.price)}</div>
          <div className={cn(
            'text-[10px] font-mono font-semibold',
            token.change24h >= 0 ? 'text-[#00FF66]' : 'text-[#FF3B3B]'
          )}>
            {formatPercent(token.change24h)}
          </div>
        </div>
      </button>
    )
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-bg-primary/80 backdrop-blur-xl">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center gap-3 md:gap-4">
        {/* Left — logo + nav links */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-2 group" onClick={handleLogoTap}>
            <Image src="/logo.png" alt="TendanceSwap" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-bold hidden sm:flex items-baseline overflow-hidden">
              <span className="gradient-degen-text">T</span>
              <span className="gradient-degen-text max-w-0 group-hover:max-w-[200px] transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap">endance</span>
              <span className="gradient-degen-text">S</span>
              <span className="gradient-degen-text max-w-0 group-hover:max-w-[200px] transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap">wap</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
            >
              Swap
            </Link>
            <span className="text-sm text-gray-600 cursor-not-allowed">
              Portfolio
            </span>
          </div>
        </div>

        {/* Center — search bar */}
        <div className="flex-1 min-w-0 md:max-w-md md:mx-auto">
          <div className="relative">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 200)}
                className="w-full bg-bg-elevated border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-purple/50 transition-colors"
              />
              {loading && (
                <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-500" />
              )}
            </div>
            {showDropdown && (
              <div className="absolute top-full mt-2 w-full glass p-1 z-50 max-h-[400px] overflow-y-auto">
                {!hasQuery && popular.length > 0 && (
                  <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-gray-600">
                    Popular tokens
                  </div>
                )}
                {loading && hasQuery && displayTokens.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    <Loader2 size={16} className="inline animate-spin mr-2" />
                    Searching...
                  </div>
                ) : displayTokens.length > 0 ? (
                  displayTokens.map(token => (
                    <TokenRow key={token.address} token={token} />
                  ))
                ) : hasQuery ? (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">No results</div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Right — connect wallet */}
        <div className="shrink-0">
          <WalletButton />
        </div>
      </div>
    </nav>
  )
}
