import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          accent: 'var(--brand-accent)',
        },
        surface: {
          page: 'var(--surface-page)',
          card: 'var(--surface-card)',
          elevated: 'var(--surface-elevated)',
          sunken: 'var(--surface-sunken)',
          overlay: 'var(--surface-overlay)',
        }
      }
    },
  },
  plugins: [],
}

export default config
