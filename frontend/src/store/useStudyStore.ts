import { create } from 'zustand';
import { Paper, Note } from '@/types';

export type IntelligenceTab =
  | 'overview'
  | 'important_topics'
  | 'repeated_questions'
  | 'what_to_study'
  | 'mark_distribution'
  | 'difficulty'
  | 'exam_trends'
  | 'potential_questions'
  | 'ask_ai';

export type NoteTab =
  | 'summary'
  | 'ask_ai'
  | 'diagram'
  | 'key_concepts'
  | 'important_points'
  | 'flashcards'
  | 'quiz';

interface StudyState {
  // Active Paper study
  activePaper: Paper | null;
  activeIntelligenceTab: IntelligenceTab;
  pdfCurrentPage: number;
  pdfTotalPages: number;
  pdfZoom: number;
  highlightedText: string | null;

  // Active Note study
  activeNote: Note | null;
  activeNoteTab: NoteTab;

  // Actions
  setActivePaper: (paper: Paper | null) => void;
  setActiveIntelligenceTab: (tab: IntelligenceTab) => void;
  setPdfCurrentPage: (page: number) => void;
  setPdfTotalPages: (total: number) => void;
  setPdfZoom: (zoom: number) => void;
  jumpToPage: (page: number, highlight?: string) => void;

  setActiveNote: (note: Note | null) => void;
  setActiveNoteTab: (tab: NoteTab) => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  activePaper: null,
  activeIntelligenceTab: 'important_topics',
  pdfCurrentPage: 1,
  pdfTotalPages: 1,
  pdfZoom: 1.0,
  highlightedText: null,

  activeNote: null,
  activeNoteTab: 'summary',

  setActivePaper: (paper) => set({ activePaper: paper, pdfCurrentPage: 1 }),
  setActiveIntelligenceTab: (tab) => set({ activeIntelligenceTab: tab }),
  setPdfCurrentPage: (page) => set({ pdfCurrentPage: page }),
  setPdfTotalPages: (total) => set({ pdfTotalPages: total }),
  setPdfZoom: (zoom) => set({ pdfZoom: zoom }),
  jumpToPage: (page, highlight) =>
    set({
      pdfCurrentPage: page,
      highlightedText: highlight || null,
    }),

  setActiveNote: (note) => set({ activeNote: note }),
  setActiveNoteTab: (tab) => set({ activeNoteTab: tab }),
}));
