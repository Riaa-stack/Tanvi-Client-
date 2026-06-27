import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { SlidersHorizontal } from 'lucide-react';

export default function CompactToggle() {
  const { isCompact, toggleCompact } = useTheme();

  return (
    <button
      onClick={toggleCompact}
      className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-[#1E293B] dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm text-xs font-semibold font-mono"
      title={isCompact ? 'Switch to Cozy Layout' : 'Switch to Compact Layout'}
    >
      <SlidersHorizontal className={`h-3.5 w-3.5 ${isCompact ? 'text-blue-500' : 'text-slate-400'}`} />
      <span className="text-slate-500 dark:text-slate-400">
        {isCompact ? 'COMPACT ON' : 'COMPACT OFF'}
      </span>
      {/* Mini toggle pill */}
      <span className={`w-6 h-3 rounded-full relative transition-colors ${isCompact ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
        <span className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all ${isCompact ? 'left-3.5' : 'left-0.5'}`} />
      </span>
    </button>
  );
}
