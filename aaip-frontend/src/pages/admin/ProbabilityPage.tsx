import React from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics.api'
import { subjectsApi } from '@/api/subjects.api'
import { queryKeys } from '@/config/queryClient'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProbabilityHeatmap } from '@/components/charts/ProbabilityHeatmap'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

export default function ProbabilityPage() {
  const { subjectId } = useParams()

  const { data: subject } = useQuery({
    queryKey: queryKeys.subjects.detail(subjectId!),
    queryFn: () => subjectsApi.detail(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.analytics.probability(subjectId!),
    queryFn: () => analyticsApi.getProbabilities(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  return (
    <div>
      <PageHeader 
        title="Topic Probabilities" 
        subtitle={subject?.name}
        breadcrumbs={[
          { label: 'Analytics', href: '/admin/analytics' },
          { label: 'Probabilities' }
        ]}
      />

      <div className="card-base mb-6">
        <h3 className="font-bold text-lg mb-4 border-b border-default pb-2">Probability Heatmap</h3>
        {isLoading ? (
          <Skeleton className="h-[300px]" />
        ) : data && data.length > 0 ? (
          <ProbabilityHeatmap data={data} />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-secondary border border-dashed border-default rounded-md">
            No probability data available.
          </div>
        )}
      </div>

      {data && data.length > 0 && (
        <div className="card-base">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Rationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.sort((a,b) => b.probability - a.probability).map(d => (
                <TableRow key={d.topic_id}>
                  <TableCell className="font-medium">{d.topic_name}</TableCell>
                  <TableCell>{d.unit_title}</TableCell>
                  <TableCell className="font-bold text-brand-primary">{d.probability}%</TableCell>
                  <TableCell>{d.confidence}%</TableCell>
                  <TableCell className="text-xs text-secondary max-w-xs truncate" title={d.rationale || ''}>
                    {d.rationale || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}