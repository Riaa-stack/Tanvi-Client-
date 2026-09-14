import React, { useState, useEffect } from 'react';
import {
  Compass,
  TrendingUp,
  Sparkles,
  BookOpen,
  Filter,
  BarChart3,
  Layers,
  AlertCircle,
  ArrowRight,
  Repeat,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { papersApi } from '@/services/api/papers';
import { AcademicSubject, SubjectHistoricalAnalysis } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { NotebookSurface } from '@/components/notebook/NotebookSurface';
import { StickyNote } from '@/components/notebook/StickyNote';
import { PencilLoader } from '@/components/notebook/PencilLoader';
import { Highlighter } from '@/components/notebook/Highlighter';
import { StarDoodle, LightbulbDoodle } from '@/components/notebook/DoodleIcons';

export const StudyIntelligencePage: React.FC = () => {
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<number>(5);
  const [selectedBranch, setSelectedBranch] = useState<string>('Computer Science & Engineering');
  const [selectedCollege, setSelectedCollege] = useState<string>('Ram Meghe College');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('SGBAU');

  const [intelligence, setIntelligence] = useState<SubjectHistoricalAnalysis | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [evidenceLevel, setEvidenceLevel] = useState<string>('NONE');
  const [fallbackData, setFallbackData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [papersCount, setPapersCount] = useState<number>(0);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await papersApi.getSubjects('SGBAU');
        if (res.success && res.data?.subjects) {
          setSubjects(res.data.subjects);
          if (res.data.subjects.length > 0) {
            setSelectedSubject(res.data.subjects[0].id);
          }
        }
      } catch {
        // Fallback
      }
    };
    loadSubjects();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedSubject) return;
    setIsLoading(true);

    try {
      // Find papers matching this subject to get academic_scope_id
      const papersRes = await papersApi.getStudentPapers({
        subject_id: selectedSubject,
        page_size: 10,
      });

      if (papersRes.success && papersRes.papers?.length > 0 && papersRes.papers[0].academic_scope_id) {
        const scopeId = papersRes.papers[0].academic_scope_id;
        const histRes = await papersApi.getHistoricalAnalysis(scopeId);

        if (histRes.success && histRes.data) {
          setIsAvailable(histRes.data.available);
          setEvidenceLevel(histRes.data.evidence_level || 'NONE');
          setPapersCount(histRes.data.papers_count || 0);
          if (histRes.data.data) {
            setIntelligence(histRes.data.data);
          }
          if (histRes.data.fallback) {
            setFallbackData(histRes.data.fallback);
          }
        }
      } else {
        // Show fallback
        setIsAvailable(false);
        setEvidenceLevel('NONE');
        setPapersCount(0);
        setFallbackData({
          high_priority_units: ['Unit 1: Fundamentals', 'Unit 2: Search & Reasoning'],
          exam_strategy: 'Focus on core principles and repeated descriptive patterns.',
        });
      }
    } catch {
      setIsAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      handleAnalyze();
    }
  }, [selectedSubject, selectedSemester]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed]">
      <TopBar title="Multi-Year Study Intelligence" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-handwriting font-bold text-3xl md:text-4xl text-ink flex items-center gap-2">
              <span>Multi-Year Study Intelligence</span> 🧭
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-sans mt-0.5">
              Cross-year examination trend analysis and semantic question repetition synthesis for Sant Gadge Baba Amravati University (SGBAU).
            </p>
          </div>
        </div>

        {/* Academic Scope Selector Bar */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">University & College</label>
            <div className="p-2 bg-stone-50 border rounded-lg font-medium text-slate-800 truncate">
              SGBAU • Ram Meghe College
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Engineering Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full p-2 bg-stone-50 border rounded-lg font-medium text-slate-800"
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="EXTC">Electronics & Telecommunication</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
              className="w-full p-2 bg-stone-50 border rounded-lg font-medium text-slate-800"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  Semester {num}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2 bg-stone-50 border rounded-lg font-medium text-slate-800 truncate"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code || 'ENG'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Intelligence Presentation Notebook Surface */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <PencilLoader size="md" message="Synthesizing multi-year academic intelligence..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Insights Panel */}
            <div className="lg:col-span-8">
              <NotebookSurface variant="ruled" hasSpiral={true} hasMarginLine={true}>
                {/* Evidence Level Badge */}
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                  <h2 className="font-handwriting font-bold text-2xl text-ink flex items-center gap-2">
                    <LightbulbDoodle size={22} />
                    <span>Academic Scope Intelligence</span>
                  </h2>

                  <div className="flex items-center gap-2">
                    {papersCount > 0 && (
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
                        {papersCount} Papers Analyzed
                      </span>
                    )}
                    <span
                      className={`font-mono text-xs font-bold px-3 py-1 rounded-full border ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {isAvailable ? `EVIDENCE: ${evidenceLevel}` : 'CURRICULUM AI GUIDANCE'}
                    </span>
                  </div>
                </div>

                {isAvailable && intelligence ? (
                  <div className="space-y-6">
                    {/* Multi-Year Trend Summary */}
                    {intelligence.historical_trends && (
                      <div className="p-4 rounded-2xl bg-white/90 border border-stone-200 shadow-xs space-y-3">
                        <h3 className="font-handwriting font-bold text-lg text-ink flex items-center gap-2">
                          <TrendingUp size={18} className="text-brand-600" />
                          <span>Multi-Year Examination Trends</span>
                        </h3>
                        <p className="text-xs text-slate-700 leading-relaxed font-sans">
                          {intelligence.historical_trends.summary}
                        </p>

                        {intelligence.historical_trends.key_observations?.length > 0 && (
                          <div className="pt-2 border-t border-stone-100 space-y-1.5">
                            <span className="font-bold text-xs text-slate-800 font-sans block">
                              Key Observations:
                            </span>
                            <ul className="space-y-1 list-disc list-inside text-xs text-slate-600 font-sans">
                              {intelligence.historical_trends.key_observations.map((obs: string, idx: number) => (
                                <li key={idx} className="leading-snug">
                                  {obs}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Semantic Repetition Clusters */}
                    {intelligence.repetition_clusters && intelligence.repetition_clusters.length > 0 && (
                      <div>
                        <h3 className="font-handwriting font-bold text-xl text-ink mb-2.5 flex items-center gap-2">
                          <Repeat size={20} className="text-purple-600" />
                          <span>Semantic Repetition Clusters 🔁</span>
                        </h3>
                        <div className="space-y-3">
                          {intelligence.repetition_clusters.map((cluster: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-white/90 border border-purple-200/80 shadow-xs space-y-2 font-sans"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-purple-950 font-handwriting text-base">
                                  {cluster.topic || cluster.concept_label || 'Core Exam Concept'}
                                </span>
                                <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-full">
                                  {cluster.occurrence_count || cluster.years?.length || 2}x Repeated
                                </span>
                              </div>

                              <div className="text-xs text-slate-800 font-medium whitespace-pre-line bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                                {cluster.canonical_question}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono pt-1">
                                <span>Exam Years:</span>
                                {cluster.years?.map((yr: number, yIdx: number) => (
                                  <React.Fragment key={yr}>
                                    <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                                      {yr}
                                    </span>
                                    {yIdx < cluster.years.length - 1 && <span>→</span>}
                                  </React.Fragment>
                                ))}
                                {cluster.unit && (
                                  <span className="ml-auto text-slate-500 font-sans font-medium">
                                    {cluster.unit}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prioritized Study Recommendations */}
                    {intelligence.study_recommendations && intelligence.study_recommendations.length > 0 && (
                      <div>
                        <h3 className="font-handwriting font-bold text-xl text-ink mb-2.5 flex items-center gap-2">
                          <CheckCircle2 size={20} className="text-emerald-600" />
                          <span>Data-Backed Study Recommendations 🎯</span>
                        </h3>
                        <div className="space-y-2 font-sans">
                          {intelligence.study_recommendations.map((rec: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-white/90 border border-stone-200 flex items-start gap-3 text-xs shadow-xs"
                            >
                              <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 font-mono text-[11px]">
                                {rec.priority || idx + 1}
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-slate-900 text-sm">
                                  {rec.topic}
                                </div>
                                <div className="text-[11px] text-slate-600 mt-1 leading-snug">
                                  {rec.reason}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Topic Frequencies */}
                    <div>
                      <h3 className="font-handwriting font-bold text-xl text-ink mb-2">
                        Historical Topic Frequencies ⭐
                      </h3>
                      <div className="space-y-2">
                        {intelligence.topic_frequency &&
                          Object.entries(intelligence.topic_frequency).map(([topic, data], idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-white/90 border border-stone-200 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900 text-sm font-sans">{topic}</span>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  Appeared in {data.count} exam paper(s) • Total {data.total_marks} Marks
                                </div>
                              </div>
                              <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-1 rounded-md">
                                {data.count}x
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Unit Importance Breakdown */}
                    <div>
                      <h3 className="font-handwriting font-bold text-xl text-ink mb-2">
                        Unit Importance Breakdown 📊
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {intelligence.unit_importance &&
                          Object.entries(intelligence.unit_importance).map(([unit, data], idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-white/90 border border-stone-200"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-900 font-sans">{unit}</span>
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                                  {data.importance}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                {data.total_marks} marks total • {data.question_count} questions
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 font-sans text-xs text-slate-700 leading-relaxed">
                    <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200">
                      <div className="font-handwriting font-bold text-amber-950 text-lg mb-1">
                        Curriculum-Aware AI Guidance (SGBAU Scope) 🎓
                      </div>
                      <p className="text-amber-900">
                        Historical multi-year comparison requires at least two processed question papers in this academic scope. Currently, {papersCount} paper(s) are uploaded.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/90 border border-stone-200 space-y-2">
                      <h4 className="font-bold text-sm text-ink">High-Yield Revision Strategy:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Master fundamental definitions and standard algorithms in Unit 1 and Unit 2.</li>
                        <li>Practice complete program implementations for search and problem-solving techniques.</li>
                        <li>Allocate sufficient revision time for probabilistic reasoning and machine learning.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </NotebookSurface>
            </div>

            {/* Right Column: Sticky Notes & Action Tips */}
            <div className="lg:col-span-4 space-y-4">
              <StickyNote color="yellow" rotation={1} title="Academic Scope">
                <div className="text-xs text-amber-950 font-handwriting space-y-1">
                  <p>• University: SGBAU</p>
                  <p>• College: Ram Meghe College</p>
                  <p>• Semester: {selectedSemester}</p>
                  <p>• Branch: Computer Science</p>
                  <p>• Papers Analyzed: {papersCount}</p>
                </div>
              </StickyNote>

              <StickyNote color="green" rotation={-2} title="High-Yield Units">
                <div className="text-xs text-emerald-950 font-handwriting">
                  Units with recurring questions across multiple examination years carry highest predictability.
                </div>
              </StickyNote>

              <StickyNote color="purple" rotation={2} title="Exam Advice">
                <div className="text-xs text-purple-950 font-handwriting">
                  10-mark multi-part questions appear consistently across all years. Practice full step-by-step solutions.
                </div>
              </StickyNote>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
