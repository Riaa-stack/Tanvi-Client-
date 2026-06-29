import React from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin.api'
import { queryKeys } from '@/config/queryClient'
import { Skeleton } from '@/components/ui/Skeleton'
import { FileText, BookOpen, Users, BrainCircuit } from 'lucide-react'

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: () => adminApi.getDashboard().then(r => r.data.data),
  })

  if (isLoading) return <Skeleton className="h-64" />

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and ingestion metrics" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card-base flex items-center gap-4">
          <div className="p-3 bg-brand-accent text-brand-primary rounded-md">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-secondary text-sm font-medium">Total Papers</p>
            <p className="text-2xl font-bold">{dashboard?.total_papers || 0}</p>
          </div>
        </div>
        <div className="card-base flex items-center gap-4">
          <div className="p-3 bg-brand-accent text-brand-primary rounded-md">
            <BrainCircuit size={24} />
          </div>
          <div>
            <p className="text-secondary text-sm font-medium">Total Questions</p>
            <p className="text-2xl font-bold">{dashboard?.total_questions || 0}</p>
          </div>
        </div>
        <div className="card-base flex items-center gap-4">
          <div className="p-3 bg-brand-accent text-brand-primary rounded-md">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-secondary text-sm font-medium">Subjects</p>
            <p className="text-2xl font-bold">{dashboard?.total_subjects || 0}</p>
          </div>
        </div>
        <div className="card-base flex items-center gap-4">
          <div className="p-3 bg-brand-accent text-brand-primary rounded-md">
            <Users size={24} />
          </div>
          <div>
            <p className="text-secondary text-sm font-medium">Students</p>
            <p className="text-2xl font-bold">{dashboard?.total_students || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base">
          <h3 className="text-lg font-bold mb-4">Ingestion Status</h3>
          <div className="space-y-4">
            {Object.entries(dashboard?.papers_by_status || {}).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center border-b border-default pb-2">
                <span className="capitalize">{status.replace('_', ' ')}</span>
                <span className="font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}