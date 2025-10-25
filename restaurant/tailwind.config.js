/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef5e7',
          100: '#fde9c3',
          200: '#fcd89b',
          300: '#fac773',
          400: '#f9ba55',
          500: '#f8ad37',
          600: '#f7a631',
          700: '#f69c2a',
          800: '#f59323',
          900: '#f38316',
        },
      },
    },
  },
  plugins: [],
}
