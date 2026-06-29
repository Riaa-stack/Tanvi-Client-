import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { papersApi } from '@/api/papers.api'
import { queryKeys } from '@/config/queryClient'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PaperDetailAdminPage() {
  const { paperId } = useParams()

  const { data: paper, isLoading: loadingPaper } = useQuery({
    queryKey: queryKeys.papers.detail(paperId!),
    queryFn: () => papersApi.detail(paperId!).then(r => r.data.data),
    enabled: !!paperId,
  })

  const handleReprocess = async () => {
    try {
      const res = await papersApi.reprocess(paperId!)
      toast.success(`Reprocessing started. Job ID: ${res.data.data.job_id}`)
    } catch (e) {
      toast.error('Failed to trigger reprocessing')
    }
  }

  if (loadingPaper) return <Skeleton className="h-64" />
  if (!paper) return <div>Paper not found</div>

  return (
    <div>
      <PageHeader 
        title={paper.file_name}
        subtitle="View extraction details and manage paper processing."
        breadcrumbs={[
          { label: 'Papers Manage', href: '/admin/papers' },
          { label: 'Details' }
        ]}
        actions={
          <Button variant="outline" className="gap-2" onClick={handleReprocess}>
            <RefreshCw size={16} /> Reprocess PDF
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card-base">
            <h3 className="font-bold text-lg mb-4">Processing Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-secondary block">Status</span>
                <Badge variant={paper.processing_status === 'completed' ? 'success' : 'info'} className="mt-1">
                  {paper.processing_status}
                </Badge>
              </div>
              <div>
                <span className="text-secondary block">Question Count</span>
                <span className="font-semibold">{paper.question_count || 0}</span>
              </div>
              <div>
                <span className="text-secondary block">Job ID</span>
                <span className="font-mono text-xs">{paper.processing_job_id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-secondary block">Uploaded</span>
                <span>{new Date(paper.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}