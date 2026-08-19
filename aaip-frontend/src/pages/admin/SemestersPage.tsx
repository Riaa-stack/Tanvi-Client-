import React from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { subjectsApi } from '@/api/subjects.api'
import { queryKeys } from '@/config/queryClient'
import { Button } from '@/components/ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/Table'
import { Plus, Edit } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SemestersPage() {
  const navigate = useNavigate()

  const {
    data: semestersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.admin.semesters.all,

    queryFn: async () => {
      const response = await subjectsApi.listSemesters()

      console.log(
        'Semesters API response:',
        response.data
      )

      return response.data.data
    },
  })

  const semesters = Array.isArray(semestersData)
    ? semestersData
    : (semestersData as any)?.items ?? []

  return (
    <div>

      <PageHeader
        title="Manage Semesters"
        actions={
          <Button
            className="gap-2"
            onClick={() => navigate('/admin/semesters/new')}
          >
            <Plus size={16} />
            New Semester
          </Button>
        }
      />

      {isLoading && (
        <div className="text-center py-8 text-secondary">
          Loading semesters...
        </div>
      )}

      {isError && (
        <div className="text-center py-8 text-danger">
          Failed to load semesters.
        </div>
      )}

      {!isLoading && !isError && (

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

            {semesters.map((sem: any) => (

              <TableRow key={sem.id}>

                <TableCell className="font-medium">
                  {sem.number}
                </TableCell>

                <TableCell>
                  {sem.name}
                </TableCell>

                <TableCell>
                  {sem.academic_year || 'N/A'}
                </TableCell>

                <TableCell>

                  <span
                    className={`w-2 h-2 rounded-full inline-block mr-2 ${
                      sem.is_active
                        ? 'bg-success'
                        : 'bg-danger'
                    }`}
                  />

                  {sem.is_active
                    ? 'Active'
                    : 'Inactive'}

                </TableCell>

                <TableCell>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    <Edit size={14} />
                  </Button>

                </TableCell>

              </TableRow>

            ))}

            {semesters.length === 0 && (

              <TableRow>

                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-secondary"
                >
                  No semesters configured.
                </TableCell>

              </TableRow>

            )}

          </TableBody>

        </Table>

      )}

    </div>
  )
}