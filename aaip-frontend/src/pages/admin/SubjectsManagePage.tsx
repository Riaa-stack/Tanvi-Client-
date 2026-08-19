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
import { Subject } from '@/types/models'

export default function SubjectsManagePage() {
  const navigate = useNavigate()

  const {
    data: subjectsData,
    isLoading,
    isError,
    error,
  } = useQuery<Subject[]>({
    queryKey: queryKeys.subjects.list(),

    queryFn: async () => {
      const response = await subjectsApi.list({})

      console.log(
        'Subjects API response:',
        response.data
      )

      const responseData = response.data.data

      // Backend response is:
      // {
      //   data: [],
      //   status: "success"
      // }

      if (Array.isArray(responseData)) {
        return responseData
      }

      return responseData?.items ?? []
    },
  })

  const subjects = subjectsData ?? []

  return (
    <div>
      <PageHeader
        title="Manage Subjects"
        actions={
          <Button
            className="gap-2"
            onClick={() => navigate('/admin/subjects/new')}
          >
            <Plus size={16} />
            New Subject
          </Button>
        }
      />

      {isLoading && (
        <div className="py-10 text-center text-secondary">
          Loading subjects...
        </div>
      )}

      {isError && (
        <div className="py-10 text-center text-danger">
          Failed to load subjects.
          {error instanceof Error && (
            <p className="mt-2 text-sm">
              {error.message}
            </p>
          )}
        </div>
      )}

      {!isLoading && !isError && (
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
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">
                    {subject.code}
                  </TableCell>

                  <TableCell>
                    {subject.name}
                  </TableCell>

                  <TableCell>
                    {subject.semester?.number ?? 'N/A'}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`w-2 h-2 rounded-full inline-block mr-2 ${
                        subject.is_active
                          ? 'bg-success'
                          : 'bg-danger'
                      }`}
                    />

                    {subject.is_active
                      ? 'Active'
                      : 'Inactive'}
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        navigate(
                          `/admin/subjects/${subject.id}/syllabus`
                        )
                      }
                    >
                      <Edit size={14} />
                      Edit Syllabus
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-secondary"
                >
                  No subjects found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}