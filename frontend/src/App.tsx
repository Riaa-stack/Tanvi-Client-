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

// Teacher Pages
import { TeacherDashboard } from '@/pages/TeacherDashboard';
import { TeacherUploadPaper } from '@/pages/TeacherUploadPaper';

// Shared Pages
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';

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

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/papers" element={<PaperVault />} />
          <Route path="/student/papers/:id" element={<PaperStudyWorkspace />} />
          <Route path="/student/study-intelligence" element={<StudyIntelligencePage />} />
          <Route path="/student/notes" element={<NotesPage />} />
          <Route path="/student/notes/:id" element={<NoteStudyWorkspace />} />
          <Route path="/student/assistant" element={<AIAssistantPage />} />
          <Route path="/student/flashcards" element={<FlashcardsPage />} />
          <Route path="/student/quizzes" element={<QuizzesPage />} />

          {/* Teacher Subroutes */}
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/papers" element={<PaperVault />} />
          <Route path="/teacher/papers/:id" element={<PaperStudyWorkspace />} />
          <Route path="/teacher/upload" element={<TeacherUploadPaper />} />

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
