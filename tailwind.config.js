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
        // Design System Start (Dark Theme)
        'st': {
          'bg': '#121214',           // Fundo principal (quase preto)
          'surface': '#202024',      // Cards (cinza elefante)
          'surface-hover': '#29292e', // Hover dos cards
          'border': 'rgba(255, 255, 255, 0.08)',
          'border-highlight': 'rgba(255, 255, 255, 0.15)',
          'text': '#f4f4f5',         // Texto principal (branco)
          'muted': '#a1a1aa',        // Texto secundário
          'accent': '#fbbf24',       // Amarelo Start (destaque)
          'navy': '#1e3a8a',         // Azul marinho (identidade)
          'success': '#10b981',      // Verde (sucesso/cliente)
          'warning': '#f59e0b',      // Laranja (alerta)
          'danger': '#ef4444',       // Vermelho (erro)
        },
      },
    },
  },
  plugins: [],
}
