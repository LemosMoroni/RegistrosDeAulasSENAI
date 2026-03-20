/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        senai: {
          50:  '#E3EDF7',
          100: '#C8D5E5',
          400: '#2B82CC',
          600: '#1565A8',
          700: '#1070BC',
          900: '#0A3D6B',
        },
        dark: '#0D1B2A',
      },
      fontFamily: {
        sans:    ['Nunito', 'sans-serif'],
        display: ['Lora', 'serif'],
      },
    },
  },
  plugins: [],
}