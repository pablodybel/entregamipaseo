/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#7145D6',
          600: '#6938c7',
          700: '#5b2eb8',
          800: '#4d25a0',
          900: '#3f1d88',
        },
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#33A67C',
          600: '#2d9369',
          700: '#277f58',
          800: '#216c49',
          900: '#1b5a3c',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7145D6 0%, #a78bfa 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #33A67C 0%, #6ee7b7 100%)',
        'gradient-hero': 'linear-gradient(135deg, #7145D6 0%, #33A67C 100%)',
      }
    },
  },
  plugins: [],
}