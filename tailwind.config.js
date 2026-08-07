/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#043F63',    // Azul Almerienses
        secondary: '#F7931E',  // Naranja Almerienses
      },
      fontFamily: {
        sans: ['Myriad Pro', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
