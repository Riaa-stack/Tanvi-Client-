import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Ghost } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-page flex flex-col items-center justify-center p-6 text-center">
      <Ghost size={64} className="text-muted mb-6" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-xl text-secondary mb-8">Page not found</p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  )
}