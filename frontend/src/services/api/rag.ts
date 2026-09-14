import { apiClient } from './client';
import { APIResponse, RAGResponse } from '@/types';

export const ragApi = {
  query: async (payload: {
    question: string;
    scope?: {
      paper_id?: string;
      subject_id?: string;
      branch_id?: string;
      semester_id?: string;
      academic_scope_id?: string;
      year?: number;
    };
    n_results?: number;
  }) => {
    const res = await apiClient.post<APIResponse<RAGResponse>>('/rag/query', {
      question: payload.question,
      ...(payload.scope || {}),
      n_results: payload.n_results,
    });
    return res.data;
  },
};
