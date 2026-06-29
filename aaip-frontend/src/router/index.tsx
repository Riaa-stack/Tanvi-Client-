import { createBrowserRouter } from 'react-router-dom'
import { UserRole } from '@/types/enums'

// Guards & Layouts
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { AppShell } from '@/components/layout/AppShell'
import { AuthLayout } from '@/components/layout/AuthLayout'

// Public Pages
import LandingPage from '@/pages/public/LandingPage'
import LoginPage from '@/pages/public/LoginPage'
import RegisterPage from '@/pages/public/RegisterPage'
import NotFoundPage from '@/pages/public/NotFoundPage'

// Student Pages
import StudentDashboard from '@/pages/student/StudentDashboard'
import SubjectsPage from '@/pages/student/SubjectsPage'
import SubjectDetailPage from '@/pages/student/SubjectDetailPage'
import UnitDashboardPage from '@/pages/student/UnitDashboardPage'
import PapersPage from '@/pages/student/PapersPage'
import PaperDetailPage from '@/pages/student/PaperDetailPage'
import SearchPage from '@/pages/student/SearchPage'
import ChatPage from '@/pages/student/ChatPage'
import PredictionsPage from '@/pages/student/PredictionsPage'
import BookmarksPage from '@/pages/student/BookmarksPage'
import ProfilePage from '@/pages/student/ProfilePage'

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import PapersManagePage from '@/pages/admin/PapersManagePage'
import PaperDetailAdminPage from '@/pages/admin/PaperDetailAdminPage'
import SubjectsManagePage from '@/pages/admin/SubjectsManagePage'
import SyllabusEditorPage from '@/pages/admin/SyllabusEditorPage'
import SemestersPage from '@/pages/admin/SemestersPage'
import UsersPage from '@/pages/admin/UsersPage'
import AnalyticsDashboard from '@/pages/admin/AnalyticsDashboard'
import UnitWeightagePage from '@/pages/admin/UnitWeightagePage'
import TrendsPage from '@/pages/admin/TrendsPage'
import ProbabilityPage from '@/pages/admin/ProbabilityPage'
import ClustersPage from '@/pages/admin/ClustersPage'
import AIJobsPage from '@/pages/admin/AIJobsPage'

export const router = createBrowserRouter([
  // Public
  { path: '/', element: <LandingPage /> },
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ]
      }
    ],
  },

  // Student
  {
    element: <ProtectedRoute allowedRoles={[UserRole.STUDENT]} />,
    children: [
      {
        element: <AppShell role="student" />,
        children: [
          { path: '/dashboard', element: <StudentDashboard /> },
          { path: '/subjects', element: <SubjectsPage /> },
          { path: '/subjects/:subjectId', element: <SubjectDetailPage /> },
          { path: '/subjects/:subjectId/units/:unitId', element: <UnitDashboardPage /> },
          { path: '/subjects/:subjectId/papers', element: <PapersPage /> },
          { path: '/papers', element: <PapersPage /> }, // Search/filter by query
          { path: '/papers/:paperId', element: <PaperDetailPage /> },
          { path: '/search', element: <SearchPage /> },
          { path: '/chat', element: <ChatPage /> },
          { path: '/chat/:subjectId', element: <ChatPage /> },
          { path: '/predictions/:subjectId', element: <PredictionsPage /> },
          { path: '/bookmarks', element: <BookmarksPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },

  // Admin
  {
    element: <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]} />,
    children: [
      {
        element: <AppShell role="admin" />,
        children: [
          { path: '/admin', element: <AdminDashboard /> },
          { path: '/admin/papers', element: <PapersManagePage /> },
          { path: '/admin/papers/:paperId', element: <PaperDetailAdminPage /> },
          { path: '/admin/subjects', element: <SubjectsManagePage /> },
          { path: '/admin/subjects/:subjectId/syllabus', element: <SyllabusEditorPage /> },
          { path: '/admin/semesters', element: <SemestersPage /> },
          { path: '/admin/analytics', element: <AnalyticsDashboard /> },
          { path: '/admin/analytics/unit-weightage/:subjectId', element: <UnitWeightagePage /> },
          { path: '/admin/analytics/trends/:subjectId', element: <TrendsPage /> },
          { path: '/admin/analytics/probability/:subjectId', element: <ProbabilityPage /> },
          { path: '/admin/analytics/clusters/:subjectId', element: <ClustersPage /> },
          { path: '/admin/ai-jobs', element: <AIJobsPage /> },
          // Super Admin Only (Handled inside UsersPage or with further nesting)
          { path: '/admin/users', element: <UsersPage /> },
        ],
      },
    ],
  },

  // 404
  { path: '*', element: <NotFoundPage /> },
])
