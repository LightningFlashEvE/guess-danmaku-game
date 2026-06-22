/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          light: '#38bdf8',
          dark: '#1d4ed8',
        },
        cyber: {
          pink: '#fb7185',
          cyan: '#14b8a6',
          purple: '#f59e0b',
          dark: '#102033',
          panel: 'rgba(255, 255, 255, 0.17)',
        }
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.92) translateY(10px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-12px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 5px rgba(6, 182, 212, 0.2)' },
        },
        'danmaku-in': {
          '0%': { transform: 'translateX(28px) scale(0.96)', opacity: '0' },
          '60%': { transform: 'translateX(-4px) scale(1.02)', opacity: '1' },
          '100%': { transform: 'translateX(0) scale(1)', opacity: '1' },
        },
        'danmaku-highlight': {
          '0%, 100%': { boxShadow: '0 8px 22px rgba(20, 184, 166, 0.16)' },
          '50%': { boxShadow: '0 12px 30px rgba(251, 113, 133, 0.28)' },
        },
        'score-fill': {
          '0%': { transform: 'translateX(-18%)' },
          '100%': { transform: 'translateX(0)' },
        }
      },
      animation: {
        'pop-in': 'pop-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'danmaku-in': 'danmaku-in 0.42s cubic-bezier(0.16, 1, 0.3, 1)',
        'danmaku-highlight': 'danmaku-highlight 1.8s ease-in-out infinite',
        'score-fill': 'score-fill 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
