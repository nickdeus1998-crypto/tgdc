/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // this enables class-based dark mode
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': '#326101',
        'secondary-green': '#639427',
      },
    },
  },
  plugins: [],
};