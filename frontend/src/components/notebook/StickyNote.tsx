import React from 'react';
import { WashiTape } from './WashiTape';
import { PaperClip } from './PaperClip';

export type StickyColor = 'yellow' | 'pink' | 'blue' | 'purple' | 'green' | 'coral';

interface StickyNoteProps {
  children: React.ReactNode;
  color?: StickyColor;
  title?: string;
  rotation?: number;
  hasTape?: boolean;
  hasPin?: boolean;
  className?: string;
  onClick?: () => void;
}

const colorClasses: Record<StickyColor, { bg: string; border: string; text: string }> = {
  yellow: {
    bg: 'bg-gradient-to-b from-[#fffbe6] to-[#fef08a]',
    border: 'border-yellow-200/80',
    text: 'text-amber-950',
  },
  pink: {
    bg: 'bg-gradient-to-b from-[#fff1f2] to-[#fbcfe8]',
    border: 'border-pink-200/80',
    text: 'text-pink-950',
  },
  blue: {
    bg: 'bg-gradient-to-b from-[#f0f9ff] to-[#bae6fd]',
    border: 'border-sky-200/80',
    text: 'text-sky-950',
  },
  purple: {
    bg: 'bg-gradient-to-b from-[#faf5ff] to-[#e9d5ff]',
    border: 'border-purple-200/80',
    text: 'text-purple-950',
  },
  green: {
    bg: 'bg-gradient-to-b from-[#f0fdf4] to-[#bbf7d0]',
    border: 'border-emerald-200/80',
    text: 'text-emerald-950',
  },
  coral: {
    bg: 'bg-gradient-to-b from-[#fff7ed] to-[#fed7aa]',
    border: 'border-orange-200/80',
    text: 'text-orange-950',
  },
};

export const StickyNote: React.FC<StickyNoteProps> = ({
  children,
  color = 'yellow',
  title,
  rotation = 0,
  hasTape = false,
  hasPin = false,
  className = '',
  onClick,
}) => {
  const { bg, border, text } = colorClasses[color];

  return (
    <div
      onClick={onClick}
      style={{ transform: `rotate(${rotation}deg)` }}
      className={`relative p-4 rounded-md shadow-sticky border ${bg} ${border} ${text} transition-transform duration-200 hover:scale-[1.02] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Optional Washi Tape centered at top */}
      {hasTape && <WashiTape position="top-center" color={color === 'pink' ? 'pink' : color === 'blue' ? 'blue' : 'yellow'} />}

      {/* Optional Paper Clip at top corner */}
      {hasPin && <PaperClip position="top-right" />}

      {title && (
        <h4 className="font-handwriting font-bold text-base mb-1.5 flex items-center gap-1.5 border-b border-black/10 pb-1">
          <span>📌</span> {title}
        </h4>
      )}

      <div className="font-handwriting text-sm leading-relaxed">{children}</div>
    </div>
  );
};
