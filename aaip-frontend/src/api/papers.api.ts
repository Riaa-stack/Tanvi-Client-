import apiClient from '@/config/api'
import { ApiResponse, PaginatedResponse, PaperListParams, QuestionFilterParams } from '@/types/api'
import { Paper, Question, ProcessingJob } from '@/types/models'

export const papersApi = {
  list: (params: PaperListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<Paper>>>('/api/v1/papers', { params }),

  detail: (paperId: string) =>
    apiClient.get<ApiResponse<Paper>>(`/api/v1/papers/${paperId}`),

  questions: (paperId: string, params: QuestionFilterParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<Question>>>(`/api/v1/papers/${paperId}/questions`, { params }),

  // Admin endpoints
  upload: (formData: FormData, onProgress: (pct: number) => void) =>
    apiClient.post<ApiResponse<{ paper_id: string; job_id: string }>>('/api/v1/papers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress(Math.round((e.loaded / (e.total ?? 1)) * 100)),
    }),

  adminList: (params: PaperListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<Paper>>>('/api/v1/papers', { params }),

  delete: (paperId: string) =>
    apiClient.delete(`/api/v1/papers/${paperId}`),

  reprocess: (paperId: string) =>
    apiClient.post<ApiResponse<{ job_id: string }>>(`/api/v1/papers/${paperId}/reprocess`),

  getJobStatus: (jobId: string) =>
    apiClient.get<ApiResponse<ProcessingJob>>(`/api/v1/analytics/jobs/${jobId}`), // In backend jobs are via analytics or admin
}
