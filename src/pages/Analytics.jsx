import React, { useState, useEffect } from 'react';
import { useSubject } from '../context/SubjectContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { api } from '../context/AuthContext.jsx';
import CompactToggle from '../components/CompactToggle.jsx';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  Flame, 
  Sparkles, 
  FileText, 
  AlertTriangle, 
  Target, 
  CheckCircle2, 
  Trophy, 
  Bookmark 
} from 'lucide-react';

export default function Analytics() {
  const { activeSubject } = useSubject();
  const { isCompact } = useTheme();
  
  const [weightages, setWeightages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeSubject) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [activeSubject]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [weightRes, topicsRes, questionsRes] = await Promise.all([
        api.get('/api/analytics/unit-weightage', { params: { subject_id: activeSubject.id } }),
        api.get('/api/analytics/repeated-topics', { params: { subject_id: activeSubject.id } }),
        api.get('/api/questions/repeated', { params: { subject_id: activeSubject.id } })
      ]);

      setWeightages(weightRes.data);
      setTopics(topicsRes.data);
      setQuestions(questionsRes.data);
    } catch (err) {
      console.error('Failed to load analytics engine reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeSubject) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
        <BarChart3 className="h-12 w-12 text-indigo-500 mb-3" />
        <h3 className="font-extrabold text-gray-850 dark:text-gray-100">No subject selected</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm text-center mt-1">
          Select a subject from the **Subjects** panel to trigger the predictive analytics engine reports.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400 font-semibold">Running statistical models...</p>
      </div>
    );
  }

  // Prep data for Recharts Pie Chart (Question format distribution)
  const descriptiveCount = questions.length > 0 ? questions.filter(q => q.marks >= 10).length : 5;
  const shortCount = questions.length > 0 ? questions.filter(q => q.marks > 3 && q.marks < 10).length : 3;
  const mcqCount = questions.length > 0 ? questions.filter(q => q.marks <= 3).length : 2;

  const pieData = [
    { name: 'Descriptive (Long)', value: descriptiveCount, color: '#4f46e5' },
    { name: 'Short Answer (Medium)', value: shortCount, color: '#a855f7' },
    { name: 'MCQs / Objective', value: mcqCount, color: '#10b981' }
  ];

  // Predictive important list (highly scored or highly repeating questions)
  const sortedPredictiveQs = [...questions]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  return (
    <div className={`${isCompact ? 'space-y-4' : 'space-y-6'} font-sans`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-sm">
            Predictive Analytics: {activeSubject.code}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Academic Intelligence & Trend Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-normal mt-0.5">
            Real-time unit credits, exam distribution charts, and predictive importance indicators for {activeSubject.name}.
          </p>
        </div>

        <div className="shrink-0">
          <CompactToggle />
        </div>
      </div>

      {/* Recharts Grid: Bar chart weightages vs Pie chart formats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit weightages bar chart */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 rounded-sm p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white leading-tight">Unit Weightage Analysis</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Relative marking share (%) from historical papers</p>
          </div>

          <div className="h-64">
            {weightages.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weightages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" className="dark:stroke-slate-800" />
                  <XAxis dataKey="unit_number" tickFormatter={(v) => `U${v}`} stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '4px', border: 'none', backgroundColor: '#1e293b', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(val) => [`${val}%`, 'Weightage']}
                  />
                  <Bar dataKey="weightage_percentage" fill="#3b82f6" radius={[0, 0, 0, 0]}>
                    {weightages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-[#0f172a] rounded-sm p-6 border border-dashed border-slate-200 dark:border-slate-800">
                <AlertTriangle className="h-7 w-7 text-blue-500 mb-1.5" />
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">No weightages parsed</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Add units and papers to trigger statistical weightage grids.</p>
              </div>
            )}
          </div>
        </div>

        {/* Question formats pie chart */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 border-l-4 border-l-purple-500 rounded-sm p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white leading-tight">Question Formats Distribution</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Categorization based on credits and complexity</p>
          </div>

          <div className="h-64 flex flex-col sm:flex-row items-center justify-center">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom legends */}
            <div className="space-y-2 pl-4">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{item.value} parsed questions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: Important topics vs Predictive high probability questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Topics by Importance Score */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 rounded-sm p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white leading-tight">Syllabus Core Topic Focus</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Extracted topics ordered by statistical occurrence score</p>
          </div>

          <div className="space-y-2">
            {topics.length > 0 ? (
              topics.map((t, idx) => (
                <div key={t.id} className="p-3 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-extrabold rounded-sm flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-250">{t.topic_name}</span>
                  </div>

                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 rounded-sm">
                    Score {t.importance_score}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center bg-slate-50 dark:bg-[#0f172a] rounded-sm border border-dashed border-slate-200 dark:border-slate-800 p-6">
                <Bookmark className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">No core topics parsed</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Upload files to trigger structural topic modeling.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Predictive Questions (High Probability) */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500 rounded-sm p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white leading-tight">High Probability ESE Predictions</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium font-mono">Selected by trend engine weightage metrics</p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 rounded-sm font-bold uppercase text-[9px] flex items-center gap-0.5 font-mono">
              <Flame className="h-3 w-3 fill-amber-500 text-amber-500" /> Hot List
            </span>
          </div>

          <div className="space-y-3">
            {sortedPredictiveQs.length > 0 ? (
              sortedPredictiveQs.map((q, idx) => (
                <div key={q.id} className="p-3.5 bg-blue-50/10 dark:bg-blue-950/10 border border-blue-100/40 dark:border-blue-900/10 rounded-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-[#0f172a] px-2 py-0.5 rounded-sm uppercase font-mono">
                      Prediction Match {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">Ask rate: {q.frequency}x</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    "{q.question_text}"
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-450 font-bold uppercase font-mono">
                    <span>Credit weightage: {q.marks} Marks</span>
                    <span>•</span>
                    <span className="text-emerald-500">Recommended for ESE</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center bg-slate-50 dark:bg-[#0f172a] rounded-sm border border-dashed border-slate-200 dark:border-slate-800 p-6">
                <Trophy className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">Prediction matrix empty</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Upload exam files to start calculating repeating probabilities.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
