import { apiClient } from './client';
import { APIResponse, ChatMessage, ChatSession, PaginatedResponse, RAGResponse } from '@/types';

export const chatApi = {
  createSession: async (payload: {
    title?: string;
    paper_id?: string;
    subject_id?: string;
    academic_scope_id?: string;
  }) => {
    const res = await apiClient.post<APIResponse<ChatSession>>('/chat/sessions', payload);
    return res.data;
  },

  getSessions: async (page = 1, pageSize = 20) => {
    const res = await apiClient.get<PaginatedResponse<ChatSession>>('/chat/sessions', {
      params: { page, page_size: pageSize },
    });
    return res.data;
  },

  getSession: async (sessionId: string) => {
    const res = await apiClient.get<APIResponse<ChatSession & { messages: ChatMessage[] }>>(
      `/chat/sessions/${sessionId}`
    );
    return res.data;
  },

  sendMessage: async (sessionId: string, content: string) => {
    const res = await apiClient.post<
      APIResponse<{
        user_message: ChatMessage;
        assistant_message: ChatMessage;
        sources: any[];
        evidence_level?: string;
        used_fallback?: boolean;
      }>
    >(`/chat/sessions/${sessionId}/messages`, { content });
    return res.data;
  },

  askOneShot: async (payload: { question: string; [key: string]: any }) => {
    const res = await apiClient.post<APIResponse<RAGResponse>>('/chat/ask', payload);
    return res.data;
  },
};
