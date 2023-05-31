/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {},
    fontFamily: {
      'sans2': ['roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', 'Segoe UI Symbol', '"Noto Color Emoji"']
    }
  },
  plugins: [],
};
