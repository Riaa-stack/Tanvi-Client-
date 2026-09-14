import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FileText,
  Compass,
  BotMessageSquare,
  BookOpen,
  TrendingUp,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Users,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { StarDoodle, LightbulbDoodle, ArrowDoodle } from '@/components/notebook/DoodleIcons';
import { StickyNote } from '@/components/notebook/StickyNote';
import { Highlighter } from '@/components/notebook/Highlighter';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-ink font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#f7f4ed]/90 backdrop-blur-md border-b border-stone-200/80 px-6 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-sm font-bold text-lg font-handwriting">
            ✏️
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-xl tracking-tight text-ink">
              EduArchive
            </span>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded-full font-mono">
              AI 2.0
            </span>
          </div>
        </div>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
          <a href="#features" className="hover:text-brand-600 transition-colors">
            Features
          </a>
          <a href="#students" className="hover:text-brand-600 transition-colors">
            For Students
          </a>
          <a href="#teachers" className="hover:text-brand-600 transition-colors">
            For Teachers
          </a>
          <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
            How It Works
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <NavLink
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Log In
          </NavLink>
          <NavLink
            to="/register"
            className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md hover:shadow-brand-200 transition-all"
          >
            Get Started Free
          </NavLink>
        </div>
      </header>

      {/* ── Hero Section (Matching Reference Image 3) ────────────────────── */}
      <section className="pt-12 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 font-handwriting font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 text-sm">
              <StarDoodle size={16} />
              <span>Study Smarter</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink font-handwriting leading-[1.15]">
              Turn Past Papers into{' '}
              <span className="hand-underline hand-underline-yellow text-brand-600">
                Smart Study Notes
              </span>
            </h1>

            <p className="text-slate-600 text-base md:text-lg leading-relaxed font-sans">
              EduArchive AI 2.0 analyzes university exam question papers to extract important topics, detect recurring patterns, and create personalized study intelligence — all in your digital notebook.
            </p>

            {/* Role Action CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3.5">
              <button
                onClick={() => navigate('/register?role=STUDENT')}
                className="flex-1 text-left p-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white shadow-lg hover:shadow-brand-300 transition-all group"
              >
                <div className="font-bold flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    🎓 <span>I'm a Student</span>
                  </span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-xs text-brand-100 mt-1 font-sans">
                  Explore Papers & Get Study Insights
                </div>
              </button>

              <button
                onClick={() => navigate('/register?role=TEACHER')}
                className="flex-1 text-left p-4 rounded-2xl bg-white hover:bg-stone-50 text-slate-800 border-2 border-brand-300 shadow-md transition-all group"
              >
                <div className="font-bold flex items-center justify-between text-base">
                  <span className="flex items-center gap-2 text-brand-700">
                    👨‍🏫 <span>I'm a Teacher</span>
                  </span>
                  <ArrowRight size={16} className="text-brand-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-xs text-slate-500 mt-1 font-sans">
                  Upload Papers & Help Students
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2 font-handwriting text-sm text-brand-600 pt-1">
              <ArrowDoodle direction="curved" />
              <span>Choose your role to get started</span>
            </div>
          </div>

          {/* Right Showcase Preview (Interactive Mock Split-screen Workspace) */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-3xl bg-[#ece5d8] p-3 md:p-5 shadow-2xl border border-stone-300">
              {/* Split Workspace Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[420px]">
                {/* PDF Viewer Mock */}
                <div className="bg-[#1e222d] rounded-2xl p-3 text-white text-xs flex flex-col justify-between shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 font-mono text-[10px] text-slate-400">
                    <span>≡ DS_Winter_2025.pdf</span>
                    <span>3 / 12</span>
                  </div>
                  <div className="bg-white text-slate-900 p-4 rounded-sm font-serif text-[10px] leading-relaxed shadow-inner my-auto">
                    <div className="text-center font-bold text-[9px] uppercase border-b pb-1 mb-2">
                      Sant Gadge Baba Amravati University
                      <div className="text-brand-600">Data Structures (Semester - V)</div>
                    </div>
                    <div className="font-bold text-slate-800">Q1 (a) Explain different types of arrays.</div>
                    <div className="font-bold text-slate-800 mt-2">Q2 (a) Explain stack and its applications.</div>
                    <div className="font-bold text-slate-800 mt-2">Q3 (a) Explain Linked List representation.</div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-center font-mono">
                    Page 3 of 12
                  </div>
                </div>

                {/* AI Intelligence Notebook Mock */}
                <div className="bg-[#fdfbf7] notebook-ruled-bg rounded-2xl p-4 border border-stone-200 shadow-md flex flex-col justify-between relative overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-2">
                      <span className="font-handwriting font-bold text-base text-ink flex items-center gap-1.5">
                        <LightbulbDoodle size={16} /> AI Intelligence Notebook
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="bg-yellow-50/90 border border-yellow-200 p-2.5 rounded-xl text-xs">
                        <div className="font-handwriting font-bold text-amber-900 text-sm">
                          Important Topics ⭐
                        </div>
                        <div className="text-[11px] text-amber-950 font-sans mt-0.5">
                          <span className="font-bold text-brand-600">Trees:</span> Asked in 4/4 papers (22.5 marks)
                        </div>
                        <div className="text-[11px] text-amber-950 font-sans mt-0.5">
                          <span className="font-bold text-brand-600">Linked List:</span> Asked in 3/4 papers (17.5 marks)
                        </div>
                      </div>

                      <div className="bg-purple-50/90 border border-purple-200 p-2 rounded-xl text-xs">
                        <div className="font-handwriting font-bold text-purple-900">
                          Repeated Question Detected 🔁
                        </div>
                        <div className="text-[10px] text-purple-900 font-sans">
                          "Explain AVL tree rotations" (2022, 2023, 2025)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tiny Sticky notes */}
                  <div className="flex justify-between items-end gap-2 pt-2">
                    <div className="bg-emerald-100 text-emerald-950 text-[10px] font-handwriting p-2 rounded-md shadow-xs transform rotate-2">
                      Study in this order! 📝
                    </div>
                    <div className="bg-pink-100 text-pink-950 text-[10px] font-handwriting p-2 rounded-md shadow-xs transform -rotate-2">
                      Focus on Trees & Graphs! ✨
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Decorative Sticky Note */}
              <div className="absolute -top-4 -right-4 hidden sm:block">
                <StickyNote color="yellow" rotation={6} className="w-36 text-xs p-2.5 shadow-md">
                  <div className="font-bold">Based on 4 previous papers ✓</div>
                </StickyNote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5 Feature Cards Grid (Matching Reference Image 3) ─────────────── */}
      <section id="features" className="py-16 bg-white/70 border-t border-stone-200/80 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-handwriting text-3xl md:text-4xl font-extrabold text-ink flex items-center justify-center gap-2">
              <span>Everything You Need to Study Smarter</span>
              <StarDoodle size={24} />
            </h2>
            <p className="text-slate-600 text-sm mt-2 font-sans">
              Designed specifically for engineering students and professors following the university curriculum.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1 */}
            <div className="bg-[#fdfbf7] notebook-ruled-bg p-5 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                  <FileText size={20} />
                </div>
                <h3 className="font-bold text-sm text-ink mb-1">AI Paper Analysis</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Extract important topics, detect question patterns, and understand exam difficulty instantly.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#fdfbf7] notebook-ruled-bg p-5 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                  <Compass size={20} />
                </div>
                <h3 className="font-bold text-sm text-ink mb-1">Study Intelligence</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Get personalized topic priorities, unit weightages, and high-yield revision recommendations.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#fdfbf7] notebook-ruled-bg p-5 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                  <BotMessageSquare size={20} />
                </div>
                <h3 className="font-bold text-sm text-ink mb-1">AI Assistant</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Ask anything about the exam papers with verifiable grounded source citations.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#fdfbf7] notebook-ruled-bg p-5 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center mb-3">
                  <BookOpen size={20} />
                </div>
                <h3 className="font-bold text-sm text-ink mb-1">Smart Notes</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Upload your lecture notes to generate grounded summaries, diagrams, flashcards, and quizzes.
                </p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-[#fdfbf7] notebook-ruled-bg p-5 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <TrendingUp size={20} />
                </div>
                <h3 className="font-bold text-sm text-ink mb-1">Historical Insights</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Compare multi-year papers to discover exact repetition clusters and trends.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Statistics Banner Bar ────────────────────────────────────────── */}
      <section className="py-10 bg-[#ede4d4] border-t border-b border-stone-300 px-6 lg:px-12 text-center">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-handwriting font-bold text-2xl text-ink">
            One Archive. <Highlighter color="purple">Infinite Possibilities.</Highlighter> ✏️
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            <div className="flex items-center gap-3">
              <FileText className="text-brand-600" size={28} />
              <div className="text-left">
                <div className="font-extrabold text-xl text-slate-900 font-mono">10K+</div>
                <div className="text-xs text-slate-600 font-sans">Papers Archived</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="text-brand-600" size={28} />
              <div className="text-left">
                <div className="font-extrabold text-xl text-slate-900 font-mono">5K+</div>
                <div className="text-xs text-slate-600 font-sans">Students Empowered</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <GraduationCap className="text-brand-600" size={28} />
              <div className="text-left">
                <div className="font-extrabold text-xl text-slate-900 font-mono">100+</div>
                <div className="text-xs text-slate-600 font-sans">Teachers Onboard</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-8 bg-[#f7f4ed] text-center text-xs text-slate-500 font-sans border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-ink font-handwriting">EduArchive AI 2.0</span>
            <span>• Sant Gadge Baba Amravati University (SGBAU) & Ram Meghe College</span>
          </div>
          <div>
            Built for Academic Excellence. &copy; {new Date().getFullYear()} EduArchive AI.
          </div>
        </div>
      </footer>
    </div>
  );
};
