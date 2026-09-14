import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FileText,
  Compass,
  BookOpen,
  BotMessageSquare,
  Search,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { papersApi } from '@/services/api/papers';
import { notesApi } from '@/services/api/notes';
import { Paper, Note } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { StickyNote } from '@/components/notebook/StickyNote';
import { Highlighter } from '@/components/notebook/Highlighter';
import { StarDoodle, LightbulbDoodle } from '@/components/notebook/DoodleIcons';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [papers, setPapers] = useState<Paper[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [papersRes, notesRes] = await Promise.all([
          papersApi.getStudentPapers({ page: 1, page_size: 6 }),
          notesApi.getNotes(1, 6),
        ]);

        if (papersRes.success && papersRes.papers) {
          setPapers(papersRes.papers);
        }
        if (notesRes.success && notesRes.notes) {
          setNotes(notesRes.notes);
        }
      } catch (err) {
        // Handled gracefully with fallback empty states
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/student/papers?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed]">
      <TopBar title="Personal Academic Notebook" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-handwriting font-bold text-3xl md:text-4xl text-ink">
                Welcome back, {user?.name.split(' ')[0]}! ✨
              </h1>
            </div>
            <p className="text-xs md:text-sm text-slate-600 mt-1 font-sans">
              Sant Gadge Baba Amravati University (SGBAU) Curriculum • Ready to Study
            </p>
          </div>

          {/* Quick Search across papers */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions or topics..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-stone-300 text-xs font-sans text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-xs"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          </form>
        </div>

        {/* 4 Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NavLink
            to="/student/papers"
            className="p-5 rounded-2xl bg-[#fdfbf7] notebook-ruled-bg border border-stone-200/90 shadow-paper hover:shadow-card-lift transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-sm text-ink group-hover:text-brand-600 transition-colors">
                Paper Vault
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore archived question papers with AI breakdown.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-brand-600 font-handwriting">
              <span>Browse Papers</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </NavLink>

          <NavLink
            to="/student/study-intelligence"
            className="p-5 rounded-2xl bg-[#fdfbf7] notebook-ruled-bg border border-stone-200/90 shadow-paper hover:shadow-card-lift transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                <Compass size={20} />
              </div>
              <h3 className="font-bold text-sm text-ink group-hover:text-brand-600 transition-colors">
                Study Intelligence
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Multi-year trends & repetition clustering.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-sky-600 font-handwriting">
              <span>View Trends</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </NavLink>

          <NavLink
            to="/student/notes"
            className="p-5 rounded-2xl bg-[#fdfbf7] notebook-ruled-bg border border-stone-200/90 shadow-paper hover:shadow-card-lift transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <BookOpen size={20} />
              </div>
              <h3 className="font-bold text-sm text-ink group-hover:text-brand-600 transition-colors">
                My Notes
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload class notes for grounded Q&A & flashcards.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 font-handwriting">
              <span>Open Notes</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </NavLink>

          <NavLink
            to="/student/assistant"
            className="p-5 rounded-2xl bg-[#fdfbf7] notebook-ruled-bg border border-stone-200/90 shadow-paper hover:shadow-card-lift transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <BotMessageSquare size={20} />
              </div>
              <h3 className="font-bold text-sm text-ink group-hover:text-brand-600 transition-colors">
                AI Assistant
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ask questions with verifiable paper citations.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600 font-handwriting">
              <span>Chat with AI</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </NavLink>
        </div>

        {/* Main Dashboard Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Recent Papers in Vault */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-handwriting font-bold text-2xl text-ink flex items-center gap-2">
                <LightbulbDoodle size={20} />
                <span>Ready Question Papers</span>
              </h2>
              <NavLink
                to="/student/papers"
                className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </NavLink>
            </div>

            {papers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {papers.map((paper) => (
                  <NavLink
                    key={paper.id}
                    to={`/student/papers/${paper.id}`}
                    className="p-5 rounded-2xl bg-[#fdfbf7] notebook-ruled-bg border border-stone-200 shadow-paper hover:shadow-card-lift transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md uppercase">
                          {paper.subject?.code || 'CSE'}
                        </span>
                        <span className="font-sans text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          {paper.year}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                        {paper.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {paper.subject?.name || 'Academic Subject'} • Sem {paper.semester?.number || 5}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                        ✓ AI Analyzed
                      </span>
                      <span className="text-brand-600 font-bold font-handwriting">
                        Study Now →
                      </span>
                    </div>
                  </NavLink>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#fdfbf7] notebook-ruled-bg border border-stone-200 text-center space-y-3">
                <p className="font-handwriting text-lg text-slate-700">
                  No question papers uploaded yet in this archive.
                </p>
                <p className="text-xs text-slate-500 font-sans">
                  Teachers upload papers to provide AI analysis and exam study intelligence.
                </p>
                <NavLink
                  to="/student/papers"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-xs"
                >
                  <span>Explore Paper Vault</span>
                  <ArrowRight size={14} />
                </NavLink>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Notes & Recent Notes */}
          <div className="lg:col-span-4 space-y-5">
            {/* Exam Tip Sticky Note */}
            <StickyNote color="yellow" rotation={2} title="Exam Revision Tip">
              <div className="text-xs text-amber-950 font-handwriting space-y-1">
                <p>• Focus on Units with high marks weightage.</p>
                <p>• Trees, Graphs, and Dynamic Programming appear frequently in SGBAU exams!</p>
              </div>
            </StickyNote>

            {/* Quick My Notes Snippet */}
            <div className="p-5 rounded-2xl bg-[#fdfbf7] notebook-ruled-bg border border-stone-200 shadow-paper">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-handwriting font-bold text-lg text-ink">
                  My Study Notes 📚
                </h3>
                <NavLink
                  to="/student/notes"
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  View All
                </NavLink>
              </div>

              {notes.length > 0 ? (
                <div className="space-y-2">
                  {notes.slice(0, 3).map((note) => (
                    <NavLink
                      key={note.id}
                      to={`/student/notes/${note.id}`}
                      className="p-2.5 rounded-xl bg-white/90 border border-stone-200 hover:border-brand-300 flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-medium text-slate-800 truncate max-w-[170px]">
                        {note.title}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold">
                        {note.status}
                      </span>
                    </NavLink>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-500 font-sans">No notes uploaded yet.</p>
                  <NavLink
                    to="/student/notes"
                    className="mt-2 inline-block text-xs font-bold text-brand-600 hover:underline"
                  >
                    + Upload your first note
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
