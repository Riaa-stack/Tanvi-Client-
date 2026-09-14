import React from 'react';

interface HighlighterProps {
  children: React.ReactNode;
  color?: 'yellow' | 'pink' | 'blue' | 'purple' | 'green';
  className?: string;
}

export const Highlighter: React.FC<HighlighterProps> = ({
  children,
  color = 'yellow',
  className = '',
}) => {
  const colorMap = {
    yellow: 'highlight-yellow',
    pink: 'highlight-pink',
    blue: 'highlight-blue',
    purple: 'highlight-purple',
    green: 'highlight-green',
  };

  return (
    <span className={`inline font-inherit ${colorMap[color]} ${className}`}>
      {children}
    </span>
  );
};
