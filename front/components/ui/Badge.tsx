import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'green' | 'red' | 'purple' | 'yellow'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-semibold',
        {
          'bg-border text-gray-300': variant === 'default',
          'bg-neon-green/10 text-neon-green': variant === 'green',
          'bg-red-500/10 text-red-400': variant === 'red',
          'bg-neon-purple/10 text-neon-purple': variant === 'purple',
          'bg-neon-yellow/10 text-neon-yellow': variant === 'yellow',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
