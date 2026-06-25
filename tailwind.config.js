/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  // preflight: false prevents Tailwind from resetting base styles that Angular Material owns
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
      },
    },
  },
  plugins: [],
};
