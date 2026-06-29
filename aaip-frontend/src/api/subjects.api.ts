import apiClient from '@/config/api'
import { ApiResponse, PaginatedResponse } from '@/types/api'
import { Subject, Semester } from '@/types/models'

export const subjectsApi = {
  list: (params?: { semester_id?: string; active_only?: boolean }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Subject>>>('/api/v1/syllabus/subjects', { params }),

  detail: (subjectId: string) =>
    apiClient.get<ApiResponse<Subject>>(`/api/v1/syllabus/subjects/${subjectId}`),

  create: (body: Partial<Subject>) =>
    apiClient.post<ApiResponse<Subject>>('/api/v1/syllabus/subjects', body),

  update: (subjectId: string, body: Partial<Subject>) =>
    apiClient.put<ApiResponse<Subject>>(`/api/v1/syllabus/subjects/${subjectId}`, body),

  delete: (subjectId: string) =>
    apiClient.delete(`/api/v1/syllabus/subjects/${subjectId}`),

  listSemesters: () =>
    apiClient.get<ApiResponse<PaginatedResponse<Semester>>>('/api/v1/syllabus/semesters'),
}
