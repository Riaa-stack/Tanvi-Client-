import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { papersApi } from '@/api/papers.api'
import { queryKeys } from '@/config/queryClient'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function PapersPage() {
  const { subjectId } = useParams()
  const [page, setPage] = useState(1)

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.papers.list({
      subject_id: subjectId,
      page,
    }),

    queryFn: () =>
      papersApi
        .list({
          subject_id: subjectId,
          page,
          per_page: 20,
        })
        .then((r) => r.data.data),

    // Do NOT call /papers without a subject ID
    enabled: !!subjectId,
  })

  // ============================================================
  // NO SUBJECT SELECTED
  // ============================================================

  if (!subjectId) {
    return (
      <div>
        <PageHeader
          title="Past Papers"
          subtitle="Select a subject to browse previous year exam papers."
        />

        <div className="card-base text-center py-12">
          <h3 className="text-lg font-semibold text-primary mb-2">
            Select a Subject
          </h3>

          <p className="text-secondary mb-6">
            Please select a subject first to view its previous year papers.
          </p>

          <Link to="/subjects">
            <Button variant="primary">
              Browse Subjects
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (isError) {
    return (
      <div>
        <PageHeader
          title="Past Papers"
          subtitle="Browse and practice previous year exam papers."
          breadcrumbs={[
            {
              label: 'Subjects',
              href: '/subjects',
            },
            {
              label: 'Subject',
              href: `/subjects/${subjectId}`,
            },
            {
              label: 'Papers',
            },
          ]}
        />

        <div className="card-base text-center py-12">
          <h3 className="text-lg font-semibold text-primary mb-2">
            Unable to load papers
          </h3>

          <p className="text-secondary mb-4">
            Something went wrong while loading the papers.
          </p>

          {error instanceof Error && (
            <p className="text-sm text-muted mb-4">
              {error.message}
            </p>
          )}

          <Button
            variant="primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Past Papers"
        subtitle="Browse and practice previous year exam papers."
        breadcrumbs={[
          {
            label: 'Subjects',
            href: '/subjects',
          },
          {
            label: 'Subject',
            href: `/subjects/${subjectId}`,
          },
          {
            label: 'Papers',
          },
        ]}
      />

      {/* ========================================================
          PAPERS GRID
      ======================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                key={i}
                className="h-32"
              />
            ))
        ) : data?.items?.map((paper) => (
          <div
            key={paper.id}
            className="card-base hover:border-strong transition-colors flex flex-col"
          >
            <div className="flex justify-between items-start mb-3">

              <Badge variant="subject">
                {paper.exam_year}
              </Badge>

              {paper.exam_type && (
                <Badge variant="default">
                  {paper.exam_type}
                </Badge>
              )}

            </div>

            <h3 className="font-semibold text-lg mb-1 truncate">
              {paper.file_name}
            </h3>

            {paper.subject && (
              <p className="text-sm text-secondary mb-4">
                {paper.subject.name}
              </p>
            )}

            <div className="mt-auto flex justify-between items-center pt-4 border-t border-default">

              <span className="text-sm text-muted">
                {paper.question_count || 0} Questions
              </span>

              <Link to={`/papers/${paper.id}`}>
                <Button
                  variant="secondary"
                  size="sm"
                >
                  View Questions
                </Button>
              </Link>

            </div>
          </div>
        ))}

        {!isLoading &&
          (!data?.items || data.items.length === 0) && (
            <div className="col-span-full text-center py-12 text-secondary">
              No papers found for this subject.
            </div>
          )}

      </div>

      {/* ========================================================
          PAGINATION
      ======================================================== */}

      {data?.meta && data.meta.total_pages > 1 && (
        <div className="flex justify-center mt-8 gap-2">

          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() =>
              setPage((p) => p - 1)
            }
          >
            Previous
          </Button>

          <span className="flex items-center px-4 text-sm">
            Page {page} of {data.meta.total_pages}
          </span>

          <Button
            variant="outline"
            disabled={
              page === data.meta.total_pages
            }
            onClick={() =>
              setPage((p) => p + 1)
            }
          >
            Next
          </Button>

        </div>
      )}
    </div>
  )
}