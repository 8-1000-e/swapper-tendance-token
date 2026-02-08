'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import { SLIPPAGE_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface SlippagePopoverProps {
  slippage: number
  onSlippageChange: (value: number) => void
}

export default function SlippagePopover({ slippage, onSlippageChange }: SlippagePopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customValue, setCustomValue] = useState('')

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
      >
        <Settings size={14} />
        <span className="font-mono">{slippage}% slippage</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-8 right-0 z-50 glass p-3 min-w-[220px]">
            <p className="text-xs font-medium text-gray-400 mb-2">Max Slippage</p>
            <div className="flex gap-1.5 mb-2">
              {SLIPPAGE_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => {
                    onSlippageChange(opt)
                    setCustomValue('')
                  }}
                  className={cn(
                    'flex-1 px-2 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all',
                    slippage === opt && !customValue
                      ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                      : 'bg-bg-elevated text-gray-400 hover:text-white border border-border'
                  )}
                >
                  {opt}%
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Custom"
                value={customValue}
                onChange={e => {
                  const val = e.target.value
                  if (/^\d*\.?\d*$/.test(val)) {
                    setCustomValue(val)
                    const num = parseFloat(val)
                    if (!isNaN(num) && num > 0 && num <= 50) {
                      onSlippageChange(num)
                    }
                  }
                }}
                className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-purple/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
            </div>
            {slippage > 3 && (
              <p className="text-xs text-neon-yellow mt-2">High slippage — may result in losses</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
