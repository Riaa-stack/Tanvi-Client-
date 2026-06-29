import apiClient from '@/config/api'
import { ApiResponse } from '@/types/api'
import { Recommendation } from '@/types/models'

export const studentApi = {
  logActivity: (body: any) =>
    apiClient.post<ApiResponse<any>>('/api/v1/student/activity', body),

  getActivity: () =>
    apiClient.get<ApiResponse<any[]>>('/api/v1/student/activity'),

  getRecommendations: () =>
    apiClient.get<ApiResponse<Recommendation[]>>('/api/v1/student/recommendations'),

  dismissRecommendation: (recId: string) =>
    apiClient.post<ApiResponse<any>>(`/api/v1/student/recommendations/${recId}/dismiss`),
}
