import React from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function SemesterFormPage() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader
        title="Add New Semester"
        subtitle="Create a new semester."
      />

      <div className="card-base max-w-2xl">
        <p className="text-secondary">
          Semester creation form will be added here.
        </p>

        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/semesters')}
          >
            Back to Semesters
          </Button>
        </div>
      </div>
    </div>
  )
}