export * from './enums'
import { UserRole, ProcessingStatus, DifficultyLevel, QuestionType, BookmarkEntityType, RecommendationType, JobType, JobStatus } from './enums'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface Semester {
  id: string
  name: string
  number: number
  academic_year: string | null
  is_active: boolean
}

export interface Subject {
  id: string
  name: string
  code: string
  description: string | null
  semester_id: string
  semester?: Semester
  is_active: boolean
}

export interface Topic {
  id: string
  unit_id: string
  subject_id: string
  name: string
  description: string | null
  is_important: boolean
}

export interface Unit {
  id: string
  subject_id: string
  unit_number: number
  title: string
  description: string | null
  weightage_percentage: number | null
  topics?: Topic[]
}

export interface Paper {
  id: string
  subject_id: string
  subject?: Subject
  semester_id: string | null
  exam_year: number
  exam_month: string | null
  exam_type: string | null
  total_marks: number | null
  duration_minutes: number | null
  file_name: string
  processing_status: ProcessingStatus
  processing_job_id: string | null
  page_count: number | null
  uploaded_by: string | null
  created_at: string
  question_count?: number
}

export interface Question {
  id: string
  paper_id: string
  subject_id: string | null
  unit_id: string | null
  topic_id: string | null
  cluster_id: string | null
  question_text: string
  question_number: string | null
  marks: number | null
  difficulty: DifficultyLevel | null
  difficulty_confidence: number | null
  exam_year: number | null
  question_type: QuestionType | null
  is_repeated: boolean
  repeat_count: number
  topic?: Topic
  unit?: Unit
}

export interface PredictedQuestion {
  id: string
  topic_id: string
  subject_id: string
  unit_id: string
  question_text: string
  marks_estimated: number | null
  difficulty_estimated: DifficultyLevel | null
  probability_score: number | null
  generation_rationale: string | null
  is_ai_generated: true
  ai_disclaimer: string
  topic?: Topic
  unit?: Unit
}

export interface ProcessingJob {
  id: string
  job_type: JobType
  status: JobStatus
  progress_pct: number
  current_stage: string | null
  stages_completed: string[]
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface TopicTrend {
  topic_id: string
  topic_name: string
  unit_title: string
  exam_year: number
  question_count: number
  total_marks: number
  avg_difficulty: DifficultyLevel | null
}

export interface ProbabilityScore {
  topic_id: string
  topic_name: string
  unit_title: string
  probability: number
  confidence: number
  rationale: string | null
  contributing_factors: Record<string, any>
  computed_at: string
}

export interface UnitWeightage {
  unit_id: string
  unit_title: string
  unit_number: number
  total_marks: number
  question_count: number
  paper_count: number
  weightage_percentage: number
}

export interface QuestionCluster {
  id: string
  cluster_label: string
  question_count: number
  topic?: Topic
  representative_question?: Question
}

export interface SearchResult {
  question_id: string
  question_text: string
  marks: number | null
  difficulty: DifficultyLevel | null
  exam_year: number | null
  paper_id: string
  subject_id: string
  unit_id: string | null
  topic_id: string | null
  topic_name: string | null
  unit_title: string | null
  relevance_score: number
  is_repeated: boolean
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context_questions?: Question[]
}

export interface Recommendation {
  id: string
  entity_type: RecommendationType
  entity_id: string
  score: number
  reason: string | null
  topic?: Topic
  expires_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  entity_type: BookmarkEntityType
  entity_id: string
  note: string | null
  created_at: string
  entity?: Question | Paper | Topic
}

export interface AdminDashboard {
  total_papers: number
  total_questions: number
  total_subjects: number
  total_students: number
  papers_by_status: Record<ProcessingStatus, number>
  papers_this_month: number
  top_searched_topics: Array<{ topic_name: string; count: number }>
  ingestion_by_month: Array<{ month: string; count: number }>
  avg_difficulty_by_subject: Array<{ subject_name: string; easy: number; medium: number; hard: number }>
}
