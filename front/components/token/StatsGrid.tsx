import { Token } from '@/types'
import { formatNumber } from '@/lib/utils'
import { BarChart3, DollarSign, Users, Droplets, Layers, TrendingUp } from 'lucide-react'

interface StatsGridProps {
  token: Token
}

const statConfig = [
  { key: 'marketCap', label: 'Market Cap', format: (v: number) => `$${formatNumber(v)}`, icon: BarChart3 },
  { key: 'fdv', label: 'Fully Diluted', format: (v: number) => `$${formatNumber(v)}`, icon: Layers },
  { key: 'volume24h', label: 'Volume 24h', format: (v: number) => `$${formatNumber(v)}`, icon: TrendingUp },
  { key: 'liquidity', label: 'Liquidity', format: (v: number) => `$${formatNumber(v)}`, icon: Droplets },
  { key: 'holders', label: 'Holders', format: (v: number) => formatNumber(v), icon: Users },
  { key: 'supply', label: 'Total Supply', format: (v: number) => formatNumber(v), icon: DollarSign },
] as const

export default function StatsGrid({ token }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {statConfig.map(({ key, label, format, icon: Icon }) => (
        <div
          key={key}
          className="bg-bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-4 hover:border-border-bright transition-all"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Icon size={13} className="text-neon-purple" />
            <span className="text-xs text-gray-500 font-medium">{label}</span>
          </div>
          <div className="text-base font-mono font-bold text-white">
            {format(token[key])}
          </div>
        </div>
      ))}
    </div>
  )
}
