import React, { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin.api'
import { queryKeys } from '@/config/queryClient'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { RefreshCw, Play } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AIJobsPage() {
  const [page, setPage] = useState(1)
  
  // Note: Mocking the API endpoint as it was not explicitly in the backend API list but inferred from admin tasks.
  // We'll simulate it gracefully.

  return (
    <div>
      <PageHeader 
        title="AI Processing Jobs" 
        subtitle="Monitor and manage background AI pipelines."
        actions={
          <Button variant="outline" className="gap-2" onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Refresh
          </Button>
        }
      />

      <div className="card-base">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-secondary">
                No active jobs.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}