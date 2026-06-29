import React from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuth } from '@/hooks/useAuth'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/ui/Button'
import { User as UserIcon } from 'lucide-react'

export default function ProfilePage() {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Profile Settings" />

      <div className="card-base space-y-6">
        <div className="flex items-center gap-4 border-b border-default pb-6">
          <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.full_name?.charAt(0).toUpperCase() || <UserIcon size={32} />}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.full_name}</h2>
            <p className="text-secondary">{user?.email}</p>
            <div className="mt-1 inline-block bg-surface-sunken text-muted text-xs px-2 py-0.5 rounded capitalize font-medium">
              {user?.role.replace('_', ' ')}
            </div>
          </div>
        </div>

        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <FormField label="Current Password">
            <input type="password" placeholder="••••••••" className="h-[var(--input-height)] px-3 rounded-[var(--input-radius)] border border-default bg-[var(--input-bg)] focus-ring" />
          </FormField>
          <FormField label="New Password">
            <input type="password" placeholder="••••••••" className="h-[var(--input-height)] px-3 rounded-[var(--input-radius)] border border-default bg-[var(--input-bg)] focus-ring" />
          </FormField>
          <Button type="button" className="mt-4">Update Password</Button>
        </form>

        <div className="pt-6 border-t border-default">
          <Button variant="danger" onClick={() => logout()}>
            Log Out
          </Button>
        </div>
      </div>
    </div>
  )
}