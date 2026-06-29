import apiClient from '@/config/api'
import { ApiResponse } from '@/types/api'
import { UnitWeightage, TopicTrend, ProbabilityScore, QuestionCluster } from '@/types/models'

export const analyticsApi = {
  getUnitWeightage: (subjectId: string) =>
    apiClient.get<ApiResponse<UnitWeightage[]>>(`/api/v1/analytics/subjects/${subjectId}/unit-weightage`),

  getTrends: (subjectId: string) =>
    apiClient.get<ApiResponse<TopicTrend[]>>(`/api/v1/analytics/subjects/${subjectId}/trends`),

  getProbabilities: (subjectId: string) =>
    apiClient.get<ApiResponse<ProbabilityScore[]>>(`/api/v1/analytics/subjects/${subjectId}/probabilities`),

  getClusters: (subjectId: string) =>
    apiClient.get<ApiResponse<QuestionCluster[]>>(`/api/v1/analytics/subjects/${subjectId}/clusters`),

  getDependencyGraph: (subjectId: string) =>
    apiClient.get<ApiResponse<any>>(`/api/v1/analytics/subjects/${subjectId}/dependency-graph`),
}
