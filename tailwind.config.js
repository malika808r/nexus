/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- ЭТА СТРОКА ОБЯЗАТЕЛЬНА ДЛЯ ТЕМЫ!
  theme: {
    extend: {},
  },
  plugins: [],
}