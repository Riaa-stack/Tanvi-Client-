export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STUDENT = 'student',
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  OCR_COMPLETE = 'ocr_complete',
  EXTRACTION_COMPLETE = 'extraction_complete',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum QuestionType {
  SHORT = 'short',
  LONG = 'long',
  MCQ = 'mcq',
  NUMERICAL = 'numerical',
}

export enum ActivityType {
  VIEW_PAPER = 'view_paper',
  VIEW_TOPIC = 'view_topic',
  SEARCH = 'search',
  BOOKMARK = 'bookmark',
  CHAT = 'chat',
}

export enum BookmarkEntityType {
  QUESTION = 'question',
  PAPER = 'paper',
  TOPIC = 'topic',
}

export enum RecommendationType {
  TOPIC = 'topic',
  QUESTION = 'question',
  PAPER = 'paper',
}

export enum JobType {
  PAPER_INGESTION = 'paper_ingestion',
  BATCH_EMBED = 'batch_embed',
  ANALYTICS_REFRESH = 'analytics_refresh',
  PREDICTION_REFRESH = 'prediction_refresh',
  CLUSTERING = 'clustering',
  DEPENDENCY_GRAPH = 'dependency_graph',
}

export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export const AI_DISCLAIMER = 'AI Generated Practice Question — Not an actual exam question'
