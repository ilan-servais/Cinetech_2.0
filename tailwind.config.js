/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],  theme: {
    extend: {      colors: {
        primary: {
          DEFAULT: '#01b4e4',
          dark: '#0d253f',
          light: '#90cea1',
          lighter: '#b8e6f5',
          lightest: '#e3f6fd',
        },
        secondary: {
          DEFAULT: '#90cea1',
          dark: '#0d253f',
          light: '#01b4e4',
        },
        background: '#E3F3FF',
        backgroundDark: '#0d1b2a',
        textLight: '#f8fafc',
        textDark: '#0f172a',
        'dark-border': '#1e293b',
        'dark-card': '#1e293b',
        'dark-navbar': '#0d1b2a',
        // Pastilles de statut
        'status-watched': '#4ade80', // vert clair pour "déjà vu"
        'status-watchlater': '#fde047', // jaune clair pour "à voir"
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      outlineColor: {
        accent: '#f26a25',
      },
    },
  },
  plugins: [],
}
