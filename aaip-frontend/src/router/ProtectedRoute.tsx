import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { UserRole } from '@/types/enums'

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page p-4">
        <div className="card-base max-w-md w-full text-center py-10">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-secondary mb-6">You do not have permission to view this page.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <Outlet />
}
