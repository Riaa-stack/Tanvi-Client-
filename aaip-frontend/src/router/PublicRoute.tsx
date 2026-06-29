import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { UserRole } from '@/types/enums'

export function PublicRoute() {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user) {
    if (user.role === UserRole.STUDENT) {
      return <Navigate to="/dashboard" replace />
    } else {
      return <Navigate to="/admin" replace />
    }
  }

  return <Outlet />
}
