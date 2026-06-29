import React from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { subjectsApi } from '@/api/subjects.api'
import { queryKeys } from '@/config/queryClient'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Plus, Edit } from 'lucide-react'

export default function SemestersPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.semesters.all,
    queryFn: () => subjectsApi.listSemesters().then(r => r.data.data),
  })

  return (
    <div>
      <PageHeader 
        title="Manage Semesters" 
        actions={
          <Button className="gap-2">
            <Plus size={16} /> New Semester
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Semester Number</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items.map(sem => (
            <TableRow key={sem.id}>
              <TableCell className="font-medium">{sem.number}</TableCell>
              <TableCell>{sem.name}</TableCell>
              <TableCell>{sem.academic_year || 'N/A'}</TableCell>
              <TableCell>
                <span className={`w-2 h-2 rounded-full inline-block mr-2 ${sem.is_active ? 'bg-success' : 'bg-danger'}`}></span>
                {sem.is_active ? 'Active' : 'Inactive'}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Edit size={14} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {data?.items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-secondary">
                No semesters configured.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}