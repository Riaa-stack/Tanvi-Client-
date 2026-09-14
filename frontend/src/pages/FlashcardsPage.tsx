import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, RotateCw, CheckCircle, ArrowRight, BookOpen, FileText, Shuffle } from 'lucide-react';
import { notesApi } from '@/services/api/notes';
import { papersApi } from '@/services/api/papers';
import { Note, FlashcardItem, Paper, AcademicSubject } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { PencilLoader } from '@/components/notebook/PencilLoader';
import { StickyNote } from '@/components/notebook/StickyNote';

type FlashcardSource = 'subject' | 'paper' | 'note';

export const FlashcardsPage: React.FC = () => {
  const [sourceType, setSourceType] = useState<FlashcardSource>('subject');
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<string>('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');

  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load initial subjects, papers, notes
  useEffect(() => {
    const loadData = async () => {
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
    loadData();
  }, []);

  const loadFlashcards = async () => {
    setIsLoading(true);
    setIsFlipped(false);
    setCurrentIndex(0);

    try {
      if (sourceType === 'subject' && selectedSubjectId) {
        const res = await papersApi.getSubjectFlashcards(selectedSubjectId, 10);
        if (res.success && res.data?.flashcards?.length) {
          setFlashcards(res.data.flashcards);
          return;
        }
      } else if (sourceType === 'paper' && selectedPaperId) {
        const res = await papersApi.getPaperFlashcards(selectedPaperId, 10);
        if (res.success && res.data?.flashcards?.length) {
          setFlashcards(res.data.flashcards);
          return;
        }
      } else if (sourceType === 'note' && selectedNoteId) {
        const res = await notesApi.getFlashcards(selectedNoteId, 10);
        if (res.success && res.data?.flashcards?.length) {
          setFlashcards(res.data.flashcards);
          return;
        }
      }

      setFlashcards([]);
    } catch {
      setFlashcards([]);
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
      loadFlashcards();
    }
  }, [sourceType, selectedSubjectId, selectedPaperId, selectedNoteId]);

  const handleShuffle = () => {
    setIsFlipped(false);
    setFlashcards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  const selectedTitle =
    sourceType === 'subject'
      ? subjects.find((s) => s.id === selectedSubjectId)?.name || 'Subject'
      : sourceType === 'paper'
      ? papers.find((p) => p.id === selectedPaperId)?.title || 'Question Paper'
      : notes.find((n) => n.id === selectedNoteId)?.title || 'Student Note';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed]">
      <TopBar title="Interactive Digital Flashcards" />

      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-handwriting font-bold text-3xl md:text-4xl text-ink flex items-center gap-2">
              <span>Flashcard Revision</span> 📇
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-sans mt-0.5">
              Active recall flashcards dynamically generated from university syllabus, exam questions & notes.
            </p>
          </div>
        </div>

        {/* Source Switcher & Scope Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-3 font-sans text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <span className="font-bold text-slate-700">Study Source:</span>
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
                    <span className="text-slate-500 italic">No student notes uploaded yet. Upload a note or use Subject flashcards!</span>
                  )}
                </div>
              )}
            </div>

            {flashcards.length > 0 && (
              <button
                onClick={handleShuffle}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Shuffle size={13} />
                <span>Shuffle Cards</span>
              </button>
            )}
          </div>
        </div>

        {/* Center Flashcard Surface */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <PencilLoader size="md" message={`Generating flashcards for ${selectedTitle}...`} />
          </div>
        ) : flashcards.length > 0 ? (
          <div className="flex flex-col items-center space-y-6 py-4">
            {/* 3D Flip Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-2xl h-72 perspective-1000 cursor-pointer select-none"
            >
              <div
                className={`relative w-full h-full duration-500 transform-style-preserve-3d transition-transform ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden p-8 rounded-3xl bg-white/95 border-2 border-stone-300 shadow-notebook flex flex-col justify-between text-center notebook-ruled-bg">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500 uppercase">
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 border">
                      {flashcards[currentIndex]?.unit || selectedTitle}
                    </span>
                    <span>Card {currentIndex + 1} of {flashcards.length}</span>
                    <span className="text-brand-600 font-bold">{flashcards[currentIndex]?.difficulty || 'MEDIUM'}</span>
                  </div>

                  <div className="font-handwriting font-bold text-2xl md:text-3xl text-ink my-auto px-6 leading-relaxed">
                    {flashcards[currentIndex]?.front}
                  </div>

                  <div className="text-xs text-brand-600 font-bold font-handwriting flex items-center justify-center gap-1">
                    <RotateCw size={13} />
                    <span>Click card to reveal answer</span>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 p-8 rounded-3xl bg-purple-50/95 border-2 border-purple-300 shadow-notebook flex flex-col justify-between text-center">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-purple-700 uppercase">
                    <span>Explanation & Key Concepts</span>
                    <span>✓ Core Exam Solution</span>
                  </div>

                  <div className="font-serif text-sm md:text-base text-purple-950 leading-relaxed my-auto px-6 whitespace-pre-line">
                    {flashcards[currentIndex]?.back}
                  </div>

                  <div className="text-xs text-purple-600 font-bold font-handwriting">
                    Click to flip to front
                  </div>
                </div>
              </div>
            </div>

            {/* Nav Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex((prev) => Math.max(prev - 1, 0));
                }}
                disabled={currentIndex <= 0}
                className="px-5 py-2.5 rounded-xl border border-stone-300 bg-white font-bold text-xs shadow-xs disabled:opacity-40 hover:bg-stone-50 font-sans"
              >
                ← Previous Card
              </button>

              <span className="font-mono text-xs font-bold text-slate-700 bg-stone-100 px-3 py-1.5 rounded-lg">
                {currentIndex + 1} / {flashcards.length}
              </span>

              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex((prev) => Math.min(prev + 1, flashcards.length - 1));
                }}
                disabled={currentIndex >= flashcards.length - 1}
                className="px-5 py-2.5 rounded-xl border border-stone-300 bg-white font-bold text-xs shadow-xs disabled:opacity-40 hover:bg-stone-50 font-sans"
              >
                Next Card →
              </button>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center bg-[#fdfbf7] notebook-ruled-bg rounded-3xl border border-stone-200 p-8 space-y-2">
            <h3 className="font-handwriting font-bold text-2xl text-ink">
              No flashcards available for {selectedTitle}
            </h3>
            <p className="text-xs text-slate-600 font-sans">
              Select another subject or question paper above to generate active recall flashcards.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
