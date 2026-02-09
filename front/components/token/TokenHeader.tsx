'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Globe, MessageCircle, ShieldCheck, ShieldAlert } from 'lucide-react'
import { Token } from '@/types'
import { formatPrice, formatPercent, formatNumber, formatAddress, cn } from '@/lib/utils'
import CopyButton from '@/components/ui/CopyButton'

interface TokenHeaderProps {
  token: Token
}

function timeAgoShort(ts: number): string {
  const days = Math.floor((Date.now() - ts) / 86400000)
  if (days < 1) return '<1d'
  if (days < 30) return `${days}d`
  if (days < 365) return `${Math.floor(days / 30)}mo`
  return `${(days / 365).toFixed(1)}y`
}

export default function TokenHeader({ token }: TokenHeaderProps) {
  const isPositive = token.change24h >= 0

  const links = [
    token.website && { label: 'Website', url: token.website, icon: Globe },
    token.twitter && {
      label: '𝕏',
      url: token.twitter.startsWith('http') ? token.twitter : `https://twitter.com/${token.twitter}`,
      icon: null,
    },
    token.telegram && {
      label: 'TG',
      url: token.telegram.startsWith('http') ? token.telegram : `https://t.me/${token.telegram}`,
      icon: MessageCircle,
    },
  ].filter(Boolean) as { label: string; url: string; icon: any }[]

  const inlineStats = [
    token.marketCap > 0 && { label: 'MCap', value: `$${formatNumber(token.marketCap)}` },
    token.fdv > 0 && { label: 'FDV', value: `$${formatNumber(token.fdv)}` },
    token.liquidity > 0 && { label: 'Liq', value: `$${formatNumber(token.liquidity)}` },
    token.volume24h > 0 && { label: 'Vol', value: `$${formatNumber(token.volume24h)}` },
    token.supply && token.supply > 0 && { label: 'Supply', value: formatNumber(token.supply) },
    token.pairCreatedAt && { label: 'Age', value: timeAgoShort(token.pairCreatedAt) },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="space-y-4">
      {/* Row 1: Identity + Price */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={token.imageUrl || `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${token.address}/logo.png`}
            alt={token.symbol}
            className="w-10 h-10 rounded-full flex-shrink-0"
            onError={e => {
              (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%231A1A28"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif">${token.symbol.slice(0, 2)}</text></svg>`
            }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold truncate">{token.name}</h1>
              <span className="text-sm text-gray-500 font-mono flex-shrink-0">{token.symbol}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span className="font-mono">{formatAddress(token.address)}</span>
              <CopyButton text={token.address} />
              {links.map(link => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
              {token.pairAddress && (
                <a
                  href={`https://dexscreener.com/solana/${token.pairAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-neon-purple transition-colors flex items-center gap-0.5"
                >
                  <ExternalLink size={10} />
                  DexS
                </a>
              )}
              {/* Security badges inline */}
              {token.mintAuthority !== undefined && (
                <span className={cn(
                  'flex items-center gap-0.5',
                  token.mintAuthority ? 'text-[#FFD700]' : 'text-[#00FF66]'
                )}>
                  {token.mintAuthority ? <ShieldAlert size={10} /> : <ShieldCheck size={10} />}
                  Mint {token.mintAuthority ? 'ON' : 'OFF'}
                </span>
              )}
              {token.freezeAuthority !== undefined && (
                <span className={cn(
                  'flex items-center gap-0.5',
                  token.freezeAuthority ? 'text-[#FFD700]' : 'text-[#00FF66]'
                )}>
                  {token.freezeAuthority ? <ShieldAlert size={10} /> : <ShieldCheck size={10} />}
                  Freeze {token.freezeAuthority ? 'ON' : 'OFF'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price + change */}
        <div className="flex items-baseline gap-3 flex-shrink-0">
          <motion.span
            key={token.price}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold font-mono"
          >
            {formatPrice(token.price)}
          </motion.span>
          <span className={cn(
            'text-sm font-mono font-semibold',
            isPositive ? 'text-[#00FF66]' : 'text-[#FF3B3B]'
          )}>
            {formatPercent(token.change24h)}
          </span>
          {token.priceNative && (
            <span className="text-xs text-gray-500 font-mono">
              {token.priceNative} SOL
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Inline stats strip — no cards, just data */}
      {inlineStats.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
          {inlineStats.map((stat, i) => (
            <span key={stat.label} className="flex items-center gap-1 flex-shrink-0">
              {i > 0 && <span className="text-gray-700 mx-1.5">·</span>}
              <span className="text-gray-500">{stat.label}</span>
              <span className="text-white font-mono font-medium">{stat.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
