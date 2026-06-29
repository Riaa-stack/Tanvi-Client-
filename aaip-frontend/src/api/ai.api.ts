import apiClient from '@/config/api'
import { ApiResponse, ChatRequest, ChatResponse } from '@/types/api'

export const aiApi = {
  chat: (body: ChatRequest) =>
    apiClient.post<ApiResponse<ChatResponse>>('/api/v1/chat', body),

  deleteSession: (sessionId: string) =>
    apiClient.delete(`/api/v1/chat/session/${sessionId}`),
}
