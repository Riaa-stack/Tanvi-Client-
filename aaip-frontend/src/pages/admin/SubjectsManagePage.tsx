import React from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { subjectsApi } from '@/api/subjects.api'
import { queryKeys } from '@/config/queryClient'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Plus, Edit } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SubjectsManagePage() {
  const navigate = useNavigate()
  
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.subjects.list(),
    queryFn: () => subjectsApi.list({}).then(r => r.data.data),
  })

  return (
    <div>
      <PageHeader 
        title="Manage Subjects" 
        actions={
          <Button className="gap-2">
            <Plus size={16} /> New Subject
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Syllabus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items.map(subject => (
            <TableRow key={subject.id}>
              <TableCell className="font-medium">{subject.code}</TableCell>
              <TableCell>{subject.name}</TableCell>
              <TableCell>{subject.semester?.number || 'N/A'}</TableCell>
              <TableCell>
                <span className={`w-2 h-2 rounded-full inline-block mr-2 ${subject.is_active ? 'bg-success' : 'bg-danger'}`}></span>
                {subject.is_active ? 'Active' : 'Inactive'}
              </TableCell>
              <TableCell>
                <Button variant="secondary" size="sm" className="gap-2" onClick={() => navigate(`/admin/subjects/${subject.id}/syllabus`)}>
                  <Edit size={14} /> Edit Syllabus
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}