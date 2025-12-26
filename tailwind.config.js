/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./constants.tsx",
    "./types.ts"
  ],
  theme: {
    extend: {
      colors: {
        taxi: {
          yellow: '#FFC107',
          black: '#020617',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        latha: ['Latha', 'serif'],
      },
    },
  },
  plugins: [],
}