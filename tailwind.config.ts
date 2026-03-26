import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Crucible Gold — primary, CTAs, highlights
          gold: '#FFBF29',
          'gold-light': '#FFCB4D',
          'gold-dark': '#D9A020',
          // Forge Orange — accent, energy, emphasis
          orange: '#EA5924',
          'orange-light': '#F06B3A',
          // Charcoal — default background
          charcoal: '#2E2E2E',
          // Off-White — body text on dark backgrounds
          'off-white': '#E6E6E6',
          // Deep dark for contrast sections
          dark: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"League Spartan"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
