/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'claude-orange': '#ff6b35',
        'claude-orange-hover': '#ff5722',
        'claude-orange-hover-dark': '#ff8a65',
      }
    },
  },
  plugins: [],
}
