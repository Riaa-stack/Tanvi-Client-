import React, { useState, useEffect } from 'react';
import { useSubject } from '../context/SubjectContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { api } from '../context/AuthContext.jsx';
import CompactToggle from '../components/CompactToggle.jsx';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { 
  FileText, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  Bookmark, 
  BookOpen, 
  Clock, 
  ArrowRight 
} from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const { activeSubject, subjects } = useSubject();
  const { isCompact } = useTheme();
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalPapers: 0,
    totalQuestions: 0,
    repeatedQuestions: 0
  });
  const [repeatedQs, setRepeatedQs] = useState([]);
  const [weightages, setWeightages] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [activeSubject]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [allSubjectsRes, papersRes, questionsRes] = await Promise.all([
        api.get('/api/subjects'),
        api.get('/api/papers'),
        api.get('/api/questions')
      ]);

  const allSubjects = allSubjectsRes.data.subjects || [];
  const allPapers = papersRes.data.papers || [];
  const allQuestions = questionsRes.data.questions || [];

  let activePapers = allPapers;
  let activeQuestions = allQuestions;

      if (activeSubject) {
        activePapers = allPapers.filter(
  p => p.subject_id === activeSubject.id
);

const paperIds = activePapers.map(
  p => p.id
);

activeQuestions = allQuestions.filter(
  q => paperIds.includes(q.paper_id)
);
      }

      // Fetch repeated questions
      const repeatedRes = await api.get('/api/questions/repeated', {
        params: activeSubject ? { subject_id: activeSubject.id } : {}
      });
     setRepeatedQs(
     (repeatedRes.data.questions || []).slice(0, 4)
      );

      // Fetch Unit Weightages
      if (activeSubject) {
        const weightageRes = await api.get('/api/analytics/unit-weightage', {
          params: { subject_id: activeSubject.id }
        });
        setWeightages(
          weightageRes.data.analytics || []
        );

        // Fetch trends
        const trendRes = await api.get('/api/analytics/exam-trends', {
          params: { subject_id: activeSubject.id }
        });
        setTrends(
          trendRes.data.analytics || []
        );
      }

      setStats({
          totalSubjects: allSubjects.length,
          totalPapers: activePapers.length,
          totalQuestions: activeQuestions.length,
          repeatedQuestions: (repeatedRes.data.questions || []).length
      });

    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 font-semibold">Compiling academic insights...</p>
      </div>
    );
  }

  // Find Bento Highlight units
  const maxWeightUnit = weightages.length > 0
    ? [...weightages].sort((a,b) => b.questions - a.questions)[0]
    : null;
  const minWeightUnit = weightages.length > 0
    ? [...weightages].sort((a,b) => a.questions - b.questions)[0]
    : null;
  const highestImpUnit = weightages.length > 0
    ? [...weightages].sort((a,b) => b.questions - a.questions)[0]
    : null;
  return (
    <div className={`${isCompact ? 'space-y-4' : 'space-y-6'} font-sans`}>
      {/* Page Title & Toggle */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">Workspace Overview</h2>
        </div>
        <CompactToggle />
      </div>

      {/* Subject Header Card */}
      <div className={`bg-[#1E293B] border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-600 ${isCompact ? 'p-4' : 'p-6'} shadow-sm relative overflow-hidden rounded-sm`}>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-sm">
              Active Context: {activeSubject ? activeSubject.code : 'No Subject Selected'}
            </span>
            <h2 className="text-xl font-extrabold tracking-tight mt-1.5 text-slate-900 dark:text-white">
              {activeSubject ? activeSubject.name : 'Choose a Subject to Begin'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium max-w-xl leading-relaxed mt-1">
              {activeSubject?.description || 'Please select a subject from the Subjects tab to inspect its syllabus map, repeated questions, weightage grids, and predictions.'}
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('ai-assistant')}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-sm transition-all shadow-md flex items-center gap-2 cursor-pointer self-start md:self-center uppercase tracking-wider"
          >
            <Sparkles className="h-4 w-4" />
            AI Exam Predictor
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Papers Cataloged', value: stats.totalPapers, sub: activeSubject ? 'Active subject' : 'All subjects', icon: FileText, borderL: 'border-l-blue-500' },
          { title: 'Questions Analyzed', value: stats.totalQuestions, sub: 'Extracted via OCR', icon: Database, borderL: 'border-l-purple-500' },
          { title: 'Highly Repeated Questions', value: stats.repeatedQuestions, sub: 'Appeared multiple times', icon: TrendingUp, borderL: 'border-l-emerald-500' },
          { title: 'Total Subjects', value: stats.totalSubjects, sub: 'In platform directory', icon: BookOpen, borderL: 'border-l-orange-500' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 border-l-4 ${stat.borderL} p-4 flex items-center justify-between shadow-sm rounded-sm`}>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.title}</span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none mt-0.5">{stat.value}</p>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 leading-none mt-1 block">{stat.sub}</span>
              </div>
              <div className="p-2 text-slate-400 dark:text-slate-400">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recharts trends vs Repeated Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Exam Trends Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 rounded-sm p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white leading-tight">Exam Trends & Questions Distribution</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Questions cataloged per year for the active subject</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-sm font-bold flex items-center gap-1 font-mono text-[10px]">
              <Clock className="h-3.5 w-3.5" /> ESE & MSE Catalog
            </span>
          </div>

          <div className="h-64">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" className="dark:stroke-slate-800" />
                  <XAxis dataKey="year" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '4px', border: 'none', backgroundColor: '#1e293b', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="questions" name="Questions Count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-[#0f172a] rounded-sm p-6 border border-dashed border-slate-200 dark:border-slate-800">
                <AlertTriangle className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-xs text-slate-450 dark:text-slate-500 font-bold">No trend data available.</p>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 text-center mt-1">Upload previous year papers to visualize exam trends.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3: Top Repeated Questions */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 border-l-4 border-l-purple-500 rounded-sm p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 dark:text-white leading-tight">Repeated Questions High Priority</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium font-mono">PYP Analytics Engine v1.0</p>
          </div>

          <div className="space-y-2 flex-grow overflow-y-auto max-h-64 pr-1 mt-2">
            {repeatedQs.length > 0 ? (
              repeatedQs.map((q) => (
                <div key={q.id} className="p-3 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-sm space-y-1 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-sm uppercase">
                      Repeated {q.frequency}x
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">{q.marks} Marks</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">"{q.question_text}"</p>
                  <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase font-mono">Unit Mapped: {q.unit_id ? 'Yes' : 'No'}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 bg-slate-50 dark:bg-[#0f172a] rounded-sm p-6 border border-dashed border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                <p className="text-xs text-slate-450 dark:text-slate-500 font-bold">All clear!</p>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 text-center mt-1 font-mono">No repeating questions detected yet.</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => setActiveTab('questions')}
            className="w-full mt-3 py-2 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-sm text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            View Question Repository
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Feature 2: Unit Weightage Bento Grid */}
      {weightages.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 dark:text-white leading-tight">Unit Weightage & Importance Map</h3>
            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Bento Grid analyzing credits, asking frequencies, and predictive values</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bento block 1: High weightage unit */}
            {maxWeightUnit && (
              <div className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 border-l-4 border-l-blue-500 rounded-sm p-5 space-y-4 relative overflow-hidden">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded-sm">
                    Most Important Unit
                  </span>
                  <h4 className="text-base font-extrabold mt-1.5 truncate">Unit {maxWeightUnit.unit_number}: {maxWeightUnit.unit_name}</h4>
                </div>
                <div className="flex items-end justify-between pt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium uppercase tracking-wider font-mono">Weightage</span>
                    <span className="text-2xl font-extrabold">{maxWeightUnit.questions}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium uppercase tracking-wider font-mono">Credits</span>
                    <span className="text-base font-extrabold">{maxWeightUnit.questions}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bento block 2: Least Asked Unit */}
            {minWeightUnit && (
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500 rounded-sm p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-sm">
                    Least Asked Unit
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5 truncate">Unit {minWeightUnit.unit_number}: {minWeightUnit.unit_name}</h4>
                </div>
                <div className="flex items-end justify-between pt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium uppercase tracking-wider font-mono">Weightage</span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{minWeightUnit.questions}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium uppercase tracking-wider font-mono">Score</span>
                    <span className="text-base font-extrabold text-slate-850 dark:text-slate-200">{minWeightUnit.questions}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bento block 3: Highest prediction rating unit */}
            {highestImpUnit && (
              <div className="bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-600/20 border-l-4 border-l-purple-500 rounded-sm p-5 space-y-4 relative overflow-hidden md:col-span-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded-sm">
                    High Probability Unit
                  </span>
                  <h4 className="text-base font-extrabold mt-1.5">Unit {highestImpUnit.unit_number}: {highestImpUnit.unit_name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">This unit represents high repeating questions. Focus deeply on its topic maps.</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-450">
                    <Bookmark className="h-4 w-4" />
                    <span className="text-xs font-semibold">{highestImpUnit.questions} Questions cataloged</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium uppercase tracking-wider font-mono">Predictive Score</span>
                    <span className="text-lg font-extrabold">{highestImpUnit.questions}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
