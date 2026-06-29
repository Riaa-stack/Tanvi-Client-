import React from 'react'

export function ContentArea({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto bg-surface-page">
      <div className="max-w-[var(--content-max-width)] mx-auto w-full">
        {children}
      </div>
    </main>
  )
}
