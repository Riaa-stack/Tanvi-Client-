import { User, Paper, Question, DifficultyLevel } from './models'

export interface ApiResponse<T> {
  success: true
  data: T
  meta?: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    detail?: any
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// Auth
export interface LoginRequest { email: string; password: string }
export interface RegisterRequest { email: string; password: string; full_name: string }
export interface AuthTokens { access_token: string; refresh_token: string; user: User }

// Papers
export interface PaperUploadRequest {
  subject_id: string
  exam_year: number
  exam_month?: string
  exam_type?: string
  total_marks?: number
  duration_minutes?: number
  file: File
}

export interface PaperListParams {
  subject_id?: string
  semester_id?: string
  exam_year?: number
  exam_type?: string
  page?: number
  per_page?: number
}

export interface QuestionFilterParams {
  unit_id?: string
  topic_id?: string
  difficulty?: DifficultyLevel
  question_type?: string
  page?: number
  per_page?: number
}

// Search
export interface SearchRequest {
  query: string
  subject_id?: string
  unit_id?: string
  difficulty?: DifficultyLevel
  year_from?: number
  year_to?: number
  top_k?: number
}

// Chat
export interface ChatRequest {
  message: string
  subject_id: string
  session_id?: string
}

export interface ChatResponse {
  reply: string
  session_id: string
  context_questions: Question[]
  sources: string[]
}
