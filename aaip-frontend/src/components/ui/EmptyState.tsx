import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-default rounded-md bg-surface-card">
      <div className="p-3 bg-surface-sunken rounded-full text-muted mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-medium text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-secondary mb-4 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
