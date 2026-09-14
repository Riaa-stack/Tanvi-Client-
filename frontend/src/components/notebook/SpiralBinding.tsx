import React from 'react';

interface SpiralBindingProps {
  count?: number;
  className?: string;
  side?: 'left' | 'top';
}

export const SpiralBinding: React.FC<SpiralBindingProps> = ({
  count = 14,
  className = '',
  side = 'left',
}) => {
  const items = Array.from({ length: count });

  if (side === 'top') {
    return (
      <div className={`flex justify-around items-center px-4 -mt-3 relative z-20 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-3.5 h-6 rounded-full bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 shadow-md border border-slate-400/40" />
            <div className="w-2.5 h-2.5 -mt-1.5 rounded-full bg-slate-900/30 shadow-inner" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-around items-center py-6 z-20 pointer-events-none ${className}`}
    >
      {items.map((_, i) => (
        <div key={i} className="relative flex items-center w-full justify-center my-1">
          {/* Notebook Punch Hole */}
          <div className="w-3.5 h-3.5 rounded-full bg-desk border border-stone-300/60 shadow-inner" />
          {/* Metallic Wire Ring */}
          <div className="absolute -left-1.5 w-7 h-3 rounded-full bg-gradient-to-b from-slate-300 via-white to-slate-400 shadow-md border border-slate-400/50 transform -rotate-6" />
        </div>
      ))}
    </div>
  );
};
