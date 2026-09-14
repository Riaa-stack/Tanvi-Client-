import React from 'react';
import { SpiralBinding } from './SpiralBinding';

interface NotebookSurfaceProps {
  children: React.ReactNode;
  variant?: 'ruled' | 'grid' | 'blank';
  hasSpiral?: boolean;
  hasMarginLine?: boolean;
  className?: string;
}

export const NotebookSurface: React.FC<NotebookSurfaceProps> = ({
  children,
  variant = 'ruled',
  hasSpiral = true,
  hasMarginLine = true,
  className = '',
}) => {
  const bgClass =
    variant === 'ruled'
      ? 'notebook-ruled-bg'
      : variant === 'grid'
      ? 'notebook-grid-bg'
      : 'bg-paper-100';

  return (
    <div
      className={`relative bg-paper-100 rounded-2xl shadow-notebook border border-stone-200/70 overflow-hidden ${bgClass} ${className}`}
    >
      {/* Optional Left Spiral Binding */}
      {hasSpiral && <SpiralBinding side="left" />}

      {/* Red vertical margin rule on notebook paper */}
      {hasMarginLine && (
        <div className="absolute top-0 bottom-0 left-10 md:left-12 w-[1.5px] bg-red-300/60 z-10 pointer-events-none" />
      )}

      {/* Content Area with left indentation for spiral & margin */}
      <div className={`relative z-10 ${hasSpiral ? 'pl-12 md:pl-16 pr-5 py-6' : 'p-6'}`}>
        {children}
      </div>
    </div>
  );
};
