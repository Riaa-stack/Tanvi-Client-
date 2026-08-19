import React, { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { searchApi } from '@/api/search.api'
import { subjectsApi } from '@/api/subjects.api'
import { useDebounce } from '@/hooks/useDebounce'
import { FormField } from '@/components/forms/FormField'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  MessageSquare,
  Search as SearchIcon,
} from 'lucide-react'
import {
  Link,
  useSearchParams,
} from 'react-router-dom'

export default function SearchPage() {
  const [searchParams] = useSearchParams()

  const initialQuery =
    searchParams.get('q') || ''

  const initialSubject =
    searchParams.get('subject_id') || ''

  const [query, setQuery] =
    useState(initialQuery)

  const [subjectId, setSubjectId] =
    useState(initialSubject)

  const debouncedQuery =
    useDebounce(query, 500)

  // ============================================================
  // SUBJECTS
  // ============================================================

  const {
    data: subjectsData,
    isLoading: subjectsLoading,
  } = useQuery({
    queryKey: [
      'subjects',
      'list-simple',
    ],

    queryFn: async () => {
      const response =
        await subjectsApi.list({})

      console.log(
        'SearchPage - Subjects API response:',
        response.data
      )

      return response.data.data
    },
  })

  const subjects = Array.isArray(subjectsData)
  ? subjectsData
  : []

  // ============================================================
  // SEARCH
  // ============================================================

  const {
    data: searchData,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: [
      'search',
      debouncedQuery,
      subjectId,
    ],

    queryFn: async () => {
      const response =
        await searchApi.search({
          query: debouncedQuery,
          subject_id:
            subjectId || undefined,
        })

      console.log(
        'Search API response:',
        response.data
      )

      return response.data.data
    },

    // Only search when there is a query.
    enabled: debouncedQuery.length > 2,
  })

  const searchResults =
    Array.isArray(searchData)
      ? searchData
      : searchData?.results ?? []

  return (
    <div>

      <PageHeader
        title="Semantic Search"
        subtitle="Search across all past paper questions by concept, topic, or keyword."
      />

      {/* ======================================================
          SEARCH FILTERS
      ====================================================== */}

      <div className="card-base mb-8 space-y-4">

        <div className="flex gap-4 flex-col md:flex-row">

          {/* Search input */}

          <div className="flex-1">

            <FormField label="Search Query">

              <div className="relative">

                <SearchIcon
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  type="text"
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  placeholder="e.g. explain the difference between processes and threads"
                  className="w-full h-10 pl-10 pr-3 rounded-md border border-default bg-surface-page focus-ring"
                />

              </div>

            </FormField>

          </div>

          {/* Subject filter */}

          <div className="w-full md:w-64">

            <FormField label="Filter by Subject">

              <select
                value={subjectId}
                onChange={(e) =>
                  setSubjectId(e.target.value)
                }
                disabled={subjectsLoading}
                className="w-full h-10 px-3 rounded-md border border-default bg-surface-page focus-ring"
              >

                <option value="">
                  All Subjects
                </option>

                {subjects.map(
                  (subject: any) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                    >
                      {subject.name}
                    </option>
                  )
                )}

              </select>

            </FormField>

          </div>

        </div>

      </div>

      {/* ======================================================
          SEARCH STATUS
      ====================================================== */}

      <div className="space-y-4">

        {isFetching && (
          <div className="flex items-center gap-2 text-sm text-secondary mb-4">

            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />

            Searching...

          </div>
        )}

        {/* Search error */}

        {isError && !isFetching && (
          <div className="card-base border-red-300">

            <p className="text-red-500 font-medium">
              Search failed.
            </p>

            <p className="text-sm text-secondary mt-1">
              {error instanceof Error
                ? error.message
                : 'Unable to perform search.'}
            </p>

          </div>
        )}

        {/* Results count */}

        {!isFetching &&
          !isError &&
          searchResults.length > 0 && (
            <div className="text-sm text-secondary mb-4">
              Found {searchResults.length} relevant questions
            </div>
          )}

        {/* ====================================================
            SEARCH RESULTS
        ==================================================== */}

        {!isError &&
          searchResults.map(
            (q: any) => (

              <div
                key={q.question_id}
                className="card-base group"
              >

                <p className="text-primary text-base whitespace-pre-wrap font-medium mb-3">
                  {q.question_text}
                </p>

                <div className="flex flex-wrap gap-2 items-center justify-between border-t border-default pt-3">

                  <div className="flex gap-2 items-center text-xs">

                    {q.exam_year && (
                      <Badge variant="default">
                        {q.exam_year}
                      </Badge>
                    )}

                    {q.topic_name && (
                      <Badge variant="subject">
                        {q.topic_name}
                      </Badge>
                    )}

                    {typeof q.relevance_score ===
                      'number' && (
                      <span className="text-muted ml-2">
                        Relevance:{' '}
                        {(
                          q.relevance_score * 100
                        ).toFixed(0)}
                        %
                      </span>
                    )}

                  </div>

                  <div className="flex gap-2">

                    {q.subject_id && (
                      <Link
                        to={`/chat/${q.subject_id}?q=${encodeURIComponent(
                          q.question_text || ''
                        )}`}
                      >

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 h-8 text-xs"
                        >

                          <MessageSquare
                            size={14}
                          />

                          Discuss

                        </Button>

                      </Link>
                    )}

                  </div>

                </div>

              </div>

            )
          )}

        {/* ====================================================
            NO RESULTS
        ==================================================== */}

        {!isFetching &&
          !isError &&
          debouncedQuery.length > 2 &&
          searchResults.length === 0 && (

            <div className="text-center py-12 text-secondary bg-surface-card rounded-md border border-dashed border-default">

              No questions matched your search criteria.

            </div>

          )}

        {/* ====================================================
            INITIAL STATE
        ==================================================== */}

        {debouncedQuery.length <= 2 &&
          !isFetching && (
            <div className="text-center py-12 text-secondary">

              Enter at least 3 characters
              to search.

            </div>
          )}

      </div>

    </div>
  )
}