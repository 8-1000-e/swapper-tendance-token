'use client'

import { useState } from 'react'
import { ArrowDownUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SwapDirectionButtonProps {
  onClick: () => void
}

export default function SwapDirectionButton({ onClick }: SwapDirectionButtonProps) {
  const [isFlipping, setIsFlipping] = useState(false)

  const handleClick = () => {
    setIsFlipping(true)
    onClick()
    setTimeout(() => setIsFlipping(false), 500)
  }

  return (
    <div className="flex justify-center -my-2 relative z-10">
      <button
        onClick={handleClick}
        className={cn(
          'w-10 h-10 rounded-xl bg-bg-surface border-4 border-bg-primary flex items-center justify-center hover:bg-neon-purple/20 hover:border-neon-purple/30 transition-all duration-200 group',
          isFlipping && 'animate-flip'
        )}
      >
        <ArrowDownUp
          size={16}
          className="text-neon-purple group-hover:text-neon-pink transition-colors"
        />
      </button>
    </div>
  )
}
