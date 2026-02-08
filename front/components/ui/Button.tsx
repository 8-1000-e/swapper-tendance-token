'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'degen'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-purple/50 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-neon-purple hover:bg-neon-purple/80 text-white': variant === 'primary',
            'bg-bg-elevated hover:bg-bg-hover text-white border border-border': variant === 'secondary',
            'bg-transparent hover:bg-bg-hover text-gray-400 hover:text-white': variant === 'ghost',
            'gradient-degen text-white font-bold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]': variant === 'degen',
          },
          {
            'px-3 py-1.5 text-sm gap-1.5': size === 'sm',
            'px-4 py-2.5 text-sm gap-2': size === 'md',
            'px-6 py-3.5 text-base gap-2': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
