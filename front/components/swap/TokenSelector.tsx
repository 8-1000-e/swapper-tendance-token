'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { Token } from '@/types'
import { MOCK_TOKENS, searchTokens } from '@/data/mock'
import { formatPrice, formatPercent, getTokenImageUrl, cn } from '@/lib/utils'

interface TokenSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (token: Token) => void
  excludeToken?: Token | null
}

export default function TokenSelector({ isOpen, onClose, onSelect, excludeToken }: TokenSelectorProps) {
  const [query, setQuery] = useState('')

  const tokens = query.trim()
    ? searchTokens(query).filter(t => t.address !== excludeToken?.address)
    : MOCK_TOKENS.filter(t => t.address !== excludeToken?.address)

  const popular = MOCK_TOKENS.filter(t =>
    ['SOL', 'USDC', 'BONK', 'JUP', 'WIF', 'RAY'].includes(t.symbol)
  )

  const handleSelect = (token: Token) => {
    onSelect(token)
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
        </div>

        {!query && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Popular tokens</p>
            <div className="flex flex-wrap gap-2">
              {popular.map(token => (
                <button
                  key={token.address}
                  onClick={() => handleSelect(token)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated hover:bg-bg-hover border border-border hover:border-border-bright transition-all text-sm"
                >
                  <img
                    src={getTokenImageUrl(token.address)}
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
          {tokens.map(token => (
            <button
              key={token.address}
              onClick={() => handleSelect(token)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-hover transition-colors text-left"
            >
              <img
                src={getTokenImageUrl(token.address)}
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
          ))}
          {tokens.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No tokens found
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
