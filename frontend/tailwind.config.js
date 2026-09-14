/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        handwriting: ['Kalam', 'Patrick Hand', 'Caveat', 'cursive'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        paper: {
          50: '#fdfcf9',
          100: '#fbf9f4',
          200: '#f5f0e6',
          300: '#ede4d4',
          line: '#e8e2d5',
          margin: '#f8b4b4',
          text: '#2d3142',
        },
        ink: {
          DEFAULT: '#1e2238',
          blue: '#1e3a8a',
          purple: '#4c1d95',
          light: '#4b5563',
        },
        sticky: {
          yellow: '#fef08a',
          yellowLight: '#fef9c3',
          pink: '#fbcfe8',
          pinkLight: '#fdf2f8',
          blue: '#bae6fd',
          blueLight: '#e0f2fe',
          purple: '#e9d5ff',
          purpleLight: '#f3e8ff',
          green: '#bbf7d0',
          greenLight: '#dcfce7',
          coral: '#fed7aa',
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#5b4fe8',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        desk: '#eee7db',
      },
      boxShadow: {
        'notebook': '0 8px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'paper': '0 4px 20px rgba(45, 49, 66, 0.06), 0 1px 2px rgba(45, 49, 66, 0.04)',
        'sticky': '2px 4px 14px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-lift': '0 10px 25px -5px rgba(91, 79, 232, 0.1), 0 8px 10px -6px rgba(91, 79, 232, 0.1)',
      },
      backgroundImage: {
        'ruled-lines': 'repeating-linear-gradient(transparent, transparent 27px, #e8e2d5 28px)',
        'grid-lines': 'linear-gradient(to right, #e8e2d5 1px, transparent 1px), linear-gradient(to bottom, #e8e2d5 1px, transparent 1px)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        }
      }
    },
  },
  plugins: [],
};
