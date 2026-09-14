import React from 'react';

interface PaperClipProps {
  position?: 'top-left' | 'top-right';
  className?: string;
}

export const PaperClip: React.FC<PaperClipProps> = ({
  position = 'top-right',
  className = '',
}) => {
  const posClasses =
    position === 'top-right'
      ? '-top-3.5 right-4 rotate-12'
      : '-top-3.5 left-4 -rotate-12';

  return (
    <div className={`absolute z-30 pointer-events-none ${posClasses} ${className}`}>
      <svg
        width="22"
        height="44"
        viewBox="0 0 24 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        <path
          d="M8 12V36C8 39.3137 10.6863 42 14 42C17.3137 42 20 39.3137 20 36V8C20 4.68629 17.3137 2 14 2C10.6863 2 8 4.68629 8 8V32C8 33.6569 9.34315 35 11 35C12.6569 35 14 33.6569 14 32V12"
          stroke="#94a3b8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 12V36C8 39.3137 10.6863 42 14 42C17.3137 42 20 39.3137 20 36V8C20 4.68629 17.3137 2 14 2C10.6863 2 8 4.68629 8 8V32C8 33.6569 9.34315 35 11 35C12.6569 35 14 33.6569 14 32V12"
          stroke="#e2e8f0"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
