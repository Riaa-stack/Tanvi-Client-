import React, { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { searchApi } from '@/api/search.api'
import { subjectsApi } from '@/api/subjects.api'
import { useDebounce } from '@/hooks/useDebounce'
import { FormField } from '@/components/forms/FormField'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { MessageSquare, Bookmark, Search as SearchIcon } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialSubject = searchParams.get('subject_id') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [subjectId, setSubjectId] = useState(initialSubject)
  const debouncedQuery = useDebounce(query, 500)

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', 'list-simple'],
    queryFn: () => subjectsApi.list({}).then(r => r.data.data)
  })

  const { data: searchResults, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery, subjectId],
    queryFn: () => searchApi.search({ query: debouncedQuery, subject_id: subjectId || undefined }).then(r => r.data.data),
    enabled: debouncedQuery.length > 2 || !!subjectId,
  })

  return (
    <div>
      <PageHeader 
        title="Semantic Search" 
        subtitle="Search across all past paper questions by concept, topic, or keyword."
      />

      <div className="card-base mb-8 space-y-4">
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1">
            <FormField label="Search Query">
              <div className="relative">
                <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. explain the difference between processes and threads"
                  className="w-full h-10 pl-10 pr-3 rounded-md border border-default bg-surface-page focus-ring"
                />
              </div>
            </FormField>
          </div>
          
          <div className="w-full md:w-64">
            <FormField label="Filter by Subject">
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-default bg-surface-page focus-ring"
              >
                <option value="">All Subjects</option>
                {subjectsData?.items.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isFetching && (
          <div className="flex items-center gap-2 text-sm text-secondary mb-4">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            Searching...
          </div>
        )}
        
        {!isFetching && searchResults?.results && searchResults.results.length > 0 && (
          <div className="text-sm text-secondary mb-4">
            Found {searchResults.results.length} relevant questions
          </div>
        )}

        {searchResults?.results?.map((q) => (
          <div key={q.question_id} className="card-base group">
            <p className="text-primary text-base whitespace-pre-wrap font-medium mb-3">
              {q.question_text}
            </p>
            
            <div className="flex flex-wrap gap-2 items-center justify-between border-t border-default pt-3">
              <div className="flex gap-2 items-center text-xs">
                {q.exam_year && <Badge variant="default">{q.exam_year}</Badge>}
                {q.topic_name && <Badge variant="subject">{q.topic_name}</Badge>}
                <span className="text-muted ml-2">Relevance: {(q.relevance_score * 100).toFixed(0)}%</span>
              </div>
              
              <div className="flex gap-2">
                <Link to={`/chat/${q.subject_id}?q=${encodeURIComponent(q.question_text)}`}>
                  <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
                    <MessageSquare size={14} /> Discuss
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {!isFetching && debouncedQuery.length > 2 && searchResults?.results?.length === 0 && (
          <div className="text-center py-12 text-secondary bg-surface-card rounded-md border border-dashed border-default">
            No questions matched your search criteria.
          </div>
        )}
      </div>
    </div>
  )
}