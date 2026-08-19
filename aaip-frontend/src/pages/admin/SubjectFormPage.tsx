import React from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function SubjectFormPage() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader
        title="Add New Subject"
        subtitle="Create a new subject for a semester."
      />

      <div className="card-base max-w-2xl">
        <p className="text-secondary">
          Subject creation form will be added here.
        </p>

        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/subjects')}
          >
            Back to Subjects
          </Button>
        </div>
      </div>
    </div>
  )
}