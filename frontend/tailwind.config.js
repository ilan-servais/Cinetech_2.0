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
        primary: "#0d253f",     // Dark blue
        accent: "#01b4e4",      // Light blue
        background: "#E3F3FF",  // Very light blue
        textDark: "#000",       // Black
        textLight: "#fff",      // White for dark backgrounds
        primaryLight: "#e0f0ff", // Light version of primary for backgrounds
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
