/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'salon-pink': '#FFB6C1',
        'salon-dark': '#2D2D2D',
        'salon-gold': '#D4AF37',
      }
    },
  },
  plugins: [],
}
