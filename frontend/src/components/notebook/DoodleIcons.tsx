import React from 'react';

export const StarDoodle: React.FC<{ className?: string; size?: number; color?: string }> = ({
  className = '',
  size = 20,
  color = '#eab308',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <path
      d="M12 2L14.8 8.6L22 9.3L16.5 14.1L18.2 21.2L12 17.5L5.8 21.2L7.5 14.1L2 9.3L9.2 8.6L12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={`${color}33`}
    />
  </svg>
);

export const LightbulbDoodle: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 22,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <path
      d="M9 21H15M10 24H14M12 3C7.58172 3 4 6.58172 4 11C4 13.7384 5.37893 16.1554 7.5 17.5816V19C7.5 19.5523 7.94772 20 8.5 20H15.5C16.0523 20 16.5 19.5523 16.5 19V17.5816C18.6211 16.1554 20 13.7384 20 11C20 6.58172 16.4183 3 12 3Z"
      stroke="#eab308"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#fef08a"
    />
    <path d="M12 7V9" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ArrowDoodle: React.FC<{ className?: string; direction?: 'right' | 'down' | 'curved' }> = ({
  className = '',
  direction = 'right',
}) => {
  if (direction === 'curved') {
    return (
      <svg
        width="36"
        height="24"
        viewBox="0 0 36 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className}`}
      >
        <path
          d="M2 4C10 3 24 6 28 18M28 18L21 17M28 18L29 11"
          stroke="#5b4fe8"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="24"
      height="16"
      viewBox="0 0 24 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
    >
      <path
        d="M2 8H20M20 8L14 2M20 8L14 14"
        stroke="#5b4fe8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
