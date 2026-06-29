import React, { useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { papersApi } from '@/api/papers.api'
import { queryKeys } from '@/config/queryClient'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FileText, Search } from 'lucide-react'

export default function PapersPage() {
  const { subjectId } = useParams()
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.papers.list({ subject_id: subjectId, page }),
    queryFn: () => papersApi.list({ subject_id: subjectId, page, per_page: 20 }).then(r => r.data.data),
  })

  return (
    <div>
      <PageHeader 
        title="Past Papers" 
        subtitle="Browse and practice previous year exam papers."
        breadcrumbs={subjectId ? [
          { label: 'Subjects', href: '/subjects' },
          { label: 'Subject', href: `/subjects/${subjectId}` },
          { label: 'Papers' }
        ] : []}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : data?.items.map(paper => (
          <div key={paper.id} className="card-base hover:border-strong transition-colors flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <Badge variant="subject">{paper.exam_year}</Badge>
              {paper.exam_type && <Badge variant="default">{paper.exam_type}</Badge>}
            </div>
            <h3 className="font-semibold text-lg mb-1 truncate">{paper.file_name}</h3>
            {paper.subject && <p className="text-sm text-secondary mb-4">{paper.subject.name}</p>}
            
            <div className="mt-auto flex justify-between items-center pt-4 border-t border-default">
              <span className="text-sm text-muted">{paper.question_count || 0} Questions</span>
              <Link to={`/papers/${paper.id}`}>
                <Button variant="secondary" size="sm">
                  View Questions
                </Button>
              </Link>
            </div>
          </div>
        ))}
        {!isLoading && data?.items.length === 0 && (
          <div className="col-span-full text-center py-12 text-secondary">
            No papers found for this selection.
          </div>
        )}
      </div>

      {data?.meta && data.meta.total_pages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button 
            variant="outline" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm">
            Page {page} of {data.meta.total_pages}
          </span>
          <Button 
            variant="outline" 
            disabled={page === data.meta.total_pages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}