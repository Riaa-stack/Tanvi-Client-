import React from 'react';

export type PencilSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface PencilLoaderProps {
  size?: PencilSize;
  message?: string;
  className?: string;
}

const sizeConfig: Record<PencilSize, { width: number; height: number; strokeWidth: number }> = {
  xs: { width: 36, height: 36, strokeWidth: 10 },
  sm: { width: 64, height: 64, strokeWidth: 14 },
  md: { width: 110, height: 110, strokeWidth: 16 },
  lg: { width: 170, height: 170, strokeWidth: 18 },
  xl: { width: 230, height: 230, strokeWidth: 20 },
};

export const PencilLoader: React.FC<PencilLoaderProps> = ({
  size = 'md',
  message,
  className = '',
}) => {
  const { width, height } = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        style={{ width: `${width}px`, height: `${height}px` }}
        className="relative flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          className="w-full h-full animate-spin [animation-duration:3s]"
        >
          {/* Circular stroke outline */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="#e0e7ff"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="#5b4fe8"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="440"
            strokeDashoffset="180"
            className="origin-center animate-[spin_2s_linear_infinite]"
          />

          {/* Rotating Pencil Body */}
          <g transform="translate(100, 100) rotate(45) translate(-100, -100)">
            {/* Eraser */}
            <rect x="88" y="24" width="24" height="18" rx="4" fill="#f472b6" />
            <rect x="88" y="38" width="24" height="6" fill="#cbd5e1" />

            {/* Pencil shaft (Blue/Purple brand gradient) */}
            <rect x="88" y="44" width="8" height="76" fill="#4338ca" />
            <rect x="96" y="44" width="8" height="76" fill="#5b4fe8" />
            <rect x="104" y="44" width="8" height="76" fill="#818cf8" />

            {/* Wooden Tip Collar */}
            <polygon points="88,120 112,120 100,148" fill="#fed7aa" />

            {/* Graphite tip */}
            <polygon points="96,138 104,138 100,148" fill="#1e1b4b" />
          </g>
        </svg>
      </div>

      {message && (
        <p className="mt-3 font-handwriting text-ink text-base md:text-lg font-medium text-center animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};
