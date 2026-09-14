import React, { useState, useEffect } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { papersApi } from '@/services/api/papers';
import { Paper, AcademicSubject } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { PencilLoader } from '@/components/notebook/PencilLoader';
import { Highlighter } from '@/components/notebook/Highlighter';

export const PaperVault: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [selectedSemester, setSelectedSemester] = useState<string>(
    searchParams.get('semester') || ''
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    searchParams.get('year') || ''
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(
    searchParams.get('subject_id') || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('q') || ''
  );

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await papersApi.getSubjects('SGBAU');
        if (res.success && res.data?.subjects) {
          setSubjects(res.data.subjects);
        }
      } catch {
        // Fallback
      }
    };
    fetchSubjects();
  }, []);

  const fetchPapers = async () => {
    setIsLoading(true);
    try {
      const params: any = { page: 1, page_size: 50 };
      if (selectedYear) params.year = parseInt(selectedYear);
      if (selectedSubject) params.subject_id = selectedSubject;

      const res = await papersApi.getStudentPapers(params);
      if (res.success && res.papers) {
        let filtered = res.papers;
        if (selectedSemester) {
          filtered = filtered.filter(
            (p: Paper) => p.semester?.number.toString() === selectedSemester
          );
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (p: Paper) =>
              p.title.toLowerCase().includes(q) ||
              p.subject?.name?.toLowerCase().includes(q) ||
              p.subject?.code?.toLowerCase().includes(q)
          );
        }
        setPapers(filtered);
      }
    } catch {
      setPapers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [selectedSemester, selectedYear, selectedSubject]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPapers();
  };

  const handleResetFilters = () => {
    setSelectedSemester('');
    setSelectedYear('');
    setSelectedSubject('');
    setSearchQuery('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed]">
      <TopBar title="Archived Question Paper Vault" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-handwriting font-bold text-3xl md:text-4xl text-ink flex items-center gap-2">
              <span>Paper Vault</span> 📂
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-sans mt-0.5">
              Verified university exam question papers with AI pattern analysis & breakdown.
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search paper title or subject..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-stone-300 text-xs font-sans text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-xs"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          </form>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 font-sans mr-2">
            <Filter size={14} className="text-brand-600" />
            <span>Filters:</span>
          </div>

          {/* Semester Selector */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 font-medium text-slate-700 text-xs focus:outline-hidden"
          >
            <option value="">All Semesters</option>
            {Array.from({ length: 8 }).map((_, i) => (
              <option key={i + 1} value={(i + 1).toString()}>
                Semester {i + 1}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 font-medium text-slate-700 text-xs focus:outline-hidden"
          >
            <option value="">All Exam Years</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>

          {/* Subject Selector */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 font-medium text-slate-700 text-xs focus:outline-hidden max-w-xs truncate"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>

          {(selectedSemester || selectedYear || selectedSubject || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Papers Grid */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <PencilLoader size="md" message="Loading paper vault..." />
          </div>
        ) : papers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {papers.map((paper) => (
              <NavLink
                key={paper.id}
                to={`/student/papers/${paper.id}`}
                className="p-6 rounded-2xl bg-[#fdfbf7] notebook-ruled-bg border border-stone-200/90 shadow-paper hover:shadow-card-lift transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md uppercase">
                      {paper.subject?.code || 'SGBAU'}
                    </span>
                    <span className="font-sans text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                      Winter {paper.year}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {paper.title}
                  </h3>

                  <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                    <div>
                      <span className="font-semibold text-slate-700">Subject:</span>{' '}
                      {paper.subject?.name}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Branch:</span>{' '}
                      {paper.branch?.name || 'Computer Science & Engineering'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Semester:</span>{' '}
                      Semester {paper.semester?.number || 5}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-stone-200 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                    ✓ Historical Intelligence
                  </span>
                  <span className="text-brand-600 font-bold font-handwriting flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open Paper</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </NavLink>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-[#fdfbf7] notebook-ruled-bg rounded-3xl border border-stone-200 p-8">
            <h3 className="font-handwriting font-bold text-2xl text-ink mb-1">
              No matching question papers found 📝
            </h3>
            <p className="text-xs text-slate-500 font-sans max-w-sm mx-auto">
              Try adjusting your semester, subject, or year filters to browse other papers in the vault.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-xs"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
