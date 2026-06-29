import apiClient from '@/config/api'
import { ApiResponse, LoginRequest, RegisterRequest, AuthTokens } from '@/types/api'
import { User } from '@/types/models'

export const authApi = {
  login: (body: LoginRequest) =>
    apiClient.post<ApiResponse<AuthTokens>>('/api/v1/auth/login', body),

  register: (body: RegisterRequest) =>
    apiClient.post<ApiResponse<User>>('/api/v1/auth/register', body),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ access_token: string }>>('/api/v1/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    }),

  logout: () =>
    apiClient.post('/api/v1/auth/logout'),

  getMe: () =>
    apiClient.get<ApiResponse<User>>('/api/v1/auth/me'),

  changePassword: (body: { current_password: string; new_password: string }) =>
    apiClient.post('/api/v1/auth/change-password', body),
}
