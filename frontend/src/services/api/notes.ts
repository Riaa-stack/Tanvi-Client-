import { apiClient } from './client';
import {
  APIResponse,
  DiagramData,
  FlashcardItem,
  Note,
  NoteAnalysis,
  PaginatedResponse,
  QuizQuestionItem,
} from '@/types';

export const notesApi = {
  uploadNote: async (formData: FormData) => {
    const res = await apiClient.post<APIResponse<{ note_id: string; status: string; title: string }>>(
      '/notes',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  getNotes: async (page = 1, pageSize = 20) => {
    const res = await apiClient.get<PaginatedResponse<Note>>('/notes', {
      params: { page, page_size: pageSize },
    });
    return res.data;
  },

  getNote: async (noteId: string) => {
    const res = await apiClient.get<APIResponse<Note>>(`/notes/${noteId}`);
    return res.data;
  },

  deleteNote: async (noteId: string) => {
    const res = await apiClient.delete<APIResponse<{ message: string }>>(`/notes/${noteId}`);
    return res.data;
  },

  getNoteStatus: async (noteId: string) => {
    const res = await apiClient.get<
      APIResponse<{
        note_id: string;
        status: string;
        stage: string | null;
        progress: number;
        message: string | null;
        is_ready: boolean;
        is_failed: boolean;
        failure_reason: string | null;
      }>
    >(`/notes/${noteId}/status`);
    return res.data;
  },

  getNoteAnalysis: async (noteId: string) => {
    const res = await apiClient.get<APIResponse<NoteAnalysis>>(`/notes/${noteId}/analysis`);
    return res.data;
  },

  queryNote: async (noteId: string, question: string) => {
    const res = await apiClient.post<
      APIResponse<{
        answer: string;
        found_in_note: boolean;
        source_chunks: any[];
        confidence: number;
        note_id: string;
      }>
    >(`/notes/${noteId}/query`, { question });
    return res.data;
  },

  summarizeNote: async (noteId: string, mode: 'quick' | 'detailed' | 'exam' = 'quick') => {
    const res = await apiClient.post<
      APIResponse<{
        mode: string;
        summary: string;
        key_takeaways: string[];
        based_on_note_only: boolean;
        note_id: string;
      }>
    >(`/notes/${noteId}/summary`, { mode });
    return res.data;
  },

  getKeyConcepts: async (noteId: string) => {
    const res = await apiClient.get<
      APIResponse<{
        note_id: string;
        key_concepts: Array<{ concept: string; definition: string }>;
        detected_topics: string[];
      }>
    >(`/notes/${noteId}/key-concepts`);
    return res.data;
  },

  getImportantPoints: async (noteId: string) => {
    const res = await apiClient.get<
      APIResponse<{
        note_id: string;
        important_points: string[];
      }>
    >(`/notes/${noteId}/important-points`);
    return res.data;
  },

  getDiagram: async (noteId: string) => {
    const res = await apiClient.get<APIResponse<DiagramData>>(`/notes/${noteId}/diagram`);
    return res.data;
  },

  getFlashcards: async (noteId: string, count = 10) => {
    const res = await apiClient.get<
      APIResponse<{
        flashcards: FlashcardItem[];
        total_count: number;
        note_id: string;
      }>
    >(`/notes/${noteId}/flashcards`, { params: { count } });
    return res.data;
  },

  getQuiz: async (noteId: string, count = 10) => {
    const res = await apiClient.get<
      APIResponse<{
        quiz_questions: QuizQuestionItem[];
        total_questions: number;
        note_id: string;
      }>
    >(`/notes/${noteId}/quiz`, { params: { count } });
    return res.data;
  },

  retryNoteProcessing: async (noteId: string) => {
    const res = await apiClient.post<APIResponse<{ note_id: string; status: string }>>(
      `/notes/${noteId}/retry-processing`
    );
    return res.data;
  },
};
