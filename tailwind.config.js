/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0c', // Arka plan
          800: '#16161a', // Kartlar
          700: '#232329', // Inputlar
        },
        accent: '#3b82f6', // Parlak mavi
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(59, 130, 246, 0.2)',
      }
    },
  },
  plugins: [],
}