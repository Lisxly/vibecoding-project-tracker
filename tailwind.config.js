/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { primary: '#6f6e80', accent: '#d0d5f7' },
        surface: { page: '#f2f4fc', card: '#fcd9ff' },
        text: { primary: '#000000', muted: '#4c464d' },
        type: { feature: '#49fcd3', bug: '#fa8cc3' },
        due: { safe: '#b4f084', warning: '#ecf084', overdue: '#d4555d', neutral: '#c9c8d0' },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: { fade: { from: { opacity: 0 }, to: { opacity: 1 } } },
      animation: { fade: 'fade 200ms ease-out' },
    },
  },
  plugins: [],
};
