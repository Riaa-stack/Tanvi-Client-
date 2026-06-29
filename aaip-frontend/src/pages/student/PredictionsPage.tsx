import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { predictionsApi } from '@/api/predictions.api'
import { subjectsApi } from '@/api/subjects.api'
import { queryKeys } from '@/config/queryClient'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { AIDisclaimerBanner } from '@/components/ui/AIDisclaimerBanner'
import { Sparkles, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function PredictionsPage() {
  const { subjectId } = useParams()

  const { data: subject } = useQuery({
    queryKey: queryKeys.subjects.detail(subjectId || ''),
    queryFn: () => subjectsApi.detail(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  const { data: predictions, isLoading } = useQuery({
    queryKey: queryKeys.predictions.list(subjectId || '', {}),
    queryFn: () => predictionsApi.getPredictions(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  if (!subjectId) {
    return (
      <div className="text-center py-12">
        Please select a subject first to view predictions.
      </div>
    )
  }

  return (
    <div>
      <PageHeader 
        title="AI Predictions" 
        subtitle={subject ? `Predicted questions for ${subject.name}` : 'Loading...'}
      />

      <div className="space-y-6">
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : predictions && predictions.length > 0 ? (
          predictions.map((pred) => (
            <div key={pred.id} className="card-base border-brand-accent shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-warning" />
                  <span className="font-semibold text-primary">
                    Probability: {pred.probability_score}%
                  </span>
                </div>
                <div className="flex gap-2">
                  {pred.marks_estimated && <Badge>{pred.marks_estimated} Marks</Badge>}
                  {pred.difficulty_estimated && (
                    <Badge variant={pred.difficulty_estimated === 'hard' ? 'danger' : 'warning'}>
                      {pred.difficulty_estimated}
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-primary text-lg font-medium mb-4 whitespace-pre-wrap">
                {pred.question_text}
              </p>

              <AIDisclaimerBanner className="mb-4" />

              {pred.generation_rationale && (
                <div className="bg-surface-sunken p-3 rounded-md border border-default text-sm text-secondary mb-4">
                  <span className="font-semibold text-primary block mb-1">AI Rationale:</span>
                  {pred.generation_rationale}
                </div>
              )}

              <div className="flex justify-between items-center border-t border-default pt-4 mt-2">
                <div className="flex gap-2 text-xs">
                  {pred.unit && <Badge variant="default">Unit {pred.unit.unit_number}</Badge>}
                  {pred.topic && <Badge variant="subject">{pred.topic.name}</Badge>}
                </div>
                <Link to={`/chat/${subjectId}?q=${encodeURIComponent(pred.question_text)}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare size={14} /> Discuss
                  </Button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-secondary bg-surface-card border border-dashed border-default rounded-md">
            No predictions generated for this subject yet.
          </div>
        )}
      </div>
    </div>
  )
}