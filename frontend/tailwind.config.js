/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#f8e36f",
          "secondary":"#f0d50c",
          "accent": "#121212",
          "neutral": "#1c1917",
          "base-100": "#ffff",
        },
      },
      {
        dark: {
          "primary": "#f8e36f",
          "secondary":"#f0d50c",
          "accent": "#ffffff",
          "neutral": "#1c1917",
          "base-100": "#0000",
        },
      },
    ],
  },
}