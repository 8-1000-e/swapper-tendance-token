'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import { searchTokens } from '@/data/mock'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
)
import { getTokenImageUrl } from '@/lib/utils'

export default function Navbar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  const results = query.trim() ? searchTokens(query).slice(0, 6) : []
  const showDropdown = focused && query.trim().length > 0

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-bg-primary/80 backdrop-blur-xl">
      <div className="w-full px-6 h-16 flex items-center">
        {/* Left — logo + nav links */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo.png" alt="TendanceSwap" width={36} height={36} className="rounded-lg" />
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

        {/* Center — search bar, absolute positioned for true center */}
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-4">
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
            </div>
            {showDropdown && (
              <div className="absolute top-full mt-2 w-full glass p-1 z-50">
                {results.length > 0 ? results.map(token => (
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
                      src={getTokenImageUrl(token.address)}
                      alt={token.symbol}
                      className="w-7 h-7 rounded-full"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm">{token.symbol}</span>
                      <span className="text-xs text-gray-500 ml-2">{token.name}</span>
                    </div>
                  </button>
                )) : (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">No results</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right — connect wallet */}
        <div className="ml-auto shrink-0">
          <WalletMultiButton className="!bg-bg-elevated !border !border-border !rounded-xl !h-10 !px-4 !text-sm !font-medium hover:!border-neon-purple/50 !transition-colors" />
        </div>
      </div>
    </nav>
  )
}
