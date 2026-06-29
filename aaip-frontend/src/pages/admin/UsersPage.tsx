import React, { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin.api'
import { queryKeys } from '@/config/queryClient'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Edit } from 'lucide-react'

export default function UsersPage() {
  const [page, setPage] = useState(1)
  
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.users.lists(),
    queryFn: () => adminApi.getUsers({ page, per_page: 20 }).then(r => r.data.data),
  })

  return (
    <div>
      <PageHeader title="Manage Users" subtitle="Super Admin access only." />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items.map(user => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'super_admin' ? 'danger' : user.role === 'admin' ? 'warning' : 'default'}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <span className={`w-2 h-2 rounded-full inline-block mr-2 ${user.is_active ? 'bg-success' : 'bg-danger'}`}></span>
                {user.is_active ? 'Active' : 'Disabled'}
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <Edit size={14} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {data?.meta && data.meta.total_pages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button 
            variant="outline" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm">
            Page {page} of {data.meta.total_pages}
          </span>
          <Button 
            variant="outline" 
            disabled={page === data.meta.total_pages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}