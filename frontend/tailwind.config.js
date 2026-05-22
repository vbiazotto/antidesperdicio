/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4', 100: '#dcfce7',
          500: '#52B788', 600: '#2D6A4F',
          700: '#1B4332', 900: '#081C15',
        },
        accent: '#E76F51',
      },
    },
  },
  plugins: [],
}
