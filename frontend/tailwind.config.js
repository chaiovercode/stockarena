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
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        stock: {
          primary: '#5b8ef4',
          secondary: '#4a7de8',
          hover: '#6a9ff7',
          success: '#00d395',
          'success-light': '#34d399',
          danger: '#ff4757',
          'danger-dark': '#ee3344',
          warning: '#ffa502',
          info: '#1dd1a1',
          purple: '#a55eea',
          'purple-light': '#b77bfa',
          bg: '#0f1117',
          'bg-secondary': '#1a1d29',
          'bg-card': '#1a1d29',
          'bg-panel': '#1a1d29',
          'text-primary': '#e4e6eb',
          'text-secondary': '#8b8e98',
          'text-muted': '#5d606b',
          border: '#2a2e39',
          'border-light': '#363a45',
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
