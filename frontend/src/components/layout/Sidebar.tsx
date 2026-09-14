import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Compass,
  BookOpen,
  BotMessageSquare,
  Layers,
  HelpCircle,
  User,
  Settings,
  Upload,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { StickyNote } from '@/components/notebook/StickyNote';

export const Sidebar: React.FC = () => {
  const { user, role, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const studentNavItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Paper Vault', path: '/student/papers', icon: FileText },
    { label: 'Study Intelligence', path: '/student/study-intelligence', icon: Compass },
    { label: 'My Notes', path: '/student/notes', icon: BookOpen },
    { label: 'AI Assistant', path: '/student/assistant', icon: BotMessageSquare },
    { label: 'Quizzes', path: '/student/quizzes', icon: HelpCircle },
  ];

  const teacherNavItems = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'Paper Vault', path: '/teacher/papers', icon: FileText },
    { label: 'Upload Paper', path: '/teacher/upload', icon: Upload },
  ];

  const navItems = role === 'TEACHER' ? teacherNavItems : studentNavItems;

  return (
    <aside className="w-64 bg-[#fbf9f5] border-r border-stone-200/80 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-stone-200/60 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-sm font-bold text-lg font-handwriting">
              ✏️
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-lg tracking-tight text-ink font-sans">
                  EduArchive
                </span>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full font-mono">
                  AI 2.0
                </span>
              </div>
            </div>
          </NavLink>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 mx-3 my-3 rounded-xl bg-white/70 border border-stone-200/60 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-brand-600 font-medium tracking-wide uppercase">
                  {user.role}
                </div>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-400 shrink-0" />
          </div>
        )}

        {/* Navigation Links */}
        <nav className="px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-100/80 text-brand-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100/80'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Secondary Links */}
        <div className="px-3 pt-4 mt-4 border-t border-stone-200/60 space-y-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-100 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100/80'
              }`
            }
          >
            <User size={18} />
            <span>Profile</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-100 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100/80'
              }`
            }
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>

      {/* Bottom Sticky Note for Student & Logout */}
      <div className="p-4 space-y-3">
        {role === 'STUDENT' && (
          <StickyNote
            color="yellow"
            rotation={-2}
            className="text-xs p-3 shadow-sm"
          >
            <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-0.5">
              Study Streak 🔥
            </div>
            <div className="text-sm font-bold text-amber-950 font-sans">
              14 days
            </div>
            <div className="text-[11px] text-amber-800">Keep it going!</div>
          </StickyNote>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
