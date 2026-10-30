import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  HelpCircle,
  BarChart3,
  ListOrdered,
  Layers,
  BotMessageSquare,
  ChevronRight,
  Send,
  AlertCircle,
  Flame,
  Award,
} from 'lucide-react';
import { papersApi } from '@/services/api/papers';
import { ragApi } from '@/services/api/rag';
import { Paper, PaperAnalysis, SubjectHistoricalAnalysis, RAGResponse } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { NotebookSurface } from '@/components/notebook/NotebookSurface';
import { StickyNote } from '@/components/notebook/StickyNote';
import { Highlighter } from '@/components/notebook/Highlighter';
import { StarDoodle, LightbulbDoodle } from '@/components/notebook/DoodleIcons';
import { PencilLoader } from '@/components/notebook/PencilLoader';
import { useStudyStore, IntelligenceTab } from '@/store/useStudyStore';

const renderInlineBold = (str: string) => {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={pIdx} className="font-bold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const renderFormattedAnswer = (rawAnswer: any) => {
  let text = typeof rawAnswer === 'string' ? rawAnswer.trim() : '';
  if (typeof rawAnswer === 'object' && rawAnswer !== null) {
    text = rawAnswer.answer || rawAnswer.text || JSON.stringify(rawAnswer, null, 2);
  }
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.answer) text = parsed.answer;
      else if (parsed.response) text = parsed.response;
    } catch {
      // keep original
    }
  }

  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-xs leading-relaxed font-sans">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lIdx} className="h-1" />;

        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={lIdx}
              className="font-bold text-sm text-slate-900 dark:text-white pt-2 pb-0.5 border-b border-stone-200/60 dark:border-slate-800"
            >
              {trimmed.replace(/^###\s+/, '')}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3
              key={lIdx}
              className="font-bold text-base text-slate-900 dark:text-white pt-2 pb-1 border-b border-stone-300 dark:border-slate-700"
            >
              {trimmed.replace(/^##\s+/, '')}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={lIdx} className="font-bold text-lg text-slate-900 dark:text-white pt-2 pb-1">
              {trimmed.replace(/^#\s+/, '')}
            </h2>
          );
        }

        if (
          trimmed.startsWith('* ') ||
          trimmed.startsWith('- ') ||
          trimmed.startsWith('• ')
        ) {
          const content = trimmed.replace(/^[*•-]\s+/, '');
          return (
            <div key={lIdx} className="flex items-start gap-2 pl-2">
              <span className="text-brand-500 font-bold shrink-0 mt-0.5">•</span>
              <span className="text-slate-800 dark:text-slate-200">
                {renderInlineBold(content)}
              </span>
            </div>
          );
        }

        return (
          <p key={lIdx} className="text-slate-800 dark:text-slate-200">
            {renderInlineBold(line)}
          </p>
        );
      })}
    </div>
  );
};

