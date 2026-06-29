import apiClient from '@/config/api'
import { ApiResponse } from '@/types/api'
import { Unit } from '@/types/models'

export const syllabusApi = {
  get: (subjectId: string) =>
    apiClient.get<ApiResponse<{ subject_id: string; units: Unit[] }>>(`/api/v1/syllabus/subjects/${subjectId}/syllabus`),

  replace: (subjectId: string, units: any[]) =>
    apiClient.post<ApiResponse<{ subject_id: string; units: Unit[] }>>(`/api/v1/syllabus/subjects/${subjectId}/syllabus`, { units }),
}
