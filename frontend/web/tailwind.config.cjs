/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'main': {
          400: '#8C55F9',
          500: '#752DF7',
          600: '#6918F6',
        },
      },
    },
  },
  plugins: [],
}