export const PaperStudyWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  // Detect whether we are in the teacher area
  const isTeacherView = location.pathname.startsWith('/teacher');

  const {
    activePaper,
    setActivePaper,
    activeIntelligenceTab,
    setActiveIntelligenceTab,
    jumpToPage,
  } = useStudyStore();

  const [paper, setPaper] = useState<Paper | null>(activePaper);
  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(null);
  const [historical, setHistorical] = useState<SubjectHistoricalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Ask AI tab local state
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiAnswers, setAiAnswers] = useState<
    Array<{ question: string; response: RAGResponse }>
  >([]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Use teacher or student API based on the current route
        const [paperRes, analysisRes] = await Promise.all([
          isTeacherView
            ? papersApi.getTeacherPaper(id)
            : papersApi.getStudentPaper(id),
          isTeacherView
            ? papersApi.getTeacherPaperAnalysis(id)
            : papersApi.getPaperAnalysis(id),
        ]);

        if (paperRes.success && paperRes.data) {
          setPaper(paperRes.data);
          setActivePaper(paperRes.data);

          // If paper has academic_scope_id, fetch historical intelligence
          if (paperRes.data.academic_scope_id) {
            try {
              const histRes = await papersApi.getHistoricalAnalysis(
                paperRes.data.academic_scope_id
              );
              if (histRes.success && histRes.data?.data) {
                setHistorical(histRes.data.data);
              }
            } catch {
              // Historical data optional — continue without it
            }
          }
        }

        if (analysisRes.success && analysisRes.data) {
          setAnalysis(analysisRes.data);
        }
      } catch (err) {
        console.error('Failed to load paper data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, isTeacherView, setActivePaper]);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || isAiLoading) return;

    const q = aiQuestion.trim();
    setAiQuestion('');
    setIsAiLoading(true);

    try {
      const res = await ragApi.query({
        question: q,
        scope: {
          paper_id: id,
          subject_id: paper?.subject?.id,
          branch_id: paper?.branch?.id,
          semester_id: paper?.semester?.id,
          academic_scope_id: paper?.academic_scope_id || undefined,
        },
      });

      if (res.success && res.data) {
        setAiAnswers((prev) => [...prev, { question: q, response: res.data! }]);
      } else {
        // Show error response in the chat
        setAiAnswers((prev) => [
          ...prev,
          {
            question: q,
            response: {
              answer: 'Sorry, I could not get an answer at this moment. Please try again.',
              evidence_level: 'NONE',
              confidence: 'LOW',
              sources: [],
              related_questions: [],
              related_papers: [],
              used_fallback: true,
            } as any,
          },
        ]);
      }
    } catch (err: any) {
      console.error('RAG query failed:', err);
      // Show error in chat
      setAiAnswers((prev) => [
        ...prev,
        {
          question: q,
          response: {
            answer: `⚠️ AI service error: ${err?.response?.data?.error?.message || err?.message || 'Unknown error'}. Please try again.`,
            evidence_level: 'NONE',
            confidence: 'LOW',
            sources: [],
            related_questions: [],
            related_papers: [],
            used_fallback: true,
          } as any,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const tabs: Array<{ id: IntelligenceTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'important_topics', label: 'Important Topics' },
    { id: 'repeated_questions', label: 'Repeated Qs' },
    { id: 'what_to_study', label: 'What to Study' },
    { id: 'mark_distribution', label: 'Marks' },
    { id: 'difficulty', label: 'Difficulty' },
    { id: 'exam_trends', label: 'Trends' },
    { id: 'potential_questions', label: 'Potential Qs' },
    { id: 'ask_ai', label: 'Ask AI' },
  ];

  // Derive topics list dynamically from AI analysis
  const topicsList =
    analysis?.topic_analysis?.major_topics &&
    analysis.topic_analysis.major_topics.length > 0
      ? analysis.topic_analysis.major_topics
      : (paper?.questions || []).length > 0
      ? Array.from(
          new Set((paper?.questions || []).map((q) => q.topic).filter(Boolean))
        ).map((t) => {
          const matchingQs = (paper?.questions || []).filter((q) => q.topic === t);
          const totalMarks = matchingQs.reduce((sum, q) => sum + (q.marks || 0), 0);
          return {
            topic: t,
            importance: matchingQs.length >= 2 ? 'HIGH' : 'MEDIUM',
            frequency: matchingQs.length,
            marks_contribution: totalMarks,
            percentage: Math.round(
              (totalMarks / Math.max(analysis?.mark_distribution?.total_marks || 80, 1)) * 100
            ),
            page_numbers: [1],
          };
        })
      : [];

  const totalMarks =
    analysis?.mark_distribution?.total_marks ||
    paper?.questions?.reduce((sum, q) => sum + (q.marks || 0), 0) ||
    80;

  const authToken = localStorage.getItem('eduarchive_access_token');
  const fileEndpoint = id
    ? isTeacherView
      ? `/api/v1/teacher/papers/${id}/file`
      : `/api/v1/student/papers/${id}/file`
    : undefined;
  const authenticatedPdfUrl = fileEndpoint
    ? `${fileEndpoint}${authToken ? `?token=${encodeURIComponent(authToken)}` : ''}`
    : undefined;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#ece5d8]">
      {/* Top Breadcrumb Bar with Badges */}
      <TopBar
        title={paper?.title || `${paper?.subject?.name || 'Exam Paper'} — ${paper?.year || 2025}`}
        university={paper?.subject?.university || 'SGBAU'}
        semester={paper?.semester?.number || 5}
        onAskAI={() => setActiveIntelligenceTab('ask_ai')}
      />

      <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-6">
        {/* ── Main Split-Screen Study Workspace ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: PDF Viewer */}
          <div className="lg:col-span-6 w-full sticky top-20">
            <PDFViewer
              url={authenticatedPdfUrl}
              title={paper?.original_filename || paper?.title || 'Question_Paper.pdf'}
              initialPage={1}
              className="h-[calc(100vh-140px)] min-h-[580px]"
            />
          </div>

          {/* Right Column: Spiral AI Intelligence Notebook */}
          <div className="lg:col-span-6 w-full">
            <NotebookSurface
              variant="ruled"
              hasSpiral={true}
              hasMarginLine={true}
              className="min-h-[calc(100vh-140px)] flex flex-col justify-between"
            >
              <div>
                {/* Header Title with Lightbulb */}
                <div className="flex items-center justify-between border-b border-stone-300 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="font-handwriting font-bold text-2xl md:text-3xl text-ink flex items-center gap-2">
                      <LightbulbDoodle size={24} />
                      <span>AI Intelligence Notebook</span>
                    </h2>
                  </div>

                  <span className="font-mono text-[11px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    {historical?.papers_count && historical.papers_count > 1
                      ? `Based on ${historical.papers_count} previous papers`
                      : 'Single Paper AI Analysis'}
                  </span>
                </div>

                {/* Notebook Tabs Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 border-b border-stone-200/80 text-xs select-none">
                  {tabs.map((t) => {
                    const isActive = activeIntelligenceTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveIntelligenceTab(t.id)}
                        className={`px-3 py-1.5 rounded-lg font-handwriting font-bold text-sm tracking-wide transition-all shrink-0 ${
                          isActive
                            ? 'bg-purple-200/80 text-purple-950 shadow-xs border border-purple-300'
                            : 'text-slate-600 hover:text-slate-950 hover:bg-stone-200/50'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Panels */}
                {isLoading ? (
                  <div className="py-20 flex justify-center">
                    <PencilLoader size="sm" message="Analyzing question paper..." />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* TAB: Important Topics */}
                    {activeIntelligenceTab === 'important_topics' && (
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-handwriting font-bold text-xl text-ink flex items-center gap-1.5">
                            <span>Extracted Key Topics</span>
                            <StarDoodle size={18} />
                          </h3>
                        </div>

                        {topicsList.length > 0 ? (
                          topicsList.map((item: any, idx: number) => {
                            const pastelColors = [
                              'bg-yellow-50/90 border-yellow-200 text-amber-950',
                              'bg-emerald-50/90 border-emerald-200 text-emerald-950',
                              'bg-pink-50/90 border-pink-200 text-pink-950',
                              'bg-sky-50/90 border-sky-200 text-sky-950',
                              'bg-purple-50/90 border-purple-200 text-purple-950',
                            ];
                            const color = pastelColors[idx % pastelColors.length];

                            return (
                              <div
                                key={idx}
                                className={`p-4 rounded-2xl border ${color} shadow-xs relative overflow-hidden transition-all hover:scale-[1.01]`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-handwriting font-bold text-lg">
                                        {item.topic}
                                      </span>
                                      <span className="text-[10px] font-sans font-bold bg-white/80 border px-2 py-0.5 rounded-full uppercase">
                                        {item.importance || 'High'} Importance
                                      </span>
                                    </div>

                                    <div className="text-xs text-slate-700 mt-1 font-sans">
                                      {item.frequency
                                        ? `Asked in ${item.frequency} question(s)`
                                        : 'Exam Topic'}{' '}
                                      •{' '}
                                      <span className="font-bold">
                                        {item.marks_contribution || 10} marks
                                      </span>{' '}
                                      {item.percentage ? `(${item.percentage}%)` : ''}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <button
                                      onClick={() => jumpToPage(item.page_numbers?.[0] || 1)}
                                      className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 font-handwriting bg-white/90 px-3 py-1.5 rounded-lg border shadow-2xs"
                                    >
                                      <span>View in PDF</span>
                                      <ArrowRight size={13} />
                                    </button>

                                    {item.percentage && (
                                      <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center font-mono text-[10px] font-bold text-brand-700 shadow-2xs">
                                        {item.percentage}%
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-6 text-center text-xs text-slate-500 bg-white/60 rounded-2xl border border-dashed">
                            No topic analysis available yet.
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: Overview */}
                    {activeIntelligenceTab === 'overview' && (
                      <div className="space-y-4 font-sans text-xs text-slate-700 leading-relaxed">
                        <div className="p-4 rounded-2xl bg-white/90 border border-stone-200 shadow-xs">
                          <h4 className="font-handwriting font-bold text-base text-ink mb-1">
                            Paper Overview 📋
                          </h4>
                          <p>
                            {analysis?.exam_trends?.overall_trend ||
                              `This examination paper covers key concepts of ${paper?.subject?.name || 'the subject'} for Semester ${paper?.semester?.number || 5}. All questions have been extracted, indexed, and embedded for AI retrieval.`}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
                            <div className="font-bold text-purple-950 font-handwriting text-sm">
                              Total Questions
                            </div>
                            <div className="text-lg font-bold font-mono text-purple-700 mt-1">
                              {paper?.questions?.length ||
                                analysis?.topic_analysis?.topic_count ||
                                7}{' '}
                              Questions
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                            <div className="font-bold text-amber-950 font-handwriting text-sm">
                              Exam Weightage
                            </div>
                            <div className="text-lg font-bold font-mono text-amber-700 mt-1">
                              {totalMarks} Max Marks
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 col-span-2 sm:col-span-1">
                            <div className="font-bold text-emerald-950 font-handwriting text-sm">
                              Exam Year
                            </div>
                            <div className="text-lg font-bold font-mono text-emerald-700 mt-1">
                              {paper?.year || 2025}
                            </div>
                          </div>
                        </div>

                        {analysis?.exam_trends?.insights && analysis.exam_trends.insights.length > 0 && (
                          <div className="p-4 rounded-2xl bg-white/90 border border-stone-200 shadow-xs space-y-2">
                            <h4 className="font-handwriting font-bold text-sm text-ink flex items-center gap-1.5">
                              <Sparkles size={14} className="text-brand-600" />
                              <span>AI Exam Insights</span>
                            </h4>
                            <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                              {analysis.exam_trends.insights.map((insight: string, idx: number) => (
                                <li key={idx} className="leading-snug">
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: Repeated Qs */}
                    {activeIntelligenceTab === 'repeated_questions' && (
                      <div className="space-y-3">
                        <h3 className="font-handwriting font-bold text-lg text-ink">
                          Historical Repetition Clusters 🔁
                        </h3>

                        {historical?.repetition_clusters && historical.repetition_clusters.length > 0 ? (
                          historical.repetition_clusters.map((cluster: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-white/90 border border-stone-200 shadow-xs space-y-2"
                            >
                              <div className="font-bold text-xs text-slate-900">
                                "{cluster.canonical_question}"
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono">
                                {cluster.years?.map((yr: number, yIdx: number) => (
                                  <React.Fragment key={yr}>
                                    <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold">
                                      {yr}
                                    </span>
                                    {yIdx < cluster.years.length - 1 && <span>→</span>}
                                  </React.Fragment>
                                ))}
                              </div>
                              <div className="text-[11px] text-emerald-700 font-medium">
                                Topic: {cluster.topic || cluster.concept_label || 'Core Concept'} •
                                Occurrence: {cluster.occurrence_count || cluster.years?.length || 2} times
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-950 space-y-2">
                            <div className="font-bold text-sm flex items-center gap-1.5 text-amber-900">
                              <AlertCircle size={15} />
                              <span>Multi-Year Comparison Pending</span>
                            </div>
                            <p className="leading-relaxed">
                              Repetition clustering analyzes question similarity across multiple exam years. Currently,{' '}
                              <strong>{historical?.papers_count || 1} paper</strong> is processed for{' '}
                              <em>{paper?.subject?.name || 'this subject'}</em>.
                            </p>
                            <p className="text-[11px] text-amber-800 font-medium pt-1">
                              💡 <strong>Next Step:</strong> Upload question papers for other years (e.g. 2022, 2023, 2024) under the same Subject & Branch to automatically calculate semantic repetition frequencies.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: What to Study */}
                    {activeIntelligenceTab === 'what_to_study' && (
                      <div className="space-y-3">
                        <h3 className="font-handwriting font-bold text-lg text-ink">
                          Revision Priority Order 🎯
                        </h3>

                        {analysis?.study_recommendations && analysis.study_recommendations.length > 0 ? (
                          <div className="space-y-2">
                            {analysis.study_recommendations.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-3.5 rounded-xl bg-white/90 border border-stone-200 flex items-start gap-3 text-xs"
                              >
                                <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 font-mono text-[11px]">
                                  {item.priority || idx + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="font-bold text-slate-900 font-sans">
                                      {item.topic}
                                    </div>
                                    {item.suggested_time && (
                                      <span className="font-mono text-[10px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                                        ⏱ {item.suggested_time}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-600 mt-1 leading-snug">
                                    {item.reason}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {topicsList.slice(0, 4).map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-3.5 rounded-xl bg-white/90 border border-stone-200 flex items-start gap-3 text-xs"
                              >
                                <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 font-mono text-[11px]">
                                  {idx + 1}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 font-sans">
                                    {item.topic}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    Carries {item.marks_contribution || 10} marks in this examination paper.
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: Marks Distribution */}
                    {activeIntelligenceTab === 'mark_distribution' && (
                      <div className="space-y-4 text-xs font-sans">
                        <h3 className="font-handwriting font-bold text-lg text-ink">
                          Marks & Unit Breakdown 📊
                        </h3>

                        <div className="p-4 rounded-2xl bg-white/90 border border-stone-200 shadow-xs space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                            <span className="font-bold text-slate-800">Total Paper Marks</span>
                            <span className="font-mono font-bold text-base text-brand-700">
                              {totalMarks} Marks
                            </span>
                          </div>

                          {analysis?.unit_distribution && Object.keys(analysis.unit_distribution).length > 0 && (
                            <div className="space-y-2 pt-1">
                              <span className="font-bold text-slate-700">Unit-wise Weightage:</span>
                              {Object.entries(analysis.unit_distribution).map(([unit, data]: [string, any]) => (
                                <div
                                  key={unit}
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80"
                                >
                                  <span className="font-medium text-slate-800">{unit}</span>
                                  <span className="font-mono text-slate-600 font-bold">
                                    {typeof data === 'object' ? data.marks : data} Marks
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {analysis?.mark_distribution?.high_weight_questions &&
                            analysis.mark_distribution.high_weight_questions.length > 0 && (
                              <div className="pt-2">
                                <span className="font-bold text-slate-700 block mb-1.5">
                                  High Scoring Questions:
                                </span>
                                <div className="space-y-1.5">
                                  {analysis.mark_distribution.high_weight_questions.map((hw: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between text-[11px] p-2 bg-purple-50/80 rounded-lg text-purple-950 border border-purple-200"
                                    >
                                      <span>
                                        <strong>{hw.question_number}</strong>: {hw.topic || 'Descriptive Question'}
                                      </span>
                                      <span className="font-mono font-bold">{hw.marks} Marks</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* TAB: Difficulty */}
                    {activeIntelligenceTab === 'difficulty' && (
                      <div className="space-y-3 text-xs font-sans">
                        <h3 className="font-handwriting font-bold text-lg text-ink">
                          Difficulty Level Breakdown ⚖️
                        </h3>

                        <div className="p-4 rounded-2xl bg-white/90 border border-stone-200 shadow-xs space-y-4">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                              <span className="text-emerald-800 font-bold block text-sm">Easy</span>
                              <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">
                                {analysis?.difficulty_analysis?.easy || 2} Qs
                              </span>
                            </div>

                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                              <span className="text-amber-800 font-bold block text-sm">Medium</span>
                              <span className="text-xl font-bold font-mono text-amber-700 mt-1 block">
                                {analysis?.difficulty_analysis?.medium || 4} Qs
                              </span>
                            </div>

                            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                              <span className="text-rose-800 font-bold block text-sm">Hard</span>
                              <span className="text-xl font-bold font-mono text-rose-700 mt-1 block">
                                {analysis?.difficulty_analysis?.hard || 1} Qs
                              </span>
                            </div>
                          </div>

                          {analysis?.difficulty_analysis?.distribution_percentage && (
                            <div className="space-y-1.5 pt-2">
                              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                                <span>Distribution Ratio</span>
                                <span>
                                  {analysis.difficulty_analysis.distribution_percentage.easy}% Easy •{' '}
                                  {analysis.difficulty_analysis.distribution_percentage.medium}% Medium •{' '}
                                  {analysis.difficulty_analysis.distribution_percentage.hard}% Hard
                                </span>
                              </div>
                              <div className="w-full h-3 rounded-full bg-stone-200 overflow-hidden flex">
                                <div
                                  style={{
                                    width: `${analysis.difficulty_analysis.distribution_percentage.easy}%`,
                                  }}
                                  className="bg-emerald-500 h-full"
                                  title="Easy"
                                />
                                <div
                                  style={{
                                    width: `${analysis.difficulty_analysis.distribution_percentage.medium}%`,
                                  }}
                                  className="bg-amber-500 h-full"
                                  title="Medium"
                                />
                                <div
                                  style={{
                                    width: `${analysis.difficulty_analysis.distribution_percentage.hard}%`,
                                  }}
                                  className="bg-rose-500 h-full"
                                  title="Hard"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB: Exam Trends */}
                    {activeIntelligenceTab === 'exam_trends' && (
                      <div className="space-y-3 text-xs font-sans">
                        <h3 className="font-handwriting font-bold text-lg text-ink">
                          Pattern & Trends 📈
                        </h3>

                        <div className="p-4 rounded-2xl bg-white/90 border border-stone-200 shadow-xs space-y-3">
                          <div>
                            <span className="font-bold text-slate-900 block mb-1">
                              Structural Trend:
                            </span>
                            <p className="text-slate-600 leading-relaxed">
                              {analysis?.exam_trends?.overall_trend ||
                                'Structured question paper offering internal choices with steady theoretical weightage across all units.'}
                            </p>
                          </div>

                          {analysis?.exam_trends?.insights && analysis.exam_trends.insights.length > 0 && (
                            <div className="pt-2 border-t border-stone-200">
                              <span className="font-bold text-slate-900 block mb-1.5">
                                Key Observations:
                              </span>
                              <ul className="space-y-1 list-disc list-inside text-slate-600">
                                {analysis.exam_trends.insights.map((ins: string, idx: number) => (
                                  <li key={idx}>{ins}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB: Potential Questions */}
                    {activeIntelligenceTab === 'potential_questions' && (
                      <div className="space-y-3 text-xs font-sans">
                        <h3 className="font-handwriting font-bold text-lg text-ink">
                          AI Predicted Questions 🔮
                        </h3>

                        {analysis?.potential_questions && analysis.potential_questions.length > 0 ? (
                          analysis.potential_questions.map((pq: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-white/90 border border-stone-200 shadow-xs space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                                  {pq.label || 'High Probability'}
                                </span>
                                {pq.estimated_marks && (
                                  <span className="font-mono font-bold text-slate-600">
                                    {pq.estimated_marks} Marks
                                  </span>
                                )}
                              </div>

                              <div className="font-bold text-slate-900 text-xs">
                                "{pq.question}"
                              </div>

                              {pq.basis && (
                                <div className="text-[11px] text-slate-500 italic">
                                  Basis: {pq.basis}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-slate-500 bg-white/60 rounded-xl">
                            Potential questions will appear once full multi-paper clustering is processed.
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: Ask AI */}
                    {activeIntelligenceTab === 'ask_ai' && (
                      <div className="space-y-4">
                        <div className="p-3 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-xl text-xs text-brand-900 dark:text-brand-300 font-sans">
                          💡 <strong>EduArchive AI Assistant:</strong> Ask anything about this question paper (marks, units, specific questions) or general concepts, algorithms, and outside academic topics.
                        </div>

                        {/* Quick Prompt Suggestions */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {[
                            'Which unit carries maximum marks?',
                            'Explain Question 1 solution step-by-step',
                            'What are the key concepts tested here?',
                            'How to score full marks in numerical questions?',
                          ].map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => {
                                setAiQuestion(suggestion);
                              }}
                              className="text-[11px] font-sans px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-slate-700 transition-colors"
                            >
                              ✨ {suggestion}
                            </button>
                          ))}
                        </div>

                        {/* Conversational turns */}
                        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                          {aiAnswers.length > 0 ? (
                            aiAnswers.map((item, idx) => (
                              <div key={idx} className="space-y-2 text-xs">
                                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium">
                                  💬 <span className="font-bold">You:</span> {item.question}
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 leading-relaxed shadow-xs font-sans whitespace-pre-wrap">
                                  <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-bold mb-1.5 text-xs font-mono">
                                    <Sparkles size={14} /> AI Explanation:
                                  </div>
                                  <div className="text-xs leading-relaxed">
                                    {renderFormattedAnswer(item.response.answer)}
                                  </div>

                                  {item.response.sources?.length > 0 && (
                                    <div className="mt-3 pt-2.5 border-t border-stone-200/80 dark:border-slate-800">
                                      <div className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                                        Sources Cited:
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {item.response.sources.map((s, sIdx) => (
                                          <button
                                            key={sIdx}
                                            type="button"
                                            onClick={() => jumpToPage(s.page || 1)}
                                            className="font-mono text-[10px] px-2 py-0.5 bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded hover:bg-purple-100"
                                          >
                                            Page {s.page || 1} • {s.question_number || 'Q'}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-slate-400 dark:text-slate-500 font-sans text-xs">
                              No questions asked yet. Type any question below or pick a quick suggestion above!
                            </div>
                          )}

                          {isAiLoading && (
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-800 shadow-xs">
                              <PencilLoader size="xs" message="Generating grounded academic answer with Gemini 3.8 Flash..." />
                            </div>
                          )}
                        </div>

                        {/* Input Box */}
                        <form onSubmit={handleAskAI} className="relative mt-2">
                          <input
                            type="text"
                            value={aiQuestion}
                            onChange={(e) => setAiQuestion(e.target.value)}
                            placeholder="Ask any question about this paper or general syllabus..."
                            className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-sans text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-xs"
                          />
                          <button
                            type="submit"
                            disabled={isAiLoading || !aiQuestion.trim()}
                            className="absolute right-1.5 top-1.5 p-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg disabled:opacity-50 transition-colors shadow-xs"
                          >
                            <Send size={13} />
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Sticky Notes Section (Derived dynamically from paper) */}
              <div className="pt-6 border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StickyNote color="yellow" rotation={-1} title="Quick Tip">
                  <p>
                    {analysis?.study_recommendations?.[0]?.topic
                      ? `Focus on ${analysis.study_recommendations[0].topic} for high scoring.`
                      : `Review all ${paper?.questions?.length || 7} questions thoroughly.`}
                  </p>
                </StickyNote>

                <StickyNote color="green" rotation={2} title="Weightage Insight">
                  <p>
                    {analysis?.exam_trends?.insights?.[0] ||
                      `Total ${totalMarks} Marks across extracted units.`}
                  </p>
                </StickyNote>

                <StickyNote
                  color="purple"
                  rotation={-2}
                  title="Ask EduArchive"
                  onClick={() => setActiveIntelligenceTab('ask_ai')}
                  className="cursor-pointer"
                >
                  <p className="font-bold">Which topic has highest weightage? →</p>
                </StickyNote>
              </div>
            </NotebookSurface>
          </div>
        </div>
      </div>
    </div>
  );
};
