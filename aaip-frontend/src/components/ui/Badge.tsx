import React from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'subject'
  subjectColorId?: number
}

export function Badge({ className, variant = 'default', subjectColorId, children, ...props }: BadgeProps) {
  
  const getSubjectColor = () => {
    if (!subjectColorId) return ''
    const colors = [
      'bg-[var(--subject-1)] text-white',
      'bg-[var(--subject-2)] text-white',
      'bg-[var(--subject-3)] text-white',
      'bg-[var(--subject-4)] text-white',
      'bg-[var(--subject-5)] text-white',
      'bg-[var(--subject-6)] text-white',
      'bg-[var(--subject-7)] text-white',
      'bg-[var(--subject-8)] text-white',
    ]
    return colors[(subjectColorId - 1) % colors.length]
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--badge-radius)] px-[8px] h-[var(--badge-height)] text-[var(--badge-font-size)] font-[var(--badge-font-weight)]',
        {
          'bg-surface-sunken text-secondary border border-default': variant === 'default',
          'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[#C6E6D6]': variant === 'success',
          'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[#FDE68A]': variant === 'warning',
          'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[#F9C3BE]': variant === 'danger',
          'bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[#BCE0F5]': variant === 'info',
        },
        variant === 'subject' && getSubjectColor(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
