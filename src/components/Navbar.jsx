import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSubject } from '../context/SubjectContext.jsx';
import { Sun, Moon, Laptop, LogOut, GraduationCap, ShieldAlert, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { subjects, activeSubject, selectSubject } = useSubject();

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] px-6 flex items-center justify-between">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center font-bold text-white shadow-sm font-sans">
          E
        </div>
        <div>
          <h1 className="font-sans font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
            EDUARCHIVE <span className="text-blue-600 dark:text-blue-500 font-black">AI 2.0</span>
          </h1>
          <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-400 leading-none mt-1">Academic Intelligence Platform</p>
        </div>
      </div>

      {/* Context Quick Actions */}
      <div className="flex items-center gap-4">
        {/* Active Subject Selector */}
        {subjects.length > 0 && (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Focus:</span>
            <div className="relative">
              <select
                value={activeSubject?.id || ''}
                onChange={(e) => {
                  const sub = subjects.find(s => s.id === e.target.value);
                  if (sub) selectSubject(sub);
                }}
                className="appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-semibold rounded-xl pl-4 pr-10 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
              >
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Theme Toggle Button */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200/50 dark:border-gray-800/50">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-lg transition-all ${theme === 'light' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            title="Light Theme"
          >
            <Sun className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-white dark:bg-gray-850 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            title="Dark Theme"
          >
            <Moon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-lg transition-all ${theme === 'system' ? 'bg-white dark:bg-gray-850 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            title="System Theme"
          >
            <Laptop className="h-4 w-4" />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-850 dark:text-gray-100 leading-tight">{user.name}</p>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 flex items-center justify-end gap-1">
                {user.role === 'admin' ? (
                  <span className="text-red-500 dark:text-red-400 font-bold bg-red-100 dark:bg-red-950/40 px-1.5 py-0.5 rounded text-[10px] uppercase flex items-center gap-0.5">
                    <ShieldAlert className="h-3 w-3" /> Admin
                  </span>
                ) : (
                  <span className="text-emerald-500 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded text-[10px] uppercase">
                    Student
                  </span>
                )}
              </p>
            </div>
            
            {/* User Avatar */}
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm tracking-wide shadow-md">
              {user.name.charAt(0)}
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
              title="Logout session"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
