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
          DEFAULT: '#EB6A1F', // 👈 thêm dòng này
          50: '#fff5f2',
          100: '#ffe6de',
          200: '#ffc9bb',
          300: '#ffa68f',
          400: '#ff8562',
          500: '#EB6A1F', // 👈 đổi 500 cho đồng nhất
          600: '#d95b15',
          700: '#c24f12',
          800: '#a9430f',
          900: '#91380c',
        },
        secondary: {
          DEFAULT: '#f7931e',
          50: '#fff8ed',
          100: '#ffedd1',
          200: '#ffd89f',
          300: '#ffc46d',
          400: '#ffaf3b',
          500: '#f7931e',
          600: '#de7e11',
          700: '#c46a0e',
          800: '#ab570c',
          900: '#91450a',
        },
        accent: '#c9d6df',
        background: '#f8f9fa',
      },
    },
  },
  plugins: [],
};
