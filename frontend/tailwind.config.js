/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0f1d', // Deep navy-black
        surface: 'rgba(15, 23, 42, 0.6)',
        surfaceHover: 'rgba(30, 41, 59, 0.8)',
        primary: '#06b6d4', // Cyan intelligence glow
        secondary: '#38bdf8', // Light blue
        accent: '#9333ea', // Purple futuristic depth
        success: '#4ade80',
        warning: '#facc15',
        danger: '#f87171',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)',
        'neon-accent': '0 0 10px rgba(147, 51, 234, 0.5), 0 0 20px rgba(147, 51, 234, 0.3)',
      }
    },
  },
  plugins: [],
}
