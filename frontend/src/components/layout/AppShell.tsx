import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ToastContainer } from './ToastContainer';

export const AppShell: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#f3efe6]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main App Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>

      {/* Global Toast Stack */}
      <ToastContainer />
    </div>
  );
};
