/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#27312b',
        muted: '#687269',
        cream: '#fffaf5',
        orange: '#e87849',
        orangeDark: '#ce5e32',
        line: '#e9e5dc',
        sage: '#e9f0e6',
        forest: '#355a45',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: { card: '0 12px 35px rgba(49, 43, 33, .06)' },
    },
  },
  plugins: [],
}
