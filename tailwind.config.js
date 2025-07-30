/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
                     colors: {
                 salsa: {
                   primary: '#FF69B4',
                   secondary: '#FFB6C1',
                   accent: '#FFC0CB',
                   dark: '#8B008B',
                   light: '#FFF0F5',
                 }
               },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 