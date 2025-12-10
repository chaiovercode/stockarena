/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        comic: ['Bangers', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        comic: {
          yellow: '#ffd93d',
          'yellow-dark': '#f5c518',
          red: '#ff6b6b',
          'red-dark': '#ee5a5a',
          blue: '#4dabf7',
          purple: '#9775fa',
          green: '#51cf66',
          'green-dark': '#40c057',
          bg: '#1a1a2e',
          'bg-dark': '#0f0f23',
          'bg-secondary': '#16213e',
        },
      },
      boxShadow: {
        'comic': '6px 6px 0 #000',
        'comic-sm': '4px 4px 0 #000',
        'comic-lg': '8px 8px 0 #000',
        'comic-green': '6px 6px 0 #40c057',
        'comic-red': '6px 6px 0 #ee5a5a',
        'comic-yellow': '6px 6px 0 #f5c518',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
