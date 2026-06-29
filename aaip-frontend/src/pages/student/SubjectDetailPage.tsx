import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { subjectsApi } from '@/api/subjects.api'
import { syllabusApi } from '@/api/syllabus.api'
import { queryKeys } from '@/config/queryClient'
import { Skeleton } from '@/components/ui/Skeleton'
import { FileText, Lightbulb, BarChart3, ChevronRight } from 'lucide-react'

export default function SubjectDetailPage() {
  const { subjectId } = useParams()

  const { data: subject, isLoading: loadingSubject } = useQuery({
    queryKey: queryKeys.subjects.detail(subjectId!),
    queryFn: () => subjectsApi.detail(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  const { data: syllabus, isLoading: loadingSyllabus } = useQuery({
    queryKey: queryKeys.subjects.syllabus(subjectId!),
    queryFn: () => syllabusApi.get(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  if (loadingSubject) return <div className="space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-32" /></div>
  if (!subject) return <div>Subject not found</div>

  return (
    <div>
      <PageHeader 
        title={subject.name}
        subtitle={`${subject.code} • Semester ${subject.semester?.number || 'N/A'}`}
        breadcrumbs={[
          { label: 'Subjects', href: '/subjects' },
          { label: subject.name }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-xl font-bold border-b border-default pb-2">Syllabus & Units</h2>
          
          {loadingSyllabus ? (
            <Skeleton className="h-64" />
          ) : syllabus?.units?.length ? (
            <div className="space-y-4">
              {syllabus.units.map(unit => (
                <Link key={unit.id} to={`/subjects/${subject.id}/units/${unit.id}`} className="block">
                  <div className="card-base hover:border-strong transition-colors group">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg group-hover:text-brand-primary">
                        Unit {unit.unit_number}: {unit.title}
                      </h3>
                      <ChevronRight size={18} className="text-muted group-hover:text-primary transition-colors" />
                    </div>
                    {unit.weightage_percentage && (
                      <span className="text-xs font-medium bg-surface-sunken text-secondary px-2 py-1 rounded">
                        Weightage: {unit.weightage_percentage}%
                      </span>
                    )}
                    {unit.topics && unit.topics.length > 0 && (
                      <div className="mt-4 text-sm text-secondary flex flex-wrap gap-x-3 gap-y-1">
                        {unit.topics.slice(0, 5).map(topic => (
                          <span key={topic.id} className="flex items-center gap-1">
                            • {topic.name}
                            {topic.is_important && <span className="text-warning text-[10px]">★</span>}
                          </span>
                        ))}
                        {unit.topics.length > 5 && <span className="text-muted">+{unit.topics.length - 5} more</span>}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-secondary bg-surface-sunken p-6 rounded-md text-center">
              No syllabus units defined for this subject yet.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b border-default pb-2">Quick Actions</h2>
          
          <Link to={`/subjects/${subject.id}/papers`} className="flex items-center gap-3 p-3 bg-surface-card border border-default rounded-md hover:bg-surface-sunken transition-colors">
            <div className="bg-brand-accent text-brand-primary p-2 rounded-md"><FileText size={18} /></div>
            <span className="font-medium">Past Papers</span>
          </Link>
          
          <Link to={`/predictions/${subject.id}`} className="flex items-center gap-3 p-3 bg-surface-card border border-default rounded-md hover:bg-surface-sunken transition-colors">
            <div className="bg-warning-bg text-warning p-2 rounded-md"><Lightbulb size={18} /></div>
            <span className="font-medium">Predictions</span>
          </Link>

          <div className="flex items-center gap-3 p-3 bg-surface-card border border-default rounded-md hover:bg-surface-sunken transition-colors opacity-50 cursor-not-allowed" title="Subject specific analytics coming soon">
            <div className="bg-info-bg text-info p-2 rounded-md"><BarChart3 size={18} /></div>
            <span className="font-medium">Analytics</span>
          </div>
        </div>
      </div>
    </div>
  )
}