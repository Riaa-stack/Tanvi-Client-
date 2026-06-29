import React from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery, useMutation } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics.api'
import { adminApi } from '@/api/admin.api'
import { subjectsApi } from '@/api/subjects.api'
import { queryKeys } from '@/config/queryClient'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { RefreshCw } from 'lucide-react'
import { UnitWeightageBar } from '@/components/charts/UnitWeightageBar'
import toast from 'react-hot-toast'

export default function UnitWeightagePage() {
  const { subjectId } = useParams()

  const { data: subject } = useQuery({
    queryKey: queryKeys.subjects.detail(subjectId!),
    queryFn: () => subjectsApi.detail(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.analytics.unitWeightage(subjectId!),
    queryFn: () => analyticsApi.getUnitWeightage(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  const triggerMutation = useMutation({
    mutationFn: () => adminApi.triggerAction('refresh_analytics', { subject_id: subjectId }),
    onSuccess: () => toast.success('Analytics refresh job started'),
  })

  return (
    <div>
      <PageHeader 
        title="Unit Weightage Analytics" 
        subtitle={subject?.name}
        breadcrumbs={[
          { label: 'Analytics', href: '/admin/analytics' },
          { label: 'Unit Weightage' }
        ]}
        actions={
          <Button variant="outline" className="gap-2" onClick={() => triggerMutation.mutate()} isLoading={triggerMutation.isPending}>
            <RefreshCw size={16} /> Recompute Analytics
          </Button>
        }
      />

      <div className="card-base mb-6">
        <h3 className="font-bold text-lg mb-4 border-b border-default pb-2">Unit Mark Distribution</h3>
        {isLoading ? (
          <Skeleton className="h-[300px]" />
        ) : data && data.length > 0 ? (
          <UnitWeightageBar data={data} />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-secondary border border-dashed border-default rounded-md">
            No weightage data available.
          </div>
        )}
      </div>
      
      {data && data.length > 0 && (
        <div className="card-base">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-default text-muted">
                <th className="py-2">Unit</th>
                <th className="py-2 text-right">Total Marks</th>
                <th className="py-2 text-right">Questions</th>
                <th className="py-2 text-right">Weightage %</th>
              </tr>
            </thead>
            <tbody>
              {data.map(d => (
                <tr key={d.unit_id} className="border-b border-default last:border-0 hover:bg-surface-sunken">
                  <td className="py-3 font-medium">Unit {d.unit_number}: {d.unit_title}</td>
                  <td className="py-3 text-right">{d.total_marks}</td>
                  <td className="py-3 text-right">{d.question_count}</td>
                  <td className="py-3 text-right font-bold text-brand-primary">{d.weightage_percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}