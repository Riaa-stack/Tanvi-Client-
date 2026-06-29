import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/api/auth.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LoginRequest, RegisterRequest } from '@/types/api'
import { queryKeys } from '@/config/queryClient'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export function useAuth() {
  const { user, isAuthenticated, setTokens, setUser, logout } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data).then(r => r.data.data),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      setUser(data.user)
      if (data.user.role === 'student') navigate('/dashboard')
      else navigate('/admin')
    },
    onError: () => {
      // Inline error handled in component
    }
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data).then(r => r.data.data),
    onSuccess: () => {
      toast.success('Account created. Please log in.')
      navigate('/login')
    }
  })

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout()
      queryClient.clear()
      navigate('/login')
    }
  })

  const { data: me, isLoading: isLoadingMe } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authApi.getMe().then(r => r.data.data),
    enabled: isAuthenticated,
  })

  return {
    user: me || user,
    isAuthenticated,
    isLoadingMe,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
  }
}
