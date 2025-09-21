/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          500: '#8F64E1',
          600: '#1D68BD',
          700: '#1D68BD',
        }
      }
    },
  },
  plugins: [],
}