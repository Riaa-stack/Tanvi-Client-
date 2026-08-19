import apiClient from '@/config/api'
import {
  ApiResponse,
  SearchRequest,
} from '@/types/api'
import { SearchResult } from '@/types/models'

export const searchApi = {
  search: (params: SearchRequest) =>
    apiClient.get<
      ApiResponse<{
        results: SearchResult[]
        metadata: any
      }>
    >(
      '/api/v1/search',
      {
        params: {
          q: params.query,
          subject_id: params.subject_id,
          unit_id: params.unit_id,
          difficulty: params.difficulty,
          year_from: params.year_from,
          year_to: params.year_to,
          top_k: params.top_k,
        },
      }
    ),
}