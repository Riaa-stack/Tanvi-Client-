import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

// Layout
import { AppShell } from '@/components/layout/AppShell';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

// Student Pages
import { StudentDashboard } from '@/pages/StudentDashboard';
import { PaperVault } from '@/pages/PaperVault';
import { PaperStudyWorkspace } from '@/pages/PaperStudyWorkspace';
import { StudyIntelligencePage } from '@/pages/StudyIntelligencePage';
import { NotesPage } from '@/pages/NotesPage';
import { NoteStudyWorkspace } from '@/pages/NoteStudyWorkspace';
import { AIAssistantPage } from '@/pages/AIAssistantPage';
import { FlashcardsPage } from '@/pages/FlashcardsPage';
import { QuizzesPage } from '@/pages/QuizzesPage';
import { SyllabusPage } from '@/pages/SyllabusPage';

// Teacher Pages
import { TeacherDashboard } from '@/pages/TeacherDashboard';
import { TeacherUploadPaper } from '@/pages/TeacherUploadPaper';
import { TeacherUploadNotes } from '@/pages/TeacherUploadNotes';

// Shared Pages
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useThemeStore } from '@/store/useThemeStore';

// Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: 'STUDENT' | 'TEACHER';
}> = ({ children, allowedRole }) => {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role && role !== allowedRole) {
    return <Navigate to={role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    checkAuth();
  }, [checkAuth, initTheme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected App Routes inside AppShell */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          {/* Student Subroutes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/papers"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <PaperVault />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/papers/:id"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <PaperStudyWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/study-intelligence"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudyIntelligencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notes"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <NotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/syllabus"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <SyllabusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notes/:id"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <NoteStudyWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assistant"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <AIAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/flashcards"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <FlashcardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quizzes"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <QuizzesPage />
              </ProtectedRoute>
            }
          />

          {/* Teacher Subroutes */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRole="TEACHER">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/papers"
            element={
              <ProtectedRoute allowedRole="TEACHER">
                <PaperVault />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/papers/:id"
            element={
              <ProtectedRoute allowedRole="TEACHER">
                <PaperStudyWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/upload"
            element={
              <ProtectedRoute allowedRole="TEACHER">
                <TeacherUploadPaper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/notes"
            element={
              <ProtectedRoute allowedRole="TEACHER">
                <TeacherUploadNotes />
              </ProtectedRoute>
            }
          />

          {/* Shared Profile & Settings */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
