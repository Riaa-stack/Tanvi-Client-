import React, { useState, useEffect } from 'react';
import { useSubject } from '../context/SubjectContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { api } from '../context/AuthContext.jsx';
import CompactToggle from '../components/CompactToggle.jsx';
import { Search, Database, Filter, SlidersHorizontal, Trash2, ArrowUpRight, HelpCircle, RefreshCw, Star, CheckCircle, Flame } from 'lucide-react';

export default function QuestionRepo() {
  const { activeSubject } = useSubject();
  const { isCompact } = useTheme();
  
  // Search state
  const [query, setQuery] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [questions, setQuestions] = useState([]);
  const [units, setUnits] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeSubject) {
      fetchFilterOptions();
      handleSearch();
      fetchSearchHistory();
    }
  }, [activeSubject]);

  const fetchFilterOptions = async () => {
    try {
      const res = await api.get('/api/units', {
        params: { subject_id: activeSubject.id }
      });

      setUnits(res.data.units || []);
    } catch (err) {
      console.error('Failed to fetch units for filters:', err);
    }
  };

  const fetchSearchHistory = async () => {
    setSearchHistory([]);
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await api.get('/api/questions/search', {
        params: {
          query: query,
          subject_id: activeSubject?.id,
          unit_id: selectedUnitId || undefined,
          year: selectedYear || undefined
        }
      });

      // Fetch occurrences to attach frequency
      const repeatsRes = await api.get('/api/questions/repeated', {
        params: { subject_id: activeSubject?.id }
      });
      const repeatedQuestions = repeatsRes.data.questions || [];
      const processed = (res.data.questions || []).map(q => {
        const foundRepeat = repeatedQuestions.find(r => r.id === q.id || r.question_text.toLowerCase().trim() === q.question_text.toLowerCase().trim());
        return {
          ...q,
          frequency: foundRepeat?.frequency || 1,
          years: foundRepeat?.years || []
        };
      });

      setQuestions(processed);
      fetchSearchHistory(); // Refresh history
    } catch (err) {
      console.error('Failed to perform search query:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setQuery('');
    setSelectedUnitId('');
    setSelectedYear('');
    setTimeout(() => {
      handleSearch();
    }, 50);
  };

  const handleHistoryClick = (qStr) => {
    setQuery(qStr);
    setTimeout(() => {
      handleSearch();
    }, 50);
  };

  if (!activeSubject) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
        <Database className="h-12 w-12 text-indigo-500 mb-3" />
        <h3 className="font-extrabold text-gray-850 dark:text-gray-100">No subject selected</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm text-center mt-1">
          Select a subject from the **Subjects** panel to query, search, and analyze previous year questions.
        </p>
      </div>
    );
  }

  return (
    <div className={`${isCompact ? 'space-y-4' : 'space-y-6'} font-sans`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-lg">
            Repository: {activeSubject.code}
          </span>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
            Exam Question Repository
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-normal mt-0.5">
            Deep query engine indexing previous year papers. Search keywords or filter by chapters and semesters.
          </p>
        </div>

        <div className="shrink-0">
          <CompactToggle />
        </div>
      </div>

      {/* Query Bar & Filters Panel */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main search input */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search keyword (e.g. Normalization, Transaction, ACID, Indexing, B-Trees...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all font-semibold"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-2"
          >
            Search Repository
          </button>
        </div>

        {/* Filters Selectors Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-50 dark:border-gray-850">
          <div className="flex flex-wrap items-center gap-3">
            {/* Unit Filter */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 px-3 py-1.5 rounded-xl">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
              >
                <option value="">All Chapters / Units</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    Unit {unit.unit_number}: {unit.unit_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 px-3 py-1.5 rounded-xl">
              <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
              >
                <option value="">All Exam Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Clear Filter Options
          </button>
        </div>
      </form>

      {/* History chip suggestions */}
      {searchHistory.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mr-1">Your Searches:</span>
          {searchHistory.slice(0, 6).map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleHistoryClick(item.query)}
              className="text-[11px] font-bold px-2.5 py-1 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 rounded-full hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 border border-gray-200/40 dark:border-gray-800/40 transition-all cursor-pointer flex items-center gap-1"
            >
              {item.query}
              <ArrowUpRight className="h-3 w-3 text-gray-400" />
            </button>
          ))}
        </div>
      )}

      {/* Search results list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Matched Questions ({questions.length})</h3>
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Search active</span>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Scanning repository database...</p>
            </div>
          ) : questions.length > 0 ? (
            questions.map((q, idx) => {
              const unitObj = Array.isArray(units)
              ? units.find(u => u.id === q.unit_id)
              : null;
              const isRepeated = q.frequency > 1;

              return (
                <div 
                  key={q.id}
                  className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 hover:border-indigo-500/20 shadow-sm transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    isRepeated ? 'border-amber-200/50 dark:border-amber-900/30' : 'border-gray-100 dark:border-gray-800'
                  }`}
                >
                  <div className="space-y-2 flex-grow max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      {unitObj && (
                        <span className="text-[9px] font-extrabold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md uppercase">
                          Unit {unitObj.unit_number}: {unitObj.unit_name}
                        </span>
                      )}
                      
                      {isRepeated && (
                        <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md uppercase flex items-center gap-1 font-sans">
                          <Flame className="h-3 w-3 fill-amber-500 text-amber-500" /> High Repeat ({q.frequency}x)
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-gray-850 dark:text-gray-200 leading-relaxed">
                      "{q.question_text}"
                    </h4>

                    {/* Meta labels */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500 font-semibold">
                      <span className="bg-gray-100 dark:bg-gray-950 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">{q.question_type}</span>
                      <span>•</span>
                      <span>Marks allocated: <strong className="text-gray-750 dark:text-gray-300 font-bold">{q.marks}</strong></span>
                      {q.years.length > 0 && (
                        <>
                          <span>•</span>
                          <span>Appeared in: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{q.years.join(', ')}</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right hand decoration */}
                  <div className="flex sm:flex-col items-end gap-2 shrink-0">
                    <span className="text-xl font-extrabold text-gray-850 dark:text-gray-150 leading-none">{q.marks}</span>
                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Marks Credit</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
              <HelpCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="font-extrabold text-gray-850 dark:text-gray-100">No questions match filters</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto mt-1">
                There are no exam papers or questions matching your exact keyword. Try broadening your parameters or uploading an exam paper.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
