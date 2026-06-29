import React from 'react'
import { cn } from '@/utils/cn'
import { AlertTriangle } from 'lucide-react'
import { AI_DISCLAIMER } from '@/types/enums'

interface AIDisclaimerBannerProps {
  className?: string
}

export function AIDisclaimerBanner({ className }: AIDisclaimerBannerProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 bg-[var(--color-warning-bg)] border border-[#FDE68A] text-[var(--color-warning)] p-3 rounded-md shadow-sm',
      className
    )}>
      <AlertTriangle size={18} className="shrink-0" />
      <span className="text-sm font-medium">{AI_DISCLAIMER}</span>
    </div>
  )
}
