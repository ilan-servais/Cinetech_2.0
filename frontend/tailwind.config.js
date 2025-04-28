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
        primary: '#FF4F2A',
        accent: '#CFF80A',
        dark: '#120D16',
        graylight: '#D9D9D9',
        offwhite: '#FAFAFA',
      },
      fontFamily: {
        display: ['MONUMENT EXTENDED', 'sans-serif'],
        bold: ['HANSON Bold', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
