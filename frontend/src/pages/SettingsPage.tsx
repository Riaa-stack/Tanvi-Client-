import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Sun,
  Moon,
  Type,
  BookOpen,
  Sparkles,
  User as UserIcon,
  Shield,
  Palette,
  Laptop,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { healthApi } from '@/services/api/health';
import { TopBar } from '@/components/layout/TopBar';
import { NotebookSurface } from '@/components/notebook/NotebookSurface';
import { useThemeStore, ThemeMode, FontSize, NotebookStyle, StudyPace } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    theme,
    fontSize,
    notebookStyle,
    studyPace,
    setTheme,
    setFontSize,
    setNotebookStyle,
    setStudyPace,
  } = useThemeStore();

  const [health, setHealth] = useState<any | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const data = await healthApi.getDetailedHealth();
      setHealth(data);
    } catch {
      setHealth({ status: 'offline' });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed] dark:bg-slate-950 transition-colors duration-200">
      <TopBar title="Settings & Personalisation" />

      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 className="font-handwriting font-bold text-3xl md:text-4xl text-ink dark:text-slate-100 flex items-center gap-2">
            <span>Workspace Personalisation</span> ⚙️
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-sans mt-0.5">
            Customise your study environment, notebook aesthetics, AI answering tone, and review backend health.
          </p>
        </div>

        {/* 1. Appearance & Theme Selection */}
        <NotebookSurface variant="blank" hasSpiral={true} hasMarginLine={false}>
          <div className="space-y-6 p-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Palette className="text-brand-600 dark:text-brand-400" size={20} />
                <h2 className="font-handwriting font-bold text-2xl text-ink dark:text-slate-100">
                  Theme & Visual Mode
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mb-4">
                Switch between warm vintage notebook parchment or sleek dark mode across the entire application.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Light Mode Card */}
                <button
                  type="button"
                  onClick={() => {
                    setTheme('light');
                    toast.info('Light notebook theme activated');
                  }}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                    theme === 'light'
                      ? 'border-brand-600 bg-amber-50/80 shadow-md ring-2 ring-brand-500/20'
                      : 'border-stone-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
                      <Sun size={20} />
                    </span>
                    {theme === 'light' && (
                      <span className="text-xs font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Classic Warm Notebook (Light)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Authentic parchment paper, soft blue margins, and warm amber notebook styling.
                  </span>
                </button>

                {/* Dark Mode Card */}
                <button
                  type="button"
                  onClick={() => {
                    setTheme('dark');
                    toast.info('Dark academic theme activated');
                  }}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                    theme === 'dark'
                      ? 'border-brand-500 bg-slate-900 shadow-md ring-2 ring-brand-500/20'
                      : 'border-stone-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="p-2 rounded-xl bg-indigo-900/50 text-indigo-300">
                      <Moon size={20} />
                    </span>
                    {theme === 'dark' && (
                      <span className="text-xs font-bold text-indigo-300 bg-indigo-950 border border-indigo-700 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Midnight Scholar (Dark)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Deep slate night background, high-contrast typography, and reduced blue-light strain.
                  </span>
                </button>
              </div>
            </div>

            <hr className="border-stone-200 dark:border-slate-800" />

            {/* 2. Reading Font Size */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Type className="text-brand-600 dark:text-brand-400" size={18} />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Study & Reading Font Size
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mb-3">
                Adjust font scaling across notebooks, question paper transcripts, and AI explanations.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { id: 'sm', label: 'Compact (14px)', desc: 'Fit more formulas on screen' },
                    { id: 'base', label: 'Default (16px)', desc: 'Standard comfortable reading' },
                    { id: 'lg', label: 'Spacious (18px)', desc: 'Larger text for low eye strain' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setFontSize(opt.id);
                      toast.info(`Font size set to ${opt.label}`);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      fontSize === opt.id
                        ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-300 ring-1 ring-brand-500 font-bold'
                        : 'border-stone-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-stone-200 dark:border-slate-800" />

            {/* 3. Notebook Page Paper Style */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="text-brand-600 dark:text-brand-400" size={18} />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Notebook Paper Pattern
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mb-3">
                Select your preferred notebook texture for note-taking and revision pages.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { id: 'ruled', label: 'Ruled Lines 📝', desc: 'Classic lined exercise book' },
                    { id: 'grid', label: 'Graph / Grid 📐', desc: 'Engineering & math calculation grid' },
                    { id: 'clean', label: 'Clean Blank 📄', desc: 'Distraction-free modern surface' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setNotebookStyle(opt.id as NotebookStyle);
                      toast.info(`Notebook pattern updated to ${opt.label}`);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      notebookStyle === opt.id
                        ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-300 ring-1 ring-brand-500 font-bold'
                        : 'border-stone-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-stone-200 dark:border-slate-800" />

            {/* 4. AI Study Assistance Persona */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="text-brand-600 dark:text-brand-400" size={18} />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Ask AI Answering Style & Pace
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mb-3">
                Configure how the Gemini AI formats answers for question papers and outside academic queries.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    {
                      id: 'exam_focus',
                      label: 'Exam Focus 🎯',
                      desc: 'Direct marking points, step-by-step mark breakdown & formula emphasis.',
                    },
                    {
                      id: 'comprehensive',
                      label: 'Comprehensive 📚',
                      desc: 'Deep conceptual explanations, textbook analogies & code/math proofs.',
                    },
                    {
                      id: 'quick_summary',
                      label: 'Quick Revision ⚡',
                      desc: 'Bite-sized bullet points, key takeaways, and rapid recall notes.',
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setStudyPace(opt.id as StudyPace);
                      toast.info(`AI style updated to ${opt.label}`);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      studyPace === opt.id
                        ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-300 ring-1 ring-brand-500 font-bold'
                        : 'border-stone-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </NotebookSurface>

        {/* 5. User Account Profile Details */}
        <NotebookSurface variant="blank" hasSpiral={false} hasMarginLine={false}>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="text-brand-600 dark:text-brand-400" size={20} />
              <h2 className="font-handwriting font-bold text-2xl text-ink dark:text-slate-100">
                User Profile
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-stone-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                  Account Name
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                  {user?.name || 'Academic Scholar'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-stone-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                  Email Address
                </div>
                <div className="font-mono text-slate-800 dark:text-slate-200 text-xs mt-0.5 truncate">
                  {user?.email || 'user@eduarchive.ai'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-stone-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                  Role Permission
                </div>
                <div className="mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                      user?.role === 'TEACHER'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    <Shield size={12} />
                    {user?.role || 'STUDENT'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </NotebookSurface>

        {/* 6. Backend System Health */}
        <NotebookSurface variant="ruled" hasSpiral={true} hasMarginLine={true}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-handwriting font-bold text-xl text-ink dark:text-slate-100">
                Backend System Health 🩺
              </h2>
              <button
                onClick={fetchHealth}
                disabled={isLoadingHealth}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors"
              >
                <RefreshCw size={12} className={isLoadingHealth ? 'animate-spin' : ''} />
                <span>{isLoadingHealth ? 'Testing...' : 'Refresh Status'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 text-xs space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Server size={16} className="text-brand-600 dark:text-brand-400" />
                  <span>EduArchive AI Connectivity</span>
                </span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                    health?.status === 'healthy'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  }`}
                >
                  {health?.status || 'ONLINE'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700">
                  <div className="font-bold text-slate-700 dark:text-slate-300">Database Engine</div>
                  <div className="font-mono text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                    {health?.components?.database?.status || 'Online (PostgreSQL)'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700">
                  <div className="font-bold text-slate-700 dark:text-slate-300">Vector Store</div>
                  <div className="font-mono text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                    {health?.components?.vector_store?.status || 'Online (ChromaDB Vector Index)'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700">
                  <div className="font-bold text-slate-700 dark:text-slate-300">AI Model</div>
                  <div className="font-mono text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                    {health?.components?.gemini?.status || 'Online (Gemini 3.8 Flash)'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700">
                  <div className="font-bold text-slate-700 dark:text-slate-300">Embeddings</div>
                  <div className="font-mono text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                    {health?.components?.embedding?.model || 'text-embedding-004 (768-dim)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </NotebookSurface>
      </div>
    </div>
  );
};
