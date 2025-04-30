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
        primary: "#0d253f",     // Bleu foncé
        accent: "#01b4e4",      // Bleu clair
        background: "#E3F3FF",  // Bleu très clair (fond global)
        textDark: "#0d253f",    // Texte principal
        textLight: "#fff",      // Blanc pour les fonds sombres
        primaryLight: "#e0f0ff", // Version claire du primary pour les arrière-plans
        gray: {
          100: "#f7fafc",
          200: "#e9f2fe",
          300: "#d1e2f5",
          400: "#a1b9d0",
          500: "#718096",
          600: "#4a5568",
          700: "#2a3f5f",
          800: "#1e2a3a",
        }
      },
      fontFamily: {
        display: ['Inter', 'Helvetica', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
