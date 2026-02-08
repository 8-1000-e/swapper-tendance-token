'use client'

import { TokenCategory } from '@/types'
import { CATEGORY_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface CategoryTabsProps {
  active: TokenCategory
  onChange: (category: TokenCategory) => void
}

const categories: TokenCategory[] = ['hot', 'new', 'gainer', 'loser']

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {categories.map(cat => {
        const { label } = CATEGORY_LABELS[cat]
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all',
              active === cat
                ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/30'
                : 'bg-bg-elevated text-gray-400 hover:text-white border border-border hover:border-border-bright'
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
