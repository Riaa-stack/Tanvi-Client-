import apiClient from '@/config/api'
import {
  ApiResponse,
  PaginatedResponse,
  PaperListParams,
  QuestionFilterParams,
} from '@/types/api'
import {
  Paper,
  Question,
  ProcessingJob,
} from '@/types/models'

export const papersApi = {

  // ============================================================
  // STUDENT - GET PAPERS BY SUBJECT
  // Backend:
  // GET /api/v1/papers/<subject_id>
  // ============================================================

  list: (
    params: PaperListParams & {
      subject_id?: string
    }
  ) => {
    const { subject_id, ...queryParams } = params

    if (!subject_id) {
      throw new Error('subject_id is required to fetch papers')
    }

    return apiClient.get<
      ApiResponse<PaginatedResponse<Paper>>
    >(
      `/api/v1/papers/${subject_id}`,
      {
        params: queryParams,
      }
    )
  },

  // ============================================================
  // GET SINGLE PAPER
  // Backend:
  // GET /api/v1/papers/detail/<paper_id>
  // ============================================================

  detail: (paperId: string) =>
    apiClient.get<ApiResponse<Paper>>(
      `/api/v1/papers/detail/${paperId}`
    ),

  // ============================================================
  // GET QUESTIONS FOR PAPER
  // Backend:
  // GET /api/v1/questions/paper/<paper_id>
  // ============================================================

  questions: (
    paperId: string,
    params: QuestionFilterParams
  ) =>
    apiClient.get<
      ApiResponse<PaginatedResponse<Question>>
    >(
      `/api/v1/questions/paper/${paperId}`,
      {
        params,
      }
    ),

  // ============================================================
  // ADMIN - UPLOAD PAPER
  // Backend:
  // POST /api/v1/papers
  // ============================================================

  upload: (
    formData: FormData,
    onProgress: (pct: number) => void
  ) =>
    apiClient.post<
      ApiResponse<{
        paper_id: string
        job_id: string
      }>
    >(
      '/api/v1/papers',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },

        onUploadProgress: (e) => {
          const percentage = Math.round(
            (e.loaded / (e.total ?? 1)) * 100
          )

          onProgress(percentage)
        },
      }
    ),

  // ============================================================
  // ADMIN LIST
  //
  // Currently backend has no GET /api/v1/papers route.
  // So this uses the same subject-based GET endpoint.
  // ============================================================

  adminList: (
    params: PaperListParams & {
      subject_id?: string
    }
  ) => {
    const { subject_id, ...queryParams } = params

    if (!subject_id) {
      throw new Error('subject_id is required to fetch papers')
    }

    return apiClient.get<
      ApiResponse<PaginatedResponse<Paper>>
    >(
      `/api/v1/papers/${subject_id}`,
      {
        params: queryParams,
      }
    )
  },

  // ============================================================
  // DELETE PAPER
  // ============================================================

  delete: (paperId: string) =>
    apiClient.delete(
      `/api/v1/papers/${paperId}`
    ),

  // ============================================================
  // REPROCESS PAPER
  // ============================================================

  reprocess: (paperId: string) =>
    apiClient.post<
      ApiResponse<{
        job_id: string
      }>
    >(
      `/api/v1/papers/${paperId}/reprocess`
    ),

  // ============================================================
  // JOB STATUS
  // Backend:
  // GET /api/v1/papers/jobs/<job_id>
  // ============================================================

  getJobStatus: (jobId: string) =>
    apiClient.get<
      ApiResponse<ProcessingJob>
    >(
      `/api/v1/papers/jobs/${jobId}`
    ),
}