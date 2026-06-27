import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  LayoutDashboard, 
  BookOpen, 
  Map, 
  Database, 
  FileText, 
  Sparkles, 
  BarChart3, 
  Settings, 
  Upload, 
  PlusSquare 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();

  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'syllabus', label: 'Syllabus Mapping', icon: Map },
    { id: 'questions', label: 'Question Repository', icon: Database },
    { id: 'papers', label: 'Previous Papers', icon: FileText },
    { id: 'analytics', label: 'Analytics Engine', icon: BarChart3 },
    { id: 'ai-assistant', label: 'AI Study Assistant', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-[#f8fafc] dark:bg-[#0F172A] p-4 flex flex-col h-[calc(100vh-64px)] sticky top-[64px] justify-between">
      {/* Top Group */}
      <div className="space-y-4">
        {/* Database Indicator */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Database Explorer</p>
          <div className="flex items-center space-x-3 p-2 bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 rounded-sm">
            <span className="text-xs font-mono font-bold">DB</span>
            <span className="text-xs font-semibold">ctdb: PostgreSQL</span>
          </div>
        </div>

        {/* Navigation Group */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest px-3 mb-2">Subject Modules</p>
          
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold tracking-tight transition-all text-left ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20' 
                      : 'text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-950 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`} />
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Activity / Status block */}
      <div className="mt-auto p-4 bg-slate-100 dark:bg-slate-800/30 rounded-sm border border-slate-200 dark:border-slate-800/80">
        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight font-sans">System Status</p>
        <div className="mt-2 space-y-1 font-mono text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 dark:text-slate-500">API Endpoints</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 dark:text-slate-500">AI Analytics</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 dark:text-slate-500">Node Status</span>
            <span className="text-[9px] text-blue-500 font-bold uppercase tracking-tighter">ONLINE</span>
          </div>
        </div>
        {user?.role === 'admin' && (
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[9px] text-blue-500 font-bold tracking-tight">
            ● ADMIN MODE ACTIVATED
          </div>
        )}
      </div>
    </aside>
  );
}
