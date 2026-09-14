import React from 'react';

interface WashiTapeProps {
  position?: 'top-center' | 'top-left' | 'top-right' | 'bottom-right';
  color?: 'yellow' | 'pink' | 'blue' | 'purple';
  className?: string;
}

export const WashiTape: React.FC<WashiTapeProps> = ({
  position = 'top-center',
  color = 'yellow',
  className = '',
}) => {
  const posClasses = {
    'top-center': '-top-2.5 left-1/2 -translate-x-1/2 rotate-[-2deg]',
    'top-left': '-top-2.5 -left-3 rotate-[-25deg]',
    'top-right': '-top-2.5 -right-3 rotate-[25deg]',
    'bottom-right': '-bottom-2.5 -right-3 rotate-[-15deg]',
  }[position];

  const colorStyle = {
    yellow: 'bg-yellow-200/80 border-yellow-300/40',
    pink: 'bg-pink-200/80 border-pink-300/40',
    blue: 'bg-sky-200/80 border-sky-300/40',
    purple: 'bg-purple-200/80 border-purple-300/40',
  }[color];

  return (
    <div
      className={`absolute h-5 w-16 shadow-sm border-t border-b opacity-85 z-20 pointer-events-none ${posClasses} ${colorStyle} ${className}`}
      style={{
        clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)',
      }}
    />
  );
};
