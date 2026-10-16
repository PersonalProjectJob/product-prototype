/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0B0C0E',
          900: '#111215',
          850: '#181A1E',
          800: '#1D1F21',
          700: '#26292D',
          600: '#34383E',
        },
        gold: {
          300: '#f9e7b9',
          400: '#f3d28a',
          500: '#d4af37',
          600: '#aa8823',
        },
        emerald: {
          800: '#07422a',
          700: '#0a5c3b',
          600: '#107a50',
        },
        crimson: {
          600: '#ae2238',
          700: '#8e172a',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Satoshi', '"DM Sans"', 'sans-serif'],
        heading: ['Satoshi', '"DM Sans"', 'sans-serif'],
        serif: ['Satoshi', '"DM Sans"', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '4px',
      }
    },
  },
  plugins: [],
}
