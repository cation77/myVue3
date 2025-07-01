/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'spin-forward': 'spinForward 2s linear infinite',
        'spin-backward': 'spinBackward 2s linear infinite'
      },
      keyframes: {
        spinForward: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' }
        },
        spinBackward: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' }
        }
      }
    }
  },
  plugins: []
};
