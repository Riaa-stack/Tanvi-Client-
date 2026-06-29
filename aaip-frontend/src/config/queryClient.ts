import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    },
  },
})

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  papers: {
    all: ['papers'] as const,
    lists: () => [...queryKeys.papers.all, 'list'] as const,
    list: (params: object) => [...queryKeys.papers.lists(), params] as const,
    detail: (id: string) => [...queryKeys.papers.all, 'detail', id] as const,
    questions: (id: string, params: object) => [...queryKeys.papers.all, 'questions', id, params] as const,
  },
  subjects: {
    all: ['subjects'] as const,
    lists: () => [...queryKeys.subjects.all, 'list'] as const,
    list: (params?: object) => [...queryKeys.subjects.lists(), params] as const,
    detail: (id: string) => [...queryKeys.subjects.all, 'detail', id] as const,
    syllabus: (id: string) => [...queryKeys.subjects.all, 'syllabus', id] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    unitWeightage: (subjectId: string) => [...queryKeys.analytics.all, 'unit-weightage', subjectId] as const,
    trends: (subjectId: string) => [...queryKeys.analytics.all, 'trends', subjectId] as const,
    probability: (subjectId: string) => [...queryKeys.analytics.all, 'probability', subjectId] as const,
    clusters: (subjectId: string) => [...queryKeys.analytics.all, 'clusters', subjectId] as const,
    dependency: (subjectId: string) => [...queryKeys.analytics.all, 'dependency', subjectId] as const,
  },
  predictions: {
    all: ['predictions'] as const,
    list: (subjectId: string, params: object) => [...queryKeys.predictions.all, 'list', subjectId, params] as const,
  },
  bookmarks: {
    all: ['bookmarks'] as const,
    list: () => [...queryKeys.bookmarks.all, 'list'] as const,
  },
  student: {
    activity: ['student', 'activity'] as const,
    recommendations: ['student', 'recommendations'] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    jobs: {
      all: ['admin', 'jobs'] as const,
      lists: () => [...queryKeys.admin.jobs.all, 'list'] as const,
      list: (params: object) => [...queryKeys.admin.jobs.lists(), params] as const,
      detail: (id: string) => [...queryKeys.admin.jobs.all, 'detail', id] as const,
    },
    users: {
      all: ['admin', 'users'] as const,
      lists: () => [...queryKeys.admin.users.all, 'list'] as const,
    },
    semesters: {
      all: ['admin', 'semesters'] as const,
      lists: () => [...queryKeys.admin.semesters.all, 'list'] as const,
    }
  }
}
