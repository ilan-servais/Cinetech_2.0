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
        textDark: "#000",       // Black or dark gray
        textLight: "#fff",      // White for dark backgrounds
      },
      fontFamily: {
        display: ['Inter', 'Helvetica', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
