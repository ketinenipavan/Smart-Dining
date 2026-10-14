/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF7F2',
        ivory: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F3EFE6',
          300: '#E7DEC9',
        },
        maroon: {
          50: '#FDF2F4',
          100: '#FBE6EB',
          200: '#F5C2CD',
          300: '#EE94A7',
          400: '#E15573',
          500: '#B81D45',
          600: '#9E1538',
          700: '#800020', // Primary Brand
          800: '#64011A',
          900: '#4D0216',
          950: '#2E000B',
        },
        saffron: {
          50: '#FFF8F0',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF9933', // Accent Indian Saffron
          600: '#E65100', // Deep Saffron / Amber
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(128, 0, 32, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'warm-lg': '0 10px 30px -4px rgba(128, 0, 32, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
        'floating': '0 20px 40px -10px rgba(128, 0, 32, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
