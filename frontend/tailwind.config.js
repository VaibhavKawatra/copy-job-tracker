/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // This line is essential for dark mode to work
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
