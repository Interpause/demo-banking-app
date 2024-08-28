import twtypography from '@tailwindcss/typography'
import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [twtypography, daisyui],
  daisyui: {
    themes: false,
  },
}
