import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';
export type FontSize = 'sm' | 'base' | 'lg';
export type NotebookStyle = 'ruled' | 'grid' | 'clean';
export type StudyPace = 'exam_focus' | 'comprehensive' | 'quick_summary';

interface ThemeState {
  theme: ThemeMode;
  fontSize: FontSize;
  notebookStyle: NotebookStyle;
  studyPace: StudyPace;
  highContrast: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: FontSize) => void;
  setNotebookStyle: (style: NotebookStyle) => void;
  setStudyPace: (pace: StudyPace) => void;
  setHighContrast: (enabled: boolean) => void;
  initTheme: () => void;
}

const applyThemeToDom = (theme: ThemeMode, fontSize: FontSize) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-font-size', fontSize);
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const savedTheme = (localStorage.getItem('eduarchive_theme') as ThemeMode) || 'light';
  const savedFontSize = (localStorage.getItem('eduarchive_font_size') as FontSize) || 'base';
  const savedNotebookStyle = (localStorage.getItem('eduarchive_notebook_style') as NotebookStyle) || 'ruled';
  const savedStudyPace = (localStorage.getItem('eduarchive_study_pace') as StudyPace) || 'exam_focus';
  const savedHighContrast = localStorage.getItem('eduarchive_high_contrast') === 'true';

  // Apply initially
  applyThemeToDom(savedTheme, savedFontSize);

  return {
    theme: savedTheme,
    fontSize: savedFontSize,
    notebookStyle: savedNotebookStyle,
    studyPace: savedStudyPace,
    highContrast: savedHighContrast,

    initTheme: () => {
      const { theme, fontSize } = get();
      applyThemeToDom(theme, fontSize);
    },

    toggleTheme: () => {
      const nextTheme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('eduarchive_theme', nextTheme);
      applyThemeToDom(nextTheme, get().fontSize);
      set({ theme: nextTheme });
    },

    setTheme: (newTheme: ThemeMode) => {
      localStorage.setItem('eduarchive_theme', newTheme);
      applyThemeToDom(newTheme, get().fontSize);
      set({ theme: newTheme });
    },

    setFontSize: (size: FontSize) => {
      localStorage.setItem('eduarchive_font_size', size);
      applyThemeToDom(get().theme, size);
      set({ fontSize: size });
    },

    setNotebookStyle: (style: NotebookStyle) => {
      localStorage.setItem('eduarchive_notebook_style', style);
      set({ notebookStyle: style });
    },

    setStudyPace: (pace: StudyPace) => {
      localStorage.setItem('eduarchive_study_pace', pace);
      set({ studyPace: pace });
    },

    setHighContrast: (enabled: boolean) => {
      localStorage.setItem('eduarchive_high_contrast', String(enabled));
      set({ highContrast: enabled });
    },
  };
});
