import { Route } from 'lucide-react'
import { RoutePlan } from '@/lib/api'

interface RouteInfoProps {
  routePlan: RoutePlan[]
}

export default function RouteInfo({ routePlan }: RouteInfoProps) {
  if (!routePlan || routePlan.length === 0) return null

  const labels = routePlan.map(r => r.swapInfo.label)

  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5 text-gray-500">
        <Route size={12} />
        <span>Route</span>
      </div>
      <div className="flex items-center gap-1 font-mono text-gray-400">
        {labels.map((label, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="text-white">{label}</span>
            {i < labels.length - 1 && <span className="text-gray-600">→</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
