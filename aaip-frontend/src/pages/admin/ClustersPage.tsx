import React from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics.api'
import { subjectsApi } from '@/api/subjects.api'
import { queryKeys } from '@/config/queryClient'
import { Skeleton } from '@/components/ui/Skeleton'
import { DependencyGraph } from '@/components/charts/DependencyGraph'

export default function ClustersPage() {
  const { subjectId } = useParams()

  const { data: subject } = useQuery({
    queryKey: queryKeys.subjects.detail(subjectId!),
    queryFn: () => subjectsApi.detail(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  // We map the getDependencyGraph response to DependencyGraph component
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.analytics.dependency(subjectId!),
    queryFn: () => analyticsApi.getDependencyGraph(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  return (
    <div>
      <PageHeader 
        title="Question Clusters & Dependencies" 
        subtitle={subject?.name}
        breadcrumbs={[
          { label: 'Analytics', href: '/admin/analytics' },
          { label: 'Clusters' }
        ]}
      />

      <div className="card-base mb-6">
        <h3 className="font-bold text-lg mb-4 border-b border-default pb-2">Topic Dependency Graph</h3>
        {isLoading ? (
          <Skeleton className="h-[600px]" />
        ) : data && data.nodes && data.nodes.length > 0 ? (
          <DependencyGraph data={data} />
        ) : (
          <div className="h-[600px] flex items-center justify-center text-secondary border border-dashed border-default rounded-md">
            No dependency graph data available.
          </div>
        )}
      </div>
    </div>
  )
}