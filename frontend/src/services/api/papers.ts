import { apiClient } from './client';
import {
  APIResponse,
  PaginatedResponse,
  Paper,
  PaperAnalysis,
  PaperQuestion,
  SubjectHistoricalAnalysis,
  AcademicSubject,
} from '@/types';

export const papersApi = {
  // ── Teacher endpoints ──────────────────────────────────────────────────────
  uploadPaper: async (formData: FormData) => {
    const res = await apiClient.post<APIResponse<{ paper_id: string; status: string; processing_progress: number }>>(
      '/teacher/papers',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  getTeacherPapers: async (page = 1, pageSize = 20) => {
    const res = await apiClient.get<PaginatedResponse<Paper>>('/teacher/papers', {
      params: { page, page_size: pageSize },
    });
    return res.data;
  },

  getTeacherPaper: async (paperId: string) => {
    const res = await apiClient.get<APIResponse<Paper>>(`/teacher/papers/${paperId}`);
    return res.data;
  },

  getTeacherPaperAnalysis: async (paperId: string) => {
    const res = await apiClient.get<APIResponse<PaperAnalysis>>(`/teacher/papers/${paperId}/analysis`);
    return res.data;
  },

  deletePaper: async (paperId: string) => {
    const res = await apiClient.delete<APIResponse<{ message: string }>>(`/teacher/papers/${paperId}`);
    return res.data;
  },

  retryPaperProcessing: async (paperId: string) => {
    const res = await apiClient.post<APIResponse<{ paper_id: string; status: string }>>(
      `/teacher/papers/${paperId}/retry-processing`
    );
    return res.data;
  },

  getTeacherDashboard: async () => {
    const res = await apiClient.get<
      APIResponse<{
        statistics: { total: number; ready: number; processing: number; failed: number };
        recent_papers: Paper[];
      }>
    >('/teacher/dashboard');
    return res.data;
  },

  // ── Student endpoints ──────────────────────────────────────────────────────
  getStudentPapers: async (params?: {
    year?: number;
    subject_id?: string;
    branch_id?: string;
    semester_id?: string;
    college?: string;
    university?: string;
    academic_scope_id?: string;
    page?: number;
    page_size?: number;
  }) => {
    const res = await apiClient.get<PaginatedResponse<Paper>>('/student/papers', { params });
    return res.data;
  },

  getStudentPaper: async (paperId: string) => {
    const res = await apiClient.get<APIResponse<Paper>>(`/student/papers/${paperId}`);
    return res.data;
  },

  getPaperStatus: async (paperId: string) => {
    const res = await apiClient.get<
      APIResponse<{
        paper_id: string;
        status: string;
        stage: string | null;
        progress: number;
        message: string | null;
        is_ready: boolean;
        is_failed: boolean;
        failure_reason: string | null;
      }>
    >(`/student/papers/${paperId}/status`);
    return res.data;
  },

  getPaperAnalysis: async (paperId: string) => {
    const res = await apiClient.get<APIResponse<PaperAnalysis>>(`/student/papers/${paperId}/analysis`);
    return res.data;
  },

  getPaperQuestions: async (paperId: string, params?: { difficulty?: string; question_type?: string; unit?: string }) => {
    const res = await apiClient.get<APIResponse<{ paper_id: string; questions: PaperQuestion[]; total: number }>>(
      `/student/papers/${paperId}/questions`,
      { params }
    );
    return res.data;
  },

  getStudyGuide: async (paperId: string) => {
    const res = await apiClient.get<
      APIResponse<{
        paper_id: string;
        analysis: PaperAnalysis | null;
        historical: any | null;
        study_recommendations: any[];
        potential_questions: any[];
      }>
    >(`/student/papers/${paperId}/study-guide`);
    return res.data;
  },

  getSubjects: async (university?: string) => {
    const res = await apiClient.get<APIResponse<{ subjects: AcademicSubject[] }>>('/student/subjects', {
      params: { university },
    });
    return res.data;
  },

  getHistoricalAnalysis: async (academicScopeId: string) => {
    const res = await apiClient.get<
      APIResponse<{
        available: boolean;
        evidence_level?: string;
        papers_count?: number;
        data?: SubjectHistoricalAnalysis;
        fallback?: any;
        message?: string;
      }>
    >(`/student/historical/${academicScopeId}`);
    return res.data;
  },

  searchQuestions: async (params: {
    q?: string;
    subject_id?: string;
    branch_id?: string;
    semester_id?: string;
    difficulty?: string;
    question_type?: string;
    marks?: number;
    year?: number;
    page?: number;
    page_size?: number;
  }) => {
    const res = await apiClient.get<PaginatedResponse<PaperQuestion>>('/student/questions/search', { params });
    return res.data;
  },

  getPaperFlashcards: async (paperId: string, count = 10) => {
    const res = await apiClient.get<APIResponse<{ flashcards: any[]; total_count: number }>>(
      `/student/papers/${paperId}/flashcards`,
      { params: { count } }
    );
    return res.data;
  },

  getPaperQuiz: async (paperId: string, count = 10) => {
    const res = await apiClient.get<APIResponse<{ quiz_questions: any[]; total_questions: number }>>(
      `/student/papers/${paperId}/quiz`,
      { params: { count } }
    );
    return res.data;
  },

  getSubjectFlashcards: async (subjectId: string, count = 10) => {
    const res = await apiClient.get<APIResponse<{ flashcards: any[]; total_count: number }>>(
      `/student/subjects/${subjectId}/flashcards`,
      { params: { count } }
    );
    return res.data;
  },

  getSubjectQuiz: async (subjectId: string, count = 10) => {
    const res = await apiClient.get<APIResponse<{ quiz_questions: any[]; total_questions: number }>>(
      `/student/subjects/${subjectId}/quiz`,
      { params: { count } }
    );
    return res.data;
  },
};
