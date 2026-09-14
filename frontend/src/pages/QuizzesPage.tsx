import React, { useState, useEffect } from 'react';
import { HelpCircle, Check, X, RefreshCw, Trophy, ArrowRight, BookOpen, FileText, Layers } from 'lucide-react';
import { notesApi } from '@/services/api/notes';
import { papersApi } from '@/services/api/papers';
import { Note, QuizQuestionItem, Paper, AcademicSubject } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { PencilLoader } from '@/components/notebook/PencilLoader';

type QuizSource = 'subject' | 'paper' | 'note';

export const QuizzesPage: React.FC = () => {
  const [sourceType, setSourceType] = useState<QuizSource>('subject');
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<string>('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');

  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [subjRes, papersRes, notesRes] = await Promise.all([
          papersApi.getSubjects('SGBAU'),
          papersApi.getStudentPapers({ page_size: 50 }),
          notesApi.getNotes(1, 20),
        ]);

        if (subjRes.success && subjRes.data?.subjects?.length) {
          setSubjects(subjRes.data.subjects);
          setSelectedSubjectId(subjRes.data.subjects[0].id);
        }

        if (papersRes.success && papersRes.papers?.length) {
          setPapers(papersRes.papers);
          setSelectedPaperId(papersRes.papers[0].id);
        }

        if (notesRes.success && notesRes.notes?.length) {
          setNotes(notesRes.notes);
          setSelectedNoteId(notesRes.notes[0].id);
        }
      } catch {
        // Handled
      }
    };
    loadInitialData();
  }, []);

  const loadQuiz = async () => {
    setIsLoading(true);
    setUserAnswers({});
    setIsSubmitted(false);

    try {
      if (sourceType === 'subject' && selectedSubjectId) {
        const res = await papersApi.getSubjectQuiz(selectedSubjectId, 8);
        if (res.success && res.data?.quiz_questions?.length) {
          setQuestions(res.data.quiz_questions);
          return;
        }
      } else if (sourceType === 'paper' && selectedPaperId) {
        const res = await papersApi.getPaperQuiz(selectedPaperId, 8);
        if (res.success && res.data?.quiz_questions?.length) {
          setQuestions(res.data.quiz_questions);
          return;
        }
      } else if (sourceType === 'note' && selectedNoteId) {
        const res = await notesApi.getQuiz(selectedNoteId, 8);
        if (res.success && res.data?.quiz_questions?.length) {
          setQuestions(res.data.quiz_questions);
          return;
        }
      }

      setQuestions([]);
    } catch {
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      (sourceType === 'subject' && selectedSubjectId) ||
      (sourceType === 'paper' && selectedPaperId) ||
      (sourceType === 'note' && selectedNoteId)
    ) {
      loadQuiz();
    }
  }, [sourceType, selectedSubjectId, selectedPaperId, selectedNoteId]);

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      const userAns = userAnswers[idx];
      const correctAns = q.correct_answer;
      if (userAns && correctAns) {
        // Match either exact string or prefix like "A"
        if (
          userAns === correctAns ||
          correctAns.startsWith(userAns.charAt(0)) ||
          userAns.startsWith(correctAns.charAt(0))
        ) {
          score += 1;
        }
      }
    });
    return score;
  };

  const selectedTitle =
    sourceType === 'subject'
      ? subjects.find((s) => s.id === selectedSubjectId)?.name || 'Subject'
      : sourceType === 'paper'
      ? papers.find((p) => p.id === selectedPaperId)?.title || 'Question Paper'
      : notes.find((n) => n.id === selectedNoteId)?.title || 'Student Note';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed]">
      <TopBar title="Exam Self-Assessment Quizzes" />

      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-handwriting font-bold text-3xl md:text-4xl text-ink flex items-center gap-2">
              <span>Exam Practice Quiz</span> 📝
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-sans mt-0.5">
              Interactive multiple-choice practice tests synthesized from real university exam papers & syllabus topics.
            </p>
          </div>
        </div>

        {/* Source Switcher & Scope Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-3 font-sans text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <span className="font-bold text-slate-700">Quiz Source:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSourceType('subject')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  sourceType === 'subject'
                    ? 'bg-purple-100 text-purple-950 border border-purple-300'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                }`}
              >
                <BookOpen size={13} />
                <span>By Subject</span>
              </button>

              <button
                onClick={() => setSourceType('paper')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  sourceType === 'paper'
                    ? 'bg-purple-100 text-purple-950 border border-purple-300'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                }`}
              >
                <FileText size={13} />
                <span>By Question Paper</span>
              </button>

              <button
                onClick={() => setSourceType('note')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  sourceType === 'note'
                    ? 'bg-purple-100 text-purple-950 border border-purple-300'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                }`}
              >
                <Layers size={13} />
                <span>By My Notes ({notes.length})</span>
              </button>
            </div>
          </div>

          {/* Dynamic Dropdown based on selected source */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto flex-1">
              {sourceType === 'subject' && subjects.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="font-bold text-slate-700 shrink-0">Select Subject:</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-slate-800 text-xs"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code || 'SGBAU'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {sourceType === 'paper' && papers.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="font-bold text-slate-700 shrink-0">Select Exam Paper:</label>
                  <select
                    value={selectedPaperId}
                    onChange={(e) => setSelectedPaperId(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-slate-800 text-xs"
                  >
                    {papers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.year})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {sourceType === 'note' && (
                <div className="flex items-center gap-2">
                  <label className="font-bold text-slate-700 shrink-0">Select Note:</label>
                  {notes.length > 0 ? (
                    <select
                      value={selectedNoteId}
                      onChange={(e) => setSelectedNoteId(e.target.value)}
                      className="w-full p-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-slate-800 text-xs"
                    >
                      {notes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-slate-500 italic">No notes uploaded. Choose Subject or Question Paper above!</span>
                  )}
                </div>
              )}
            </div>

            {questions.length > 0 && (
              <button
                onClick={loadQuiz}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
              >
                <RefreshCw size={13} />
                <span>Regenerate Quiz</span>
              </button>
            )}
          </div>
        </div>

        {/* Score Banner when Submitted */}
        {isSubmitted && (
          <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <Trophy size={36} className="text-emerald-600" />
              <div>
                <h3 className="font-handwriting font-bold text-2xl">
                  Quiz Completed! Score: {calculateScore()} / {questions.length}
                </h3>
                <p className="text-xs text-emerald-800 font-sans mt-0.5">
                  Review the correct explanations below to solidify your understanding of {selectedTitle}.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setUserAnswers({});
                setIsSubmitted(false);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs font-sans"
            >
              Retake Quiz
            </button>
          </div>
        )}

        {/* Questions List */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <PencilLoader size="md" message={`Generating practice quiz for ${selectedTitle}...`} />
          </div>
        ) : questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#fdfbf7] notebook-ruled-bg border border-stone-200/90 shadow-paper space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 font-sans">
                    Question {idx + 1}. {q.question}
                  </span>
                  {q.unit && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 border text-slate-600 shrink-0">
                      {q.unit}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[idx] === opt;
                    const isCorrect =
                      q.correct_answer === opt ||
                      (q.correct_answer && (q.correct_answer.startsWith(opt.charAt(0)) || opt.startsWith(q.correct_answer.charAt(0))));

                    return (
                      <button
                        key={optIdx}
                        disabled={isSubmitted}
                        onClick={() =>
                          setUserAnswers((prev) => ({ ...prev, [idx]: opt }))
                        }
                        className={`w-full text-left p-3 rounded-xl border text-xs font-sans transition-all flex items-center justify-between ${
                          isSubmitted
                            ? isCorrect
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold'
                              : isSelected
                              ? 'bg-rose-100 border-rose-400 text-rose-950'
                              : 'bg-white/80 border-stone-200 opacity-60'
                            : isSelected
                            ? 'bg-brand-100 border-brand-400 text-brand-950 font-bold'
                            : 'bg-white/80 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSubmitted && isCorrect && (
                          <Check size={16} className="text-emerald-700" />
                        )}
                        {isSubmitted && isSelected && !isCorrect && (
                          <X size={16} className="text-rose-700" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isSubmitted && q.explanation && (
                  <div className="mt-3 p-3.5 bg-white/90 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-serif leading-relaxed">
                    💡 <span className="font-bold font-sans">Explanation:</span> {q.explanation}
                  </div>
                )}
              </div>
            ))}

            {!isSubmitted && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsSubmitted(true)}
                  disabled={Object.keys(userAnswers).length === 0}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50 font-sans"
                >
                  Submit Quiz Answers ({Object.keys(userAnswers).length}/{questions.length})
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center bg-[#fdfbf7] notebook-ruled-bg rounded-3xl border border-stone-200 p-8 space-y-2">
            <h3 className="font-handwriting font-bold text-2xl text-ink">
              No quiz questions available for {selectedTitle}
            </h3>
            <p className="text-xs text-slate-600 font-sans">
              Select another subject or question paper above to generate multiple-choice practice questions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
