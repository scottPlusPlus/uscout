/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors:{
        'mainP': '#6c367d',
        'navP' : '#4d2659',
        'mainG': '#14b88f',
        'navG' : '#0f8a6b',
        // 'mainG': '#009973',
        // 'navG' : '#00664d',
      }
    },
    fontFamily: {
      'sans2': ['roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', 'Segoe UI Symbol', '"Noto Color Emoji"']
    },
  },
  plugins: [],
};
