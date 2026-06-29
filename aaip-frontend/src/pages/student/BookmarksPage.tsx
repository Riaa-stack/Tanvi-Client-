import React from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { bookmarksApi } from '@/api/bookmarks.api'
import { queryKeys } from '@/config/queryClient'
import { Skeleton } from '@/components/ui/Skeleton'
import { Link } from 'react-router-dom'
import { Bookmark, FileText, Search } from 'lucide-react'

export default function BookmarksPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.bookmarks.list(),
    queryFn: () => bookmarksApi.list().then(r => r.data.data),
  })

  return (
    <div>
      <PageHeader title="Bookmarks" subtitle="Your saved questions, papers, and topics." />

      <div className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : data?.items && data.items.length > 0 ? (
          data.items.map(bm => (
            <div key={bm.id} className="card-base flex items-start gap-4">
              <div className="bg-brand-accent text-brand-primary p-2 rounded-md shrink-0">
                <Bookmark size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {bm.entity_type}
                  </span>
                  <span className="text-xs text-secondary">• {new Date(bm.created_at).toLocaleDateString()}</span>
                </div>
                
                {bm.entity_type === 'question' && bm.entity && 'question_text' in bm.entity && (
                  <p className="font-medium text-primary mb-2 line-clamp-2">
                    {bm.entity.question_text}
                  </p>
                )}
                
                {bm.entity_type === 'paper' && bm.entity && 'file_name' in bm.entity && (
                  <p className="font-medium text-primary mb-2">
                    {bm.entity.file_name}
                  </p>
                )}

                {bm.note && (
                  <div className="bg-surface-sunken p-2 rounded text-sm text-secondary mb-3">
                    <span className="font-medium block mb-1">Note:</span>
                    {bm.note}
                  </div>
                )}
                
                <div className="flex justify-end border-t border-default pt-3 mt-2">
                  {bm.entity_type === 'question' && bm.entity && 'paper_id' in bm.entity && (
                    <Link to={`/papers/${bm.entity.paper_id}`} className="text-brand-primary hover:underline text-sm font-medium">
                      View in Paper
                    </Link>
                  )}
                  {bm.entity_type === 'paper' && (
                    <Link to={`/papers/${bm.entity_id}`} className="text-brand-primary hover:underline text-sm font-medium">
                      Open Paper
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-secondary bg-surface-card border border-dashed border-default rounded-md">
            You haven't bookmarked anything yet.
          </div>
        )}
      </div>
    </div>
  )
}