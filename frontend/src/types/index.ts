/**
 * src/types/index.ts — Core TypeScript definitions for EduArchive AI 2.0 frontend
 */

export type UserRole = 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  last_login_at?: string | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AcademicSemester {
  id: string;
  number: number;
  name: string;
}

export interface AcademicBranch {
  id: string;
  name: string;
  code: string;
}

export interface AcademicSubject {
  id: string;
  name: string;
  code?: string | null;
  university?: string | null;
  description?: string | null;
}

export interface AcademicScope {
  id: string;
  university: string;
  college: string;
  branch_id: string;
  semester_id: string;
  subject_id: string;
  branch?: AcademicBranch;
  semester?: AcademicSemester;
  subject?: AcademicSubject;
}

export type PaperStatus =
  | 'UPLOADED'
  | 'VALIDATING'
  | 'EXTRACTING'
  | 'OCR_PROCESSING'
  | 'STRUCTURING'
  | 'EMBEDDING'
  | 'ANALYZING'
  | 'HISTORICAL_UPDATE'
  | 'READY'
  | 'FAILED';

export type QuestionType =
  | 'THEORY'
  | 'NUMERICAL'
  | 'CONCEPTUAL'
  | 'DESCRIPTIVE'
  | 'DEFINITION'
  | 'DERIVATION'
  | 'PROGRAMMING'
  | 'DIAGRAM'
  | 'SHORT_ANSWER'
  | 'LONG_ANSWER'
  | 'MIXED'
  | 'UNKNOWN';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'UNKNOWN';

export interface PaperQuestion {
  id: string;
  paper_id: string;
  question_number?: string | null;
  question_text: string;
  marks?: number | null;
  section?: string | null;
  unit?: string | null;
  topic?: string | null;
  subtopic?: string | null;
  difficulty: DifficultyLevel;
  question_type: QuestionType;
  page_number?: number | null;
}

export interface TopicAnalysisItem {
  topic: string;
  importance?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  frequency?: number;
  marks_contribution?: number;
  percentage?: number;
  papers_count?: number;
  sample_questions?: string[];
  page_numbers?: number[];
}

export interface StudyRecommendationItem {
  priority: number;
  topic: string;
  reason: string;
  study_order?: number;
  action_plan?: string;
}

export interface PotentialQuestionItem {
  question: string;
  label?: string;
  basis?: string;
  topic?: string;
  unit?: string;
  estimated_marks?: number;
}

export interface PaperAnalysis {
  paper_id: string;
  topic_analysis?: {
    major_topics?: TopicAnalysisItem[];
    topic_count?: number;
  } | null;
  difficulty_analysis?: {
    easy?: number;
    medium?: number;
    hard?: number;
    unknown?: number;
    distribution_percentage?: {
      easy: number;
      medium: number;
      hard: number;
    };
  } | null;
  mark_distribution?: {
    total_marks?: number;
    high_weight_questions?: Array<{
      question_number?: string;
      marks?: number;
      topic?: string;
    }>;
    by_unit?: Record<string, { marks: number; question_count: number }>;
    by_section?: Record<string, any>;
  } | null;
  unit_distribution?: Record<string, { marks: number; question_count: number }> | null;
  question_type_distribution?: Record<string, number> | null;
  repetition_analysis?: any;
  study_recommendations?: StudyRecommendationItem[] | null;
  potential_questions?: PotentialQuestionItem[] | null;
  exam_trends?: {
    overall_trend?: string;
    insights?: string[];
  } | null;
  generated_at?: string | null;
  model_name?: string | null;
}

export interface Paper {
  id: string;
  title: string;
  original_filename: string;
  stored_filename?: string;
  year: number;
  semester?: AcademicSemester;
  branch?: AcademicBranch;
  subject?: AcademicSubject;
  academic_scope_id?: string | null;
  status: PaperStatus;
  processing_stage?: string | null;
  processing_progress: number;
  processing_message?: string | null;
  page_count?: number | null;
  language?: string;
  uploaded_at: string;
  processed_at?: string | null;
  failure_reason?: string | null;
  questions?: PaperQuestion[];
  teacher_id?: string;
}

