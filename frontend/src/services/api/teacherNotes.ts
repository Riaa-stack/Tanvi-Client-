import { apiClient } from './client';
import { APIResponse, PaginatedResponse, TeacherNote } from '@/types';

export const teacherNotesApi = {
  // Teacher: upload a new note (PDF or Word .doc/.docx)
  uploadTeacherNote: async (formData: FormData) => {
    const res = await apiClient.post<APIResponse<TeacherNote>>(
      '/teacher/notes',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  // Teacher: get all notes uploaded by the logged-in teacher
  getTeacherUploadedNotes: async (page = 1, pageSize = 50) => {
    const res = await apiClient.get<PaginatedResponse<TeacherNote>>('/teacher/notes', {
      params: { page, page_size: pageSize },
    });
    return res.data;
  },

  // Teacher: delete a note
  deleteTeacherNote: async (noteId: string) => {
    const res = await apiClient.delete<APIResponse<{ message: string }>>(
      `/teacher/notes/${noteId}`
    );
    return res.data;
  },

  // Student (or Teacher): get notes published by teachers
  getStudentAvailableNotes: async (params?: {
    subject?: string;
    semester?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const res = await apiClient.get<PaginatedResponse<TeacherNote>>('/student/notes', {
      params: {
        subject: params?.subject,
        semester: params?.semester,
        search: params?.search,
        page: params?.page || 1,
        page_size: params?.pageSize || 50,
      },
    });
    return res.data;
  },

  // Direct download URL helper
  getDownloadUrl: (noteId: string) => {
    return `/api/v1/student/notes/${noteId}/download`;
  },
};
