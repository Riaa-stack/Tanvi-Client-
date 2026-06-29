import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { papersApi } from '@/api/papers.api'
import { queryKeys } from '@/config/queryClient'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Bookmark, MessageSquare } from 'lucide-react'

export default function PaperDetailPage() {
  const { paperId } = useParams()
  const [page, setPage] = useState(1)

  const { data: paper, isLoading: loadingPaper } = useQuery({
    queryKey: queryKeys.papers.detail(paperId!),
    queryFn: () => papersApi.detail(paperId!).then(r => r.data.data),
    enabled: !!paperId,
  })

  const { data: questionsData, isLoading: loadingQuestions } = useQuery({
    queryKey: queryKeys.papers.questions(paperId!, { page }),
    queryFn: () => papersApi.questions(paperId!, { page, per_page: 20 }).then(r => r.data.data),
    enabled: !!paperId,
  })

  if (loadingPaper) return <Skeleton className="h-64" />
  if (!paper) return <div>Paper not found</div>

  return (
    <div>
      <PageHeader 
        title={paper.file_name}
        subtitle={`${paper.subject?.name || 'Unknown Subject'} • ${paper.exam_year} ${paper.exam_type || ''}`}
        breadcrumbs={[
          { label: 'Papers', href: '/papers' },
          { label: paper.file_name }
        ]}
      />

      <div className="space-y-6">
        <h2 className="text-xl font-bold">Questions</h2>
        {loadingQuestions ? (
          <Skeleton className="h-64" />
        ) : (
          <div className="space-y-4">
            {questionsData?.items.map(q => (
              <div key={q.id} className="card-base group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-secondary text-sm">
                    Q{q.question_number || '-'}
                  </span>
                  <div className="flex gap-2">
                    {q.marks && <Badge variant="default">{q.marks} Marks</Badge>}
                    {q.difficulty && (
                      <Badge variant={q.difficulty === 'hard' ? 'danger' : q.difficulty === 'medium' ? 'warning' : 'success'}>
                        {q.difficulty}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-primary text-base whitespace-pre-wrap font-medium">
                  {q.question_text}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex gap-2">
                    {q.topic && <Badge variant="subject">{q.topic.name}</Badge>}
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" title="Bookmark">
                      <Bookmark size={16} />
                    </Button>
                    {paper.subject_id && (
                      <Link to={`/chat/${paper.subject_id}?q=${encodeURIComponent(q.question_text)}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <MessageSquare size={14} /> Discuss with AI
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {questionsData?.items.length === 0 && (
              <div className="text-center py-8 text-secondary">
                No questions extracted yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}