export type EvidenceLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface RepetitionOccurrence {
  id: string;
  group_id: string;
  question_id: string;
  paper_id: string;
  year: number;
  similarity_score: number;
}

export interface RepetitionGroup {
  id: string;
  academic_scope_id: string;
  canonical_question: string;
  concept_label?: string | null;
  occurrence_count: number;
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  topic?: string | null;
  unit?: string | null;
  years?: number[] | null;
  occurrences?: RepetitionOccurrence[];
}

export interface SubjectHistoricalAnalysis {
  academic_scope_id: string;
  papers_count: number;
  evidence_level: EvidenceLevel;
  topic_frequency?: Record<
    string,
    { count: number; papers: string[]; total_marks: number }
  > | null;
  unit_importance?: Record<
    string,
    { total_marks: number; question_count: number; paper_count: number; importance: string }
  > | null;
  marks_distribution?: {
    by_year?: Record<string, number>;
    frequency?: Record<string, number>;
    total_questions_analyzed?: number;
  } | null;
  difficulty_trends?: Record<
    string,
    { EASY: number; MEDIUM: number; HARD: number; distribution: { EASY: number; MEDIUM: number; HARD: number } }
  > | null;
  question_type_trends?: Record<string, Record<string, number>> | null;
  repetition_clusters?: RepetitionGroup[] | null;
  study_recommendations?: StudyRecommendationItem[] | null;
  potential_patterns?: PotentialQuestionItem[] | null;
  historical_trends?: any;
  generated_at?: string | null;
}

export type NoteStatus =
  | 'UPLOADED'
  | 'VALIDATING'
  | 'EXTRACTING'
  | 'OCR_PROCESSING'
  | 'STRUCTURING'
  | 'EMBEDDING'
  | 'ANALYZING'
  | 'READY'
  | 'FAILED';

export interface NoteAnalysis {
  note_id: string;
  key_concepts?: Array<{ concept: string; definition: string }>;
  important_points?: string[];
  summary?: {
    quick?: string;
    detailed?: string;
    exam?: string;
  };
  detected_topics?: string[];
  detected_units?: string[];
  generated_at?: string;
  model_name?: string;
}

export interface Note {
  id: string;
  student_id: string;
  title: string;
  original_filename: string;
  stored_filename?: string;
  page_count?: number | null;
  status: NoteStatus;
  processing_stage?: string | null;
  processing_progress: number;
  processing_message?: string | null;
  uploaded_at: string;
  processed_at?: string | null;
  failure_reason?: string | null;
  analysis?: NoteAnalysis | null;
}

export interface FlashcardItem {
  front: string;
  back: string;
  concept?: string;
  unit?: string;
  difficulty?: string;
}

export interface QuizQuestionItem {
  question_number?: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  topic?: string;
  unit?: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  type?: string;
  description?: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}

export interface DiagramData {
  diagram_type: string;
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  note_id?: string;
}

export interface SourceCitation {
  type?: 'question' | 'chunk';
  paper_id?: string;
  year?: number;
  question_number?: string;
  page?: number;
  page_number?: number;
  similarity?: number;
  text?: string;
  topic?: string;
}

export interface RAGResponse {
  answer: string;
  evidence_level?: EvidenceLevel;
  confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
  sources: SourceCitation[];
  related_questions?: Array<{
    question_text: string;
    paper_id?: string;
    year?: number;
    marks?: number;
    topic?: string;
    similarity?: number;
  }>;
  related_papers?: Array<{
    paper_id: string;
    year?: number;
    subject_id?: string;
  }>;
  used_fallback: boolean;
  decision?: any;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role?: string;
  sender?: string;
  content: string;
  evidence?: SourceCitation[] | null;
  sources_cited?: SourceCitation[] | any[];
  used_fallback?: boolean;
  evidence_level?: EvidenceLevel | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  paper_id?: string | null;
  subject_id?: string | null;
  academic_scope_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  pagination: PaginationMeta;
  [key: string]: any; // e.g. "papers": T[], "notes": T[]
}

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
