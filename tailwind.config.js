/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fresia': {
          gold: '#E6BE8A',
          rose: '#B76E79',
          cream: '#FAF9F6',
          dark: '#1A1A1A',
          'rose-light': '#F5E6E8',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
