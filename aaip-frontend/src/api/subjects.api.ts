import apiClient from '@/config/api'
import { ApiResponse } from '@/types/api'
import { Subject, Semester } from '@/types/models'

export const subjectsApi = {

  // ============================================================
  // SUBJECTS
  // ============================================================

  // GET ALL SUBJECTS
  list: (
    params?: {
      semester_id?: string
      active_only?: boolean
    }
  ) =>
    apiClient.get<ApiResponse<Subject[]>>(
      '/api/v1/syllabus/subjects',
      {
        params,
      }
    ),

  // GET SINGLE SUBJECT
  detail: (subjectId: string) =>
    apiClient.get<ApiResponse<Subject>>(
      `/api/v1/syllabus/subjects/${subjectId}`
    ),

  // CREATE SUBJECT
  create: (body: Partial<Subject>) =>
    apiClient.post<ApiResponse<Subject>>(
      '/api/v1/syllabus/subjects',
      body
    ),

  // UPDATE SUBJECT
  update: (
    subjectId: string,
    body: Partial<Subject>
  ) =>
    apiClient.put<ApiResponse<Subject>>(
      `/api/v1/syllabus/subjects/${subjectId}`,
      body
    ),

  // DELETE SUBJECT
  delete: (subjectId: string) =>
    apiClient.delete<ApiResponse<void>>(
      `/api/v1/syllabus/subjects/${subjectId}`
    ),


  // ============================================================
  // SEMESTERS
  // ============================================================

  // GET ALL SEMESTERS
  listSemesters: () =>
    apiClient.get<ApiResponse<Semester[]>>(
      '/api/v1/syllabus/semesters'
    ),

  // CREATE SEMESTER
  createSemester: (body: Partial<Semester>) =>
    apiClient.post<ApiResponse<Semester>>(
      '/api/v1/syllabus/semesters',
      body
    ),

  // UPDATE SEMESTER
  updateSemester: (
    semesterId: string,
    body: Partial<Semester>
  ) =>
    apiClient.put<ApiResponse<Semester>>(
      `/api/v1/syllabus/semesters/${semesterId}`,
      body
    ),

  // DELETE SEMESTER
  deleteSemester: (semesterId: string) =>
    apiClient.delete<ApiResponse<void>>(
      `/api/v1/syllabus/semesters/${semesterId}`
    ),
}