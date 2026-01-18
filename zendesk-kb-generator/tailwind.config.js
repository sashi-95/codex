/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRADAスタイルカラーパレット
        'prada-black': '#000000',
        'prada-white': '#FFFFFF',
        'prada-light': '#F9F9F9',
        'prada-border': '#EEEEEE',
      },
      fontFamily: {
        // PRADAスタイルフォント
        'prada': ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        // PRADAスタイルタイポグラフィ
        'prada-body': ['13px', { lineHeight: '1.8' }],
      },
      letterSpacing: {
        'prada-header': '3px',
        'prada-header-lg': '5px',
      },
      spacing: {
        'prada-padding': '20px',
        'prada-gap': '15px',
      },
    },
  },
  plugins: [],
}
