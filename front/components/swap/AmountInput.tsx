'use client'

import { Token } from '@/types'
import { formatPrice, getTokenImageUrl, cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface AmountInputProps {
  label: string
  token: Token | null
  amount: string
  onAmountChange?: (value: string) => void
  onTokenClick: () => void
  readOnly?: boolean
  usdValue?: number
  balance?: number | null
  onMaxClick?: () => void
}

export default function AmountInput({
  label,
  token,
  amount,
  onAmountChange,
  onTokenClick,
  readOnly = false,
  usdValue,
  balance,
  onMaxClick,
}: AmountInputProps) {
  return (
    <div className="bg-bg-elevated rounded-xl p-4 border border-border hover:border-border-bright transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        {token && (
          <span className="text-xs text-gray-500 font-mono flex items-center gap-1.5">
            Balance: {balance != null
              ? balance.toLocaleString(undefined, { maximumFractionDigits: 6 })
              : '–'}
            {onMaxClick && balance != null && balance > 0 && (
              <button
                onClick={onMaxClick}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 transition-colors"
              >
                MAX
              </button>
            )}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={e => {
            const val = e.target.value
            if (/^\d*\.?\d*$/.test(val)) {
              onAmountChange?.(val)
            }
          }}
          readOnly={readOnly}
          className={cn(
            'flex-1 bg-transparent text-2xl font-mono font-semibold text-white placeholder:text-gray-700 focus:outline-none min-w-0',
            readOnly && 'cursor-default text-gray-300'
          )}
        />
        <button
          onClick={onTokenClick}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-surface hover:bg-bg-hover border border-border hover:border-border-bright transition-all shrink-0"
        >
          {token ? (
            <>
              <img
                src={getTokenImageUrl(token.address)}
                alt={token.symbol}
                className="w-6 h-6 rounded-full"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <span className="font-semibold text-sm">{token.symbol}</span>
            </>
          ) : (
            <span className="text-sm text-gray-400">Select</span>
          )}
          <ChevronDown size={14} className="text-gray-500" />
        </button>
      </div>
      {usdValue !== undefined && usdValue > 0 && (
        <div className="mt-1.5 text-xs text-gray-500 font-mono">
          ≈ {formatPrice(usdValue)}
        </div>
      )}
    </div>
  )
}
