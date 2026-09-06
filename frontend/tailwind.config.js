/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1120', // global page background
          900: '#121A2C', // primary panel card background
          800: '#1E293B', // subtle borders/dividers
          700: '#334155', // hover highlights
        },
        accent: {
          green: '#10B981', // emerald green focus
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        risk: {
          verylow: '#14B8A6',  // Teal
          low: '#22C55E',      // Green
          moderate: '#EAB308', // Yellow
          high: '#F97316',     // Orange
          veryhigh: '#EF4444'  // Red
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(16, 185, 129, 0)' },
        }
      }
    },
  },
  plugins: [],
}
