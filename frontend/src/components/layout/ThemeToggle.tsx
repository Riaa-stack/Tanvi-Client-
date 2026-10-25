import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center gap-2 p-2 rounded-xl transition-all duration-200 ${
        isDark
          ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700 shadow-xs'
          : 'bg-stone-100 text-slate-700 hover:bg-stone-200 border border-stone-200 shadow-2xs'
      } ${className}`}
    >
      {isDark ? (
        <Sun size={16} className="text-amber-400 rotate-0 transition-transform duration-300" />
      ) : (
        <Moon size={16} className="text-slate-600 rotate-0 transition-transform duration-300" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold font-sans">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
