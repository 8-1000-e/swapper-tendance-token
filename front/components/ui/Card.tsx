import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
  hover?: boolean
}

export default function Card({ children, className, glow, hover }: CardProps) {
  return (
    <div
      className={cn(
        'glass',
        glow && 'glow-purple',
        hover && 'hover:bg-bg-hover hover:border-border-bright transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
