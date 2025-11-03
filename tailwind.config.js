/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'gradient-x': 'gradientX 6s ease infinite',
        'fade-up': 'fadeUp 1s ease-out forwards',
        'fade-up-delay': 'fadeUp 1.4s ease-out forwards',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-fast': 'float 5s ease-in-out infinite',
      },
      keyframes: {
        gradientX: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundSize: {
        '400%': '400%',
      },
    },
  },
  plugins: [],
};
