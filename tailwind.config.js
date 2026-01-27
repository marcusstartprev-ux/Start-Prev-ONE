/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'azul': {
          'escuro': '#1a2332',
          'sidebar': '#151b27',
          'hover': '#252d3d',
          'ativo': '#2a3548',
        },
        'cinza': {
          'escuro': '#3d4551',
          'medio': '#6b7280',
          'claro': '#9ca3af',
          'bg': '#f3f4f6',
          'borda': '#e5e7eb',
        },
        'amarelo': {
          DEFAULT: '#f59e0b',
          'hover': '#d97706',
        },
      },
    },
  },
  plugins: [],
}
