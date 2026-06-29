import React from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { subjectsApi } from '@/api/subjects.api'
import { queryKeys } from '@/config/queryClient'
import { BarChart3, TrendingUp, ScatterChart, Workflow } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function AnalyticsDashboard() {
  const { data: subjects, isLoading } = useQuery({
    queryKey: queryKeys.subjects.list(),
    queryFn: () => subjectsApi.list().then(r => r.data.data),
  })

  return (
    <div>
      <PageHeader 
        title="Analytics Hub" 
        subtitle="Select a subject to view deep analytics and predictive models."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : subjects?.items.map(subject => (
          <div key={subject.id} className="card-base">
            <h3 className="font-bold text-lg mb-4 truncate" title={subject.name}>{subject.name}</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Link to={`/admin/analytics/unit-weightage/${subject.id}`} className="flex flex-col items-center justify-center p-3 bg-surface-sunken hover:bg-surface-elevated border border-default rounded-md transition-colors text-center group">
                <BarChart3 size={20} className="mb-2 text-muted group-hover:text-brand-primary" />
                <span className="text-xs font-medium">Unit Weightage</span>
              </Link>
              <Link to={`/admin/analytics/trends/${subject.id}`} className="flex flex-col items-center justify-center p-3 bg-surface-sunken hover:bg-surface-elevated border border-default rounded-md transition-colors text-center group">
                <TrendingUp size={20} className="mb-2 text-muted group-hover:text-brand-primary" />
                <span className="text-xs font-medium">Topic Trends</span>
              </Link>
              <Link to={`/admin/analytics/probability/${subject.id}`} className="flex flex-col items-center justify-center p-3 bg-surface-sunken hover:bg-surface-elevated border border-default rounded-md transition-colors text-center group">
                <ScatterChart size={20} className="mb-2 text-muted group-hover:text-brand-primary" />
                <span className="text-xs font-medium">Probability</span>
              </Link>
              <Link to={`/admin/analytics/clusters/${subject.id}`} className="flex flex-col items-center justify-center p-3 bg-surface-sunken hover:bg-surface-elevated border border-default rounded-md transition-colors text-center group">
                <Workflow size={20} className="mb-2 text-muted group-hover:text-brand-primary" />
                <span className="text-xs font-medium">Clusters</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}