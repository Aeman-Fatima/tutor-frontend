/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  // preflight: false prevents Tailwind from resetting base styles that Angular Material owns
  corePlugins: { preflight: false },
  // Brand color is Tailwind's built-in `teal` scale, used directly throughout the app.
  theme: { extend: {} },
  plugins: [],
};
