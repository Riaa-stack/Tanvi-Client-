import React, { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { papersApi } from '@/api/papers.api'
import { queryKeys } from '@/config/queryClient'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Link, useNavigate } from 'react-router-dom'
import { Upload, Eye, Trash2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useJobPoller } from '@/hooks/useJobPoller'

export default function PapersManagePage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  
  // Job polling for uploading paper
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  
  useJobPoller(activeJobId, {
    onComplete: (job) => {
      toast.success('Paper processing completed!')
      setActiveJobId(null)
      queryClient.invalidateQueries({ queryKey: queryKeys.papers.lists() })
    },
    onFailed: (job) => {
      toast.error(`Processing failed: ${job.error_message}`)
      setActiveJobId(null)
      queryClient.invalidateQueries({ queryKey: queryKeys.papers.lists() })
    }
  })

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.papers.list({ page }),
    queryFn: () => papersApi.adminList({ page, per_page: 20 }).then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => papersApi.delete(id),
    onSuccess: () => {
      toast.success('Paper deleted')
      queryClient.invalidateQueries({ queryKey: queryKeys.papers.lists() })
    }
  })

  return (
    <div>
      <PageHeader 
        title="Manage Papers" 
        actions={
          <Button className="gap-2" onClick={() => document.getElementById('file-upload')?.click()}>
            <Upload size={16} /> Upload New Paper
            <input type="file" id="file-upload" className="hidden" accept=".pdf" onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const fd = new FormData()
                fd.append('file', e.target.files[0])
                fd.append('subject_id', 'example-subject-id') // Real form would have a modal to select subject etc.
                fd.append('exam_year', '2023')
                
                toast.promise(
                  papersApi.upload(fd, () => {}).then(res => {
                    setActiveJobId(res.data.data.job_id)
                  }),
                  {
                    loading: 'Uploading...',
                    success: 'Upload successful, processing started!',
                    error: 'Upload failed',
                  }
                )
              }
            }} />
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items.map(paper => (
            <TableRow key={paper.id}>
              <TableCell className="font-medium">{paper.file_name}</TableCell>
              <TableCell>{paper.subject?.name}</TableCell>
              <TableCell>{paper.exam_year}</TableCell>
              <TableCell>
                <Badge variant={
                  paper.processing_status === 'completed' ? 'success' :
                  paper.processing_status === 'failed' ? 'danger' :
                  'info'
                }>
                  {paper.processing_status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/papers/${paper.id}`)}>
                    <Eye size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-danger hover:bg-danger-bg hover:text-danger" onClick={() => deleteMutation.mutate(paper.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {data?.items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-secondary">
                No papers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}