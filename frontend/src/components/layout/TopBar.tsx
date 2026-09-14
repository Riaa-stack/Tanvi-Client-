import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bot, Sparkles, BookOpen, User, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useStudyStore } from '@/store/useStudyStore';

interface TopBarProps {
  title?: string;
  university?: string;
  semester?: number | string;
  onAskAI?: () => void;
  onViewSources?: () => void;
  hasSources?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  university,
  semester,
  onAskAI,
  onViewSources,
  hasSources = false,
}) => {
  const { user } = useAuthStore();
  const { activePaper } = useStudyStore();

  const displayTitle = title || activePaper?.title || 'Academic Workspace';
  const displayUni = university || activePaper?.subject?.university || 'SGBAU';
  const displaySem = semester || activePaper?.semester?.number || '5';

  return (
    <header className="h-14 bg-[#fcfbf7]/90 backdrop-blur-md border-b border-stone-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumb / Title with Badges */}
      <div className="flex items-center gap-3 overflow-hidden">
        <h1 className="font-handwriting font-bold text-lg md:text-xl text-ink truncate flex items-center gap-2">
          <span>{displayTitle}</span>
        </h1>

        {displayUni && (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
            {displayUni}
          </span>
        )}

        {displaySem && (
          <span className="bg-purple-100 text-purple-900 border border-purple-300 font-sans text-xs font-semibold px-2 py-0.5 rounded-md shrink-0">
            Sem {displaySem}
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onAskAI && (
          <button
            onClick={onAskAI}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-all shadow-xs"
          >
            <Sparkles size={14} className="text-brand-600" />
            <span>Ask AI</span>
          </button>
        )}

        {hasSources && onViewSources && (
          <button
            onClick={onViewSources}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-all shadow-xs"
          >
            <BookOpen size={14} className="text-slate-500" />
            <span>Sources</span>
          </button>
        )}

        <NavLink
          to="/profile"
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-stone-200 flex items-center justify-center text-slate-600 transition-colors"
        >
          <User size={15} />
        </NavLink>
      </div>
    </header>
  );
};
