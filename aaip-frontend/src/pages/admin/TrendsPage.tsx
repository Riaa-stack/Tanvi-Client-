import React from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics.api'
import { subjectsApi } from '@/api/subjects.api'
import { queryKeys } from '@/config/queryClient'
import { Skeleton } from '@/components/ui/Skeleton'
import { TrendLineChart } from '@/components/charts/TrendLineChart'

export default function TrendsPage() {
  const { subjectId } = useParams()

  const { data: subject } = useQuery({
    queryKey: queryKeys.subjects.detail(subjectId!),
    queryFn: () => subjectsApi.detail(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.analytics.trends(subjectId!),
    queryFn: () => analyticsApi.getTrends(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  return (
    <div>
      <PageHeader 
        title="Topic Trends" 
        subtitle={subject?.name}
        breadcrumbs={[
          { label: 'Analytics', href: '/admin/analytics' },
          { label: 'Trends' }
        ]}
      />

      <div className="card-base mb-6">
        <h3 className="font-bold text-lg mb-4 border-b border-default pb-2">Topic Appearance Over Time</h3>
        {isLoading ? (
          <Skeleton className="h-[300px]" />
        ) : data && data.length > 0 ? (
          <TrendLineChart data={data} />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-secondary border border-dashed border-default rounded-md">
            No trend data available.
          </div>
        )}
      </div>

      <div className="text-sm text-secondary bg-surface-sunken p-4 rounded-md border border-default">
        This chart shows the aggregated number of questions for topics across different exam years. In a full implementation, you could filter by specific topics to compare their rise or fall in popularity.
      </div>
    </div>
  )
}