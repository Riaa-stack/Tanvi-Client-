import apiClient from '@/config/api'
import { ApiResponse, PaginatedResponse } from '@/types/api'
import { Bookmark } from '@/types/models'

export const bookmarksApi = {
  list: () =>
    apiClient.get<ApiResponse<PaginatedResponse<Bookmark>>>('/api/v1/student/bookmarks'),

  create: (body: any) =>
    apiClient.post<ApiResponse<Bookmark>>('/api/v1/student/bookmarks', body),

  delete: (bookmarkId: string) =>
    apiClient.delete(`/api/v1/student/bookmarks/${bookmarkId}`),
}
