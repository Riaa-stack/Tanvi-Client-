import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  BotMessageSquare,
  Network,
  HelpCircle,
  Send,
  Check,
  X,
  RotateCw,
  ArrowRight,
  ListCheck,
  Star,
  Bookmark,
  FileText,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { notesApi } from '@/services/api/notes';
import { Note, NoteAnalysis, QuizQuestionItem, DiagramData } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { NotebookSurface } from '@/components/notebook/NotebookSurface';
import { PencilLoader } from '@/components/notebook/PencilLoader';
import { useStudyStore, NoteTab } from '@/store/useStudyStore';

export const NoteStudyWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { activeNoteTab, setActiveNoteTab } = useStudyStore();

  const [note, setNote] = useState<Note | null>(null);
  const [analysis, setAnalysis] = useState<NoteAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Tab dynamic states
  const [summaryMode, setSummaryMode] = useState<'quick' | 'detailed' | 'exam'>('quick');
  const [summaryContent, setSummaryContent] = useState<string>('');
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);

  // Q&A state
  const [questionText, setQuestionText] = useState<string>('');
  const [qaHistory, setQaHistory] = useState<
    Array<{
      question: string;
      answer: string;
      foundInNote: boolean;
      confidence?: number;
      sourceChunks?: any[];
    }>
  >([]);
  const [isQaLoading, setIsQaLoading] = useState<boolean>(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionItem[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showQuizResults, setShowQuizResults] = useState<boolean>(false);
  const [isQuizLoading, setIsQuizLoading] = useState<boolean>(false);

  // Diagram state
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null);
  const [isDiagramLoading, setIsDiagramLoading] = useState<boolean>(false);

  // Key concepts state
  const [keyConceptsList, setKeyConceptsList] = useState<Array<{ concept: string; definition: string; page_reference?: string }>>([]);
  const [importantPointsList, setImportantPointsList] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;

    const loadNote = async () => {
      setIsLoading(true);
      try {
        const [noteRes, analysisRes] = await Promise.all([
          notesApi.getNote(id),
          notesApi.getNoteAnalysis(id).catch(() => null),
        ]);

        if (noteRes.success && noteRes.data) {
          setNote(noteRes.data);
        }

        if (analysisRes && analysisRes.success && analysisRes.data) {
          const a = analysisRes.data;
          setAnalysis(a);
          if (a.key_concepts && a.key_concepts.length > 0) {
            setKeyConceptsList(a.key_concepts as any);
          }
          if (a.important_points && a.important_points.length > 0) {
            setImportantPointsList(a.important_points);
          }
          if (a.summary?.quick) {
            setSummaryContent(a.summary.quick);
          }
        }
      } catch (err) {
        console.error('Failed to load note details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [id]);

  // Handle Summary Switch
  const handleSummaryChange = async (mode: 'quick' | 'detailed' | 'exam') => {
    setSummaryMode(mode);
    if (!id) return;

    // Use cached summary if already present in analysis
    if (analysis?.summary && analysis.summary[mode]) {
      setSummaryContent(analysis.summary[mode]!);
      return;
    }

    setIsSummaryLoading(true);
    try {
      const res = await notesApi.summarizeNote(id, mode);
      if (res.success && res.data?.summary) {
        const generatedSummary = res.data.summary;
        setSummaryContent(generatedSummary);
        setAnalysis((prev) =>
          prev
            ? {
                ...prev,
                summary: {
                  ...prev.summary,
                  [mode]: generatedSummary,
                },
              }
            : null
        );
      }
    } catch (err) {
      console.error('Failed to summarize note:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Handle Note-only Question
  const handleAskQuestion = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const query = (customQ || questionText).trim();
    if (!id || !query || isQaLoading) return;

    setQuestionText('');
    setIsQaLoading(true);

    try {
      const res = await notesApi.queryNote(id, query);
      if (res.success && res.data) {
        const d = res.data;
        setQaHistory((prev) => [
          ...prev,
          {
            question: query,
            answer: d.answer,
            foundInNote: d.found_in_note,
            confidence: d.confidence,
            sourceChunks: d.source_chunks,
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to query note:', err);
      setQaHistory((prev) => [
        ...prev,
        {
          question: query,
          answer: 'Unable to query note at this time. Please try again.',
          foundInNote: false,
        },
      ]);
    } finally {
      setIsQaLoading(false);
    }
  };

  // Load Quiz
  const handleLoadQuiz = async (forceRefresh = false) => {
    if (!id) return;
    if (!forceRefresh && quizQuestions.length > 0) return;

    setIsQuizLoading(true);
    setQuizAnswers({});
    setShowQuizResults(false);
    try {
      const res = await notesApi.getQuiz(id, 6);
      if (res.success && res.data?.quiz_questions && res.data.quiz_questions.length > 0) {
        setQuizQuestions(res.data.quiz_questions);
      }
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setIsQuizLoading(false);
    }
  };

  // Load Diagram
  const handleLoadDiagram = async (forceRefresh = false) => {
    if (!id) return;
    if (!forceRefresh && diagramData) return;

    setIsDiagramLoading(true);
    try {
      const res = await notesApi.getDiagram(id);
      if (res.success && res.data) {
        setDiagramData(res.data);
      }
    } catch (err) {
      console.error('Failed to generate diagram:', err);
    } finally {
      setIsDiagramLoading(false);
    }
  };

  // Load Key Concepts
  const handleLoadKeyConcepts = async () => {
    if (!id) return;
    if (keyConceptsList.length > 0) return;

    try {
      const res = await notesApi.getKeyConcepts(id);
      if (res.success && res.data?.key_concepts) {
        setKeyConceptsList(res.data.key_concepts as any);
      }
    } catch (err) {
      console.error('Failed to get key concepts:', err);
    }
  };

  // Trigger data fetch when switching tabs
  useEffect(() => {
    if (activeNoteTab === 'quiz') {
      handleLoadQuiz();
    } else if (activeNoteTab === 'diagram') {
      handleLoadDiagram();
    } else if (activeNoteTab === 'key_concepts') {
      handleLoadKeyConcepts();
    }
  }, [activeNoteTab]);

  const tabs: Array<{ id: NoteTab; label: string; icon: string }> = [
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'key_concepts', label: 'Key Concepts', icon: '⭐' },
    { id: 'important_points', label: 'Important Points', icon: '📌' },
    { id: 'diagram', label: 'Concept Map', icon: '🗺️' },
    { id: 'ask_ai', label: 'Ask Note AI', icon: '💬' },
    { id: 'quiz', label: 'Quiz Me', icon: '🎯' },
  ];

  // Calculate Quiz Score
  const calculateQuizScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      const selected = quizAnswers[idx];
      if (!selected) return;
      const isLetterMatch =
        q.correct_answer.trim().toLowerCase() === selected.trim().toLowerCase();
      const isFirstCharMatch =
        q.correct_answer.trim().charAt(0).toLowerCase() === selected.trim().charAt(0).toLowerCase();
      const isSubstringMatch =
        selected.includes(q.correct_answer) || q.correct_answer.includes(selected);
      if (isLetterMatch || isFirstCharMatch || isSubstringMatch) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#ece5d8]">
      <TopBar title={note?.title || 'Student Lecture Note'} />

      <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Note Metadata Banner */}
        <div className="bg-white/80 border border-stone-300/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-xl shadow-xs">
              📚
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg text-slate-900 font-sans">
                {note?.title || 'Uploaded Lecture Note'}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                <span>{note?.original_filename || 'note.pdf'}</span>
                <span>•</span>
                <span>{note?.page_count ? `${note.page_count} Pages` : '17 Pages'}</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {note?.status || 'READY'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-purple-900 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
              <span>🔒</span> Note Isolation Active (Zero Hallucination)
            </span>
          </div>
        </div>

        {/* Split Screen Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: PDF Note Viewer */}
          <div className="lg:col-span-6 w-full sticky top-20">
            <PDFViewer
              url={id ? `/api/v1/notes/${id}/file` : undefined}
              title={note?.original_filename || note?.title || 'Lecture_Notes.pdf'}
              totalPages={note?.page_count || 17}
              initialPage={1}
              className="h-[calc(100vh-180px)] min-h-[580px]"
            />
          </div>

          {/* Right: Notebook AI Panel */}
          <div className="lg:col-span-6 w-full">
            <NotebookSurface
              variant="ruled"
              hasSpiral={true}
              hasMarginLine={true}
              className="min-h-[calc(100vh-180px)] flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-300 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    <h2 className="font-handwriting font-bold text-2xl md:text-3xl text-ink">
                      Note Intelligence AI
                    </h2>
                  </div>
                  <span className="font-mono text-[10px] text-purple-900 bg-purple-100 border border-purple-300 px-2.5 py-1 rounded-full font-bold shadow-xs">
                    Grounded in Note
                  </span>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 border-b border-stone-200/80 text-xs select-none scrollbar-none">
                  {tabs.map((t) => {
                    const isActive = activeNoteTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveNoteTab(t.id)}
                        className={`px-3 py-1.5 rounded-xl font-handwriting font-bold text-sm tracking-wide transition-all shrink-0 flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-purple-200/90 text-purple-950 shadow-xs border border-purple-300 scale-102'
                            : 'text-slate-600 hover:text-slate-950 hover:bg-stone-200/50'
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* ─── TAB CONTENT: SUMMARY ───────────────────────────────── */}
                {activeNoteTab === 'summary' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 bg-stone-100/90 p-1 rounded-xl border border-stone-300/80">
                        {(['quick', 'detailed', 'exam'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => handleSummaryChange(mode)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition-all ${
                              summaryMode === mode
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>

                      {analysis?.detected_topics && analysis.detected_topics.length > 0 && (
                        <span className="text-[11px] font-mono text-slate-500">
                          {analysis.detected_topics.length} Topics Identified
                        </span>
                      )}
                    </div>

                    {isSummaryLoading ? (
                      <div className="py-12 flex justify-center">
                        <PencilLoader size="sm" message={`Generating ${summaryMode} summary...`} />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-white/95 border border-stone-200 text-xs md:text-sm text-slate-900 leading-relaxed font-serif shadow-xs whitespace-pre-line">
                          {summaryContent ||
                            (analysis?.summary?.quick
                              ? analysis.summary.quick
                              : 'No summary generated yet. Uploaded notes are processed with strict isolation.')}
                        </div>

                        {/* Detected Topics Tags */}
                        {analysis?.detected_topics && analysis.detected_topics.length > 0 && (
                          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                            <div className="text-[11px] font-mono font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1">
                              <span>🏷️</span> Detected Subject Topics
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {analysis.detected_topics.map((topic, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-[11px] font-sans font-medium text-purple-950 shadow-xs"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TAB CONTENT: KEY CONCEPTS ─────────────────────────── */}
                {activeNoteTab === 'key_concepts' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-handwriting font-bold text-xl text-ink flex items-center gap-2">
                        <span>⭐</span> Core Concepts & Definitions ({keyConceptsList.length})
                      </h3>
                      {keyConceptsList.length === 0 && (
                        <button
                          onClick={handleLoadKeyConcepts}
                          className="text-xs font-mono font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200"
                        >
                          Load Concepts
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                      {keyConceptsList.length > 0 ? (
                        keyConceptsList.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-white/95 border border-stone-200 shadow-xs hover:border-purple-300 transition-all space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900 text-sm md:text-base font-handwriting">
                                {item.concept}
                              </span>
                              {item.page_reference && (
                                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                  {item.page_reference}
                                </span>
                              )}
                            </div>
                            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
                              {item.definition}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center bg-white/80 rounded-2xl border border-stone-200 space-y-2">
                          <p className="text-xs text-slate-600">Extracting key concepts from this note...</p>
                          <PencilLoader size="sm" message="Analyzing concepts..." />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── TAB CONTENT: IMPORTANT POINTS ──────────────────────── */}
                {activeNoteTab === 'important_points' && (
                  <div className="space-y-4">
                    <h3 className="font-handwriting font-bold text-xl text-ink flex items-center gap-2">
                      <span>📌</span> High-Yield Revision Points ({importantPointsList.length})
                    </h3>

                    <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                      {importantPointsList.length > 0 ? (
                        importantPointsList.map((pt, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs md:text-sm text-amber-950 flex items-start gap-3 shadow-xs hover:bg-amber-50 transition-colors"
                          >
                            <span className="font-bold text-amber-800 shrink-0 font-mono bg-amber-100 px-2 py-0.5 rounded-md text-[11px]">
                              #{idx + 1}
                            </span>
                            <p className="leading-relaxed font-serif">{pt}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center bg-white/80 rounded-2xl border border-stone-200 text-xs text-slate-600">
                          Important points will appear here once note analysis completes.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── TAB CONTENT: DIAGRAM / CONCEPT MAP ─────────────────── */}
                {activeNoteTab === 'diagram' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-handwriting font-bold text-xl text-ink flex items-center gap-2">
                          <span>🗺️</span> {diagramData?.title || 'Visual Concept Map'}
                        </h3>
                        {diagramData?.diagram_type && (
                          <span className="text-[10px] font-mono uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            {diagramData.diagram_type.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleLoadDiagram(true)}
                        disabled={isDiagramLoading}
                        className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-bold text-slate-700 hover:bg-stone-50 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        <RotateCw size={12} className={isDiagramLoading ? 'animate-spin' : ''} />
                        <span>Regenerate</span>
                      </button>
                    </div>

                    {isDiagramLoading ? (
                      <div className="py-12 flex justify-center">
                        <PencilLoader size="sm" message="Mapping concepts and relationships from note..." />
                      </div>
                    ) : diagramData && diagramData.nodes && diagramData.nodes.length > 0 ? (
                      <div className="p-5 rounded-2xl bg-white/95 border border-stone-200 shadow-sm space-y-4 max-h-[460px] overflow-y-auto">
                        {/* Interactive Node Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {diagramData.nodes.map((node) => (
                            <div
                              key={node.id}
                              className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/90 shadow-xs space-y-1"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs md:text-sm text-purple-950 font-sans">
                                  {node.label}
                                </span>
                                {node.type && (
                                  <span className="text-[9px] uppercase font-mono font-bold text-purple-700 bg-white px-1.5 py-0.5 rounded-md border border-purple-200">
                                    {node.type}
                                  </span>
                                )}
                              </div>
                              {node.description && (
                                <p className="text-[11px] text-purple-900/80 font-serif leading-snug">
                                  {node.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Connection Flow/Edges */}
                        {diagramData.edges && diagramData.edges.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-stone-200 space-y-2">
                            <div className="text-[11px] font-mono font-bold text-slate-600 uppercase">
                              🔗 Key Relationships & Flow
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {diagramData.edges.map((edge, idx) => {
                                const fromNode = diagramData.nodes.find((n) => n.id === edge.from);
                                const toNode = diagramData.nodes.find((n) => n.id === edge.to);
                                return (
                                  <div
                                    key={idx}
                                    className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs font-sans flex items-center gap-2 justify-between flex-wrap"
                                  >
                                    <span className="font-semibold text-slate-800">
                                      {fromNode?.label || edge.from}
                                    </span>
                                    <div className="flex items-center gap-1 text-[11px] text-purple-700 font-mono font-bold bg-purple-50 px-2 py-0.5 rounded-md">
                                      <span>─►</span>
                                      <span>{edge.label || 'relates to'}</span>
                                    </div>
                                    <span className="font-semibold text-slate-800">
                                      {toNode?.label || edge.to}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-white/80 rounded-2xl border border-stone-200 space-y-3">
                        <p className="text-xs text-slate-600">No concept map generated yet.</p>
                        <button
                          onClick={() => handleLoadDiagram(true)}
                          className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-xs"
                        >
                          Generate Concept Map
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TAB CONTENT: ASK QUESTIONS (STRICTLY NOTE-GROUNDED) ─── */}
                {activeNoteTab === 'ask_ai' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-50/90 border border-purple-200 rounded-xl text-xs text-purple-950 font-sans flex items-center justify-between">
                      <span>🔒 Strictly Note-Grounded: Answers are extracted exclusively from this uploaded note.</span>
                    </div>

                    {/* Quick Suggested Prompts */}
                    {qaHistory.length === 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-mono text-slate-500 font-bold uppercase">
                          💡 Suggested Questions
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'What is Machine Learning according to this note?',
                            'What are the main types of learning covered?',
                            'What are the characteristics of ML listed?',
                          ].map((prompt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAskQuestion(undefined, prompt)}
                              className="text-left text-xs bg-white hover:bg-stone-50 border border-stone-300/80 px-3 py-1.5 rounded-xl text-slate-800 transition-colors shadow-xs"
                            >
                              💬 {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chat Turn History */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {qaHistory.map((qa, idx) => (
                        <div key={idx} className="space-y-2 text-xs">
                          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-900 font-medium font-sans flex items-center gap-2">
                            <span>💬</span>
                            <span>{qa.question}</span>
                          </div>
                          <div
                            className={`p-4 rounded-xl border leading-relaxed font-serif shadow-xs ${
                              qa.foundInNote
                                ? 'bg-white border-stone-200 text-slate-900'
                                : 'bg-amber-50 border-amber-200 text-amber-950'
                            }`}
                          >
                            <p>{qa.answer}</p>
                            {qa.foundInNote && (
                              <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                                <span className="text-emerald-700 font-bold">✓ Verified Note Citation</span>
                                {qa.confidence && (
                                  <span>Confidence: {Math.round(qa.confidence * 100)}%</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {isQaLoading && (
                        <div className="p-4 rounded-xl bg-white/90 border border-stone-200 flex items-center justify-center">
                          <PencilLoader size="sm" message="Searching note content..." />
                        </div>
                      )}
                    </div>

                    <form onSubmit={(e) => handleAskQuestion(e)} className="relative mt-2">
                      <input
                        type="text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Ask anything from this note..."
                        className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-sans focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-xs"
                      />
                      <button
                        type="submit"
                        disabled={isQaLoading || !questionText.trim()}
                        className="absolute right-1.5 top-1.5 p-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                      >
                        <Send size={13} />
                      </button>
                    </form>
                  </div>
                )}

                {/* ─── TAB CONTENT: QUIZ ME ───────────────────────────────── */}
                {activeNoteTab === 'quiz' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-handwriting font-bold text-xl text-ink flex items-center gap-2">
                        <span>🎯</span> Self-Assessment Quiz ({quizQuestions.length} Questions)
                      </h3>

                      <button
                        onClick={() => handleLoadQuiz(true)}
                        disabled={isQuizLoading}
                        className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-bold text-slate-700 hover:bg-stone-50 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        <RotateCw size={12} className={isQuizLoading ? 'animate-spin' : ''} />
                        <span>New Quiz</span>
                      </button>
                    </div>

                    {isQuizLoading ? (
                      <div className="py-12 flex justify-center">
                        <PencilLoader size="sm" message="Generating custom quiz from note content..." />
                      </div>
                    ) : quizQuestions.length > 0 ? (
                      <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                        {/* Score Banner after submission */}
                        {showQuizResults && (
                          <div className="p-4 rounded-xl bg-purple-100 border border-purple-300 text-purple-950 flex items-center justify-between shadow-xs">
                            <div className="font-sans font-bold text-sm">
                              Score: {calculateQuizScore()} / {quizQuestions.length} (
                              {Math.round((calculateQuizScore() / quizQuestions.length) * 100)}%)
                            </div>
                            <button
                              onClick={() => {
                                setQuizAnswers({});
                                setShowQuizResults(false);
                              }}
                              className="px-3 py-1 bg-white text-purple-900 border border-purple-300 rounded-lg text-xs font-bold shadow-xs hover:bg-purple-50"
                            >
                              Retake
                            </button>
                          </div>
                        )}

                        {quizQuestions.map((q, qIdx) => {
                          const userSelected = quizAnswers[qIdx];
                          return (
                            <div
                              key={qIdx}
                              className="p-4 rounded-2xl bg-white/95 border border-stone-200 text-xs space-y-3 shadow-xs"
                            >
                              <div className="font-bold text-slate-900 font-sans text-sm">
                                Q{qIdx + 1}. {q.question}
                              </div>

                              <div className="space-y-2">
                                {q.options.map((opt, optIdx) => {
                                  const isSelected = userSelected === opt;
                                  const isOptionCorrect =
                                    q.correct_answer.trim().toLowerCase() === opt.trim().toLowerCase() ||
                                    q.correct_answer.trim().charAt(0).toLowerCase() ===
                                      opt.trim().charAt(0).toLowerCase() ||
                                    opt.includes(q.correct_answer) ||
                                    q.correct_answer.includes(opt);

                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => {
                                        if (!showQuizResults) {
                                          setQuizAnswers((prev) => ({ ...prev, [qIdx]: opt }));
                                        }
                                      }}
                                      disabled={showQuizResults}
                                      className={`w-full text-left p-3 rounded-xl border text-xs font-sans transition-all flex items-center justify-between ${
                                        showQuizResults
                                          ? isOptionCorrect
                                            ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold'
                                            : isSelected
                                            ? 'bg-rose-100 border-rose-400 text-rose-950 font-medium'
                                            : 'bg-stone-50/60 border-stone-200 text-slate-500'
                                          : isSelected
                                          ? 'bg-purple-100 border-purple-400 text-purple-950 font-bold shadow-xs'
                                          : 'bg-white border-stone-200 hover:bg-stone-50 text-slate-800'
                                      }`}
                                    >
                                      <span>{opt}</span>
                                      {showQuizResults && isOptionCorrect && (
                                        <Check size={14} className="text-emerald-700 shrink-0" />
                                      )}
                                      {showQuizResults && isSelected && !isOptionCorrect && (
                                        <X size={14} className="text-rose-700 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {showQuizResults && q.explanation && (
                                <div className="text-xs text-emerald-900 bg-emerald-50/90 border border-emerald-200 p-3 rounded-xl mt-1 font-serif leading-relaxed">
                                  💡 <span className="font-bold">Explanation:</span> {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {!showQuizResults && (
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => setShowQuizResults(true)}
                              disabled={Object.keys(quizAnswers).length === 0}
                              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50 transition-all"
                            >
                              Submit & Check Answers
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-white/80 rounded-2xl border border-stone-200 space-y-3">
                        <p className="text-xs text-slate-600">No quiz questions generated yet.</p>
                        <button
                          onClick={() => handleLoadQuiz(true)}
                          className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-xs"
                        >
                          Generate Quiz
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </NotebookSurface>
          </div>
        </div>
      </div>
    </div>
  );
};
