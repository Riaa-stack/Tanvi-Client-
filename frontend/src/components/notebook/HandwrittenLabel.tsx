import React from 'react';

interface HandwrittenLabelProps {
  children: React.ReactNode;
  variant?: 'purple' | 'yellow' | 'green' | 'coral' | 'blue';
  className?: string;
}

export const HandwrittenLabel: React.FC<HandwrittenLabelProps> = ({
  children,
  variant = 'purple',
  className = '',
}) => {
  const styles = {
    purple: 'bg-purple-100 text-purple-900 border-purple-300',
    yellow: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    green: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    coral: 'bg-orange-100 text-orange-900 border-orange-300',
    blue: 'bg-sky-100 text-sky-900 border-sky-300',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 font-handwriting font-bold px-2.5 py-0.5 rounded-full border text-xs md:text-sm shadow-xs ${styles} ${className}`}
    >
      {children}
    </span>
  );
};
