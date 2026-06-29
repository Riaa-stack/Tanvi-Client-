import React, { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { subjectsApi } from '@/api/subjects.api'
import { queryKeys } from '@/config/queryClient'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

export default function SubjectsPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'all'>('current')

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.subjects.list({ active_only: activeTab === 'current' }),
    queryFn: () => subjectsApi.list({ active_only: activeTab === 'current' }).then(r => r.data.data),
  })

  return (
    <div>
      <PageHeader title="Subjects" subtitle="Browse and study your subjects." />
      
      <div className="flex gap-4 border-b border-default mb-6">
        <button
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'current' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-secondary hover:text-primary'
          }`}
          onClick={() => setActiveTab('current')}
        >
          Current Semester
        </button>
        <button
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'all' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-secondary hover:text-primary'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All Subjects
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : data?.items.map((subject, idx) => (
          <Link key={subject.id} to={`/subjects/${subject.id}`}>
            <div className="card-base h-full hover:border-brand-primary hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="subject" subjectColorId={idx + 1}>{subject.code}</Badge>
                {subject.semester && (
                  <span className="text-xs text-muted font-medium bg-surface-sunken px-2 py-1 rounded">
                    Sem {subject.semester.number}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-lg text-primary group-hover:text-brand-primary transition-colors">
                {subject.name}
              </h3>
              {subject.description && (
                <p className="text-sm text-secondary mt-2 line-clamp-2">
                  {subject.description}
                </p>
              )}
            </div>
          </Link>
        ))}
        {!isLoading && data?.items.length === 0 && (
          <div className="col-span-full py-12 text-center text-secondary">
            No subjects found.
          </div>
        )}
      </div>
    </div>
  )
}