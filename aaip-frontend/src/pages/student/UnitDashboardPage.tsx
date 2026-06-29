import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { subjectsApi } from '@/api/subjects.api'
import { syllabusApi } from '@/api/syllabus.api'
import { queryKeys } from '@/config/queryClient'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Search } from 'lucide-react'

export default function UnitDashboardPage() {
  const { subjectId, unitId } = useParams()

  const { data: subject } = useQuery({
    queryKey: queryKeys.subjects.detail(subjectId!),
    queryFn: () => subjectsApi.detail(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  const { data: syllabus, isLoading } = useQuery({
    queryKey: queryKeys.subjects.syllabus(subjectId!),
    queryFn: () => syllabusApi.get(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  const unit = syllabus?.units.find(u => u.id === unitId)

  if (isLoading) return <Skeleton className="h-64" />
  if (!unit) return <div>Unit not found</div>

  return (
    <div>
      <PageHeader 
        title={`Unit ${unit.unit_number}: ${unit.title}`}
        breadcrumbs={[
          { label: 'Subjects', href: '/subjects' },
          { label: subject?.name || 'Subject', href: `/subjects/${subjectId}` },
          { label: `Unit ${unit.unit_number}` }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card-base">
            <h3 className="text-lg font-bold border-b border-default pb-2 mb-4">Topics</h3>
            <ul className="space-y-3">
              {unit.topics?.map(topic => (
                <li key={topic.id} className="flex items-center justify-between p-3 bg-surface-sunken rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{topic.name}</span>
                    {topic.is_important && <Badge variant="warning">Important</Badge>}
                  </div>
                  <Link to={`/search?topic_id=${topic.id}&subject_id=${subjectId}`}>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      <Search size={14} className="mr-1" /> View Questions
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="card-base bg-surface-sunken">
            <h3 className="text-lg font-bold mb-4">Unit Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-default pb-2">
                <span className="text-secondary">Weightage</span>
                <span className="font-semibold">{unit.weightage_percentage || 0}%</span>
              </div>
              <div className="flex justify-between border-b border-default pb-2">
                <span className="text-secondary">Topics count</span>
                <span className="font-semibold">{unit.topics?.length || 0}</span>
              </div>
            </div>
            <Link to={`/search?unit_id=${unit.id}&subject_id=${subjectId}`} className="mt-6 block">
              <Button variant="primary" className="w-full">
                Practice all unit questions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}