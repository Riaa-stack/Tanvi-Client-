import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SubjectProvider } from './context/SubjectContext.jsx';

import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';

// Pages
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Subjects from './pages/Subjects.jsx';
import SyllabusMap from './pages/SyllabusMap.jsx';
import QuestionRepo from './pages/QuestionRepo.jsx';
import PaperLibrary from './pages/PaperLibrary.jsx';
import Analytics from './pages/Analytics.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import Settings from './pages/Settings.jsx';


// =======================================================
// Authenticated Layout
// =======================================================

function AuthenticatedApp() {

  const [activeTab, setActiveTab] = useState("dashboard");

  const renderTabContent = () => {

    switch (activeTab) {

      case "dashboard":
        return <Dashboard setActiveTab={setActiveTab} />;

      case "subjects":
        return <Subjects />;

      case "syllabus":
        return <SyllabusMap />;

      case "questions":
        return <QuestionRepo />;

      case "papers":
        return <PaperLibrary />;

      case "analytics":
        return <Analytics />;

      case "ai-assistant":
        return <AIAssistant />;

      case "settings":
        return <Settings />;

      default:
        return <Dashboard setActiveTab={setActiveTab} />;

    }

  };

  return (

    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 flex flex-col">

      <Navbar />

      <div className="flex flex-1">

        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main
          id="main-content-area"
          className="flex-1 p-6 md:p-8 max-h-[calc(100vh-65px)] overflow-y-auto"
        >

          {renderTabContent()}

        </main>

      </div>

    </div>

  );

}


// =======================================================
// App Content
// =======================================================

function AppContent() {

  const { user, loading } = useAuth();

  if (loading) {

    return (

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">

        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>

        <p className="text-xs font-bold text-gray-400 mt-3 uppercase tracking-widest">

          Initialising EduArchive Core...

        </p>

      </div>

    );

  }

  if (!user) {

    return <Auth />;

  }

  return (

    <SubjectProvider>

      <AuthenticatedApp />

    </SubjectProvider>

  );

}


// =======================================================
// Root App
// =======================================================

export default function App() {

  return (

    <AuthProvider>

      <ThemeProvider>

        <AppContent />

      </ThemeProvider>

    </AuthProvider>

  );

}