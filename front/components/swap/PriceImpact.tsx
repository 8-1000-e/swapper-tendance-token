import { cn } from '@/lib/utils'

interface PriceImpactProps {
  impact: number
}

export default function PriceImpact({ impact }: PriceImpactProps) {
  if (impact === 0) return null

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">Price Impact</span>
      <span
        className={cn(
          'font-mono font-semibold',
          impact < 1 ? 'text-neon-green' : impact < 3 ? 'text-neon-yellow' : 'text-red-400'
        )}
      >
        {impact < 0.01 ? '<0.01' : impact.toFixed(2)}%
      </span>
    </div>
  )
}
