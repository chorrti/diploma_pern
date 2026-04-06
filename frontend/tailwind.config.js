/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#F07D58',
        'brand-peach': '#FDF1EE',
        'brand-dark-teal': '#1A4F56',
        'brand-accent-teal': '#337D86',
        'brand-light-teal': '#E6F4F6',
        'brand-red-dark': '#B02A1A',
      },
      fontFamily: {
        unbounded: ['Unbounded', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}