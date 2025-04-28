/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        dark: 'var(--color-dark)',
        gray: 'var(--color-gray)',
        light: 'var(--color-light)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        bold: ['var(--font-bold)'],
        body: ['var(--font-body)'],
      },
    },
  },
  plugins: [],
}
