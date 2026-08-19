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
import SubjectFormPage from '@/pages/admin/SubjectFormPage'
import SyllabusEditorPage from '@/pages/admin/SyllabusEditorPage'
import SemestersPage from '@/pages/admin/SemestersPage'
import SemesterFormPage from '@/pages/admin/SemesterFormPage'
import UsersPage from '@/pages/admin/UsersPage'
import AnalyticsDashboard from '@/pages/admin/AnalyticsDashboard'
import UnitWeightagePage from '@/pages/admin/UnitWeightagePage'
import TrendsPage from '@/pages/admin/TrendsPage'
import ProbabilityPage from '@/pages/admin/ProbabilityPage'
import ClustersPage from '@/pages/admin/ClustersPage'
import AIJobsPage from '@/pages/admin/AIJobsPage'

export const router = createBrowserRouter([
  // ============================================================
  // PUBLIC
  // ============================================================

  {
    path: '/',
    element: <LandingPage />,
  },

  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/login',
            element: <LoginPage />,
          },
          {
            path: '/register',
            element: <RegisterPage />,
          },
        ],
      },
    ],
  },

  // ============================================================
  // STUDENT
  // ============================================================

  {
    element: (
      <ProtectedRoute
        allowedRoles={[UserRole.STUDENT]}
      />
    ),

    children: [
      {
        element: <AppShell role="student" />,

        children: [
          {
            path: '/dashboard',
            element: <StudentDashboard />,
          },

          {
            path: '/subjects',
            element: <SubjectsPage />,
          },

          {
            path: '/subjects/:subjectId',
            element: <SubjectDetailPage />,
          },

          {
            path: '/subjects/:subjectId/units/:unitId',
            element: <UnitDashboardPage />,
          },

          {
            path: '/subjects/:subjectId/papers',
            element: <PapersPage />,
          },

          {
            path: '/papers',
            element: <PapersPage />,
          },

          {
            path: '/papers/:paperId',
            element: <PaperDetailPage />,
          },

          {
            path: '/search',
            element: <SearchPage />,
          },

          {
            path: '/chat',
            element: <ChatPage />,
          },

          {
            path: '/chat/:subjectId',
            element: <ChatPage />,
          },

          {
            path: '/predictions/:subjectId',
            element: <PredictionsPage />,
          },

          {
            path: '/bookmarks',
            element: <BookmarksPage />,
          },

          {
            path: '/profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  // ============================================================
  // ADMIN
  // ============================================================

  {
    element: (
      <ProtectedRoute
        allowedRoles={[
          UserRole.ADMIN,
          UserRole.SUPER_ADMIN,
        ]}
      />
    ),

    children: [
      {
        element: <AppShell role="admin" />,

        children: [
          {
            path: '/admin',
            element: <AdminDashboard />,
          },

          // ====================================================
          // PAPERS
          // ====================================================

          {
            path: '/admin/papers',
            element: <PapersManagePage />,
          },

          {
            path: '/admin/papers/:paperId',
            element: <PaperDetailAdminPage />,
          },

          // ====================================================
          // SUBJECTS
          // IMPORTANT: "new" route must exist
          // ====================================================

          {
            path: '/admin/subjects',
            element: <SubjectsManagePage />,
          },

          {
            path: '/admin/subjects/new',
            element: <SubjectFormPage />,
          },

          {
            path: '/admin/subjects/:subjectId/syllabus',
            element: <SyllabusEditorPage />,
          },

          // ====================================================
          // SEMESTERS
          // IMPORTANT: "new" route must exist
          // ====================================================

          {
            path: '/admin/semesters',
            element: <SemestersPage />,
          },

          {
            path: '/admin/semesters/new',
            element: <SemesterFormPage />,
          },

          // ====================================================
          // ANALYTICS
          // ====================================================

          {
            path: '/admin/analytics',
            element: <AnalyticsDashboard />,
          },

          {
            path: '/admin/analytics/unit-weightage/:subjectId',
            element: <UnitWeightagePage />,
          },

          {
            path: '/admin/analytics/trends/:subjectId',
            element: <TrendsPage />,
          },

          {
            path: '/admin/analytics/probability/:subjectId',
            element: <ProbabilityPage />,
          },

          {
            path: '/admin/analytics/clusters/:subjectId',
            element: <ClustersPage />,
          },

          // ====================================================
          // AI JOBS
          // ====================================================

          {
            path: '/admin/ai-jobs',
            element: <AIJobsPage />,
          },

          // ====================================================
          // USERS
          // ====================================================

          {
            path: '/admin/users',
            element: <UsersPage />,
          },
        ],
      },
    ],
  },

  // ============================================================
  // 404
  // ============================================================

  {
    path: '*',
    element: <NotFoundPage />,
  },
])