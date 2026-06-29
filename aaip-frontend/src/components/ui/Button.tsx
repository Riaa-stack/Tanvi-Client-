import React from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-ring disabled:opacity-50 disabled:pointer-events-none',
          {
            // Variants
            'bg-brand-primary text-text-on-brand hover:bg-brand-secondary': variant === 'primary',
            'bg-surface-elevated text-primary border border-default hover:bg-surface-sunken': variant === 'secondary',
            'bg-danger text-text-on-brand hover:bg-red-700': variant === 'danger',
            'bg-transparent text-primary hover:bg-surface-sunken': variant === 'ghost',
            'bg-transparent text-brand-primary border border-brand-primary hover:bg-brand-accent': variant === 'outline',
            
            // Sizes
            'h-[var(--btn-height-sm)] px-3 text-sm': size === 'sm',
            'h-[var(--btn-height-md)] px-4 py-2': size === 'md',
            'h-[var(--btn-height-lg)] px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
