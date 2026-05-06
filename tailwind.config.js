/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#090C14',
        surface: '#0F1520',
        card: '#131A28',
        card2: '#1A2236',
        border: '#1E2A42',
        'border-light': '#253350',
        accent: '#3B82F6',
        'accent-dim': 'rgba(59,130,246,0.18)',
        'accent-glow': 'rgba(59,130,246,0.10)',
        text: '#EEF2FF',
        'text-soft': '#B8C4DC',
        muted: '#5A6882',
        'muted-light': '#8898B4',
        green: '#22C55E',
        'green-dim': 'rgba(34,197,94,0.15)',
        red: '#EF4444',
        'red-dim': 'rgba(239,68,68,0.15)',
        yellow: '#F59E0B',
        'yellow-dim': 'rgba(245,158,11,0.15)',
        purple: '#A855F7',
        'purple-dim': 'rgba(168,85,247,0.15)',
        teal: '#14B8A6',
        'teal-dim': 'rgba(20,184,166,0.15)',
        orange: '#F97316',
        'orange-dim': 'rgba(249,115,22,0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
