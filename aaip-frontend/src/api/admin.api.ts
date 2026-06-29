import apiClient from '@/config/api'
import { ApiResponse, PaginatedResponse } from '@/types/api'
import { AdminDashboard, User } from '@/types/models'

export const adminApi = {
  getDashboard: () =>
    apiClient.get<ApiResponse<AdminDashboard>>('/api/v1/admin/dashboard'),

  triggerAction: (action: string, payload?: any) =>
    apiClient.post<ApiResponse<{ job_id: string }>>(`/api/v1/admin/actions/${action}`, payload),

  getUsers: (params?: any) =>
    apiClient.get<ApiResponse<PaginatedResponse<User>>>('/api/v1/admin/users', { params }),

  updateUser: (userId: string, body: any) =>
    apiClient.put<ApiResponse<User>>(`/api/v1/admin/users/${userId}`, body),

  deleteUser: (userId: string) =>
    apiClient.delete(`/api/v1/admin/users/${userId}`),
}
