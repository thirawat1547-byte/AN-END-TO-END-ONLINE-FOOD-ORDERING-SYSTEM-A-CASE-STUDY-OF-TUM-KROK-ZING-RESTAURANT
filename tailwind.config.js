/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rider: {
          green: {
            DEFAULT: '#00B14F',
            dark: '#008b3e',
            light: '#e6f7ed'
          },
          orange: {
            DEFAULT: '#FF6B00',
            dark: '#e05e00',
            light: '#fff4ec'
          },
          dark: '#1C2024',
          gray: '#65676B',
          lightBg: '#F4F6F8'
        }
      },
      fontFamily: {
        sans: ['Prompt', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'mobile': '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.06)'
      }
    },
  },
  plugins: [],
}
