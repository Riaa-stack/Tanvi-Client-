import apiClient from '@/config/api'
import { ApiResponse } from '@/types/api'
import { PredictedQuestion } from '@/types/models'

export const predictionsApi = {
  getPredictions: (subjectId: string, params?: { topic_id?: string; unit_id?: string; difficulty?: string }) =>
    apiClient.get<ApiResponse<PredictedQuestion[]>>(`/api/v1/analytics/subjects/${subjectId}/predictions`, { params }),
}
