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
          // Primary CTA — the bright golden yellow "Apply Here" button
          gold: '#F5C430',
          'gold-light': '#F7CE50',
          'gold-dark': '#D4A820',
          // Logo icon — orange-red crucible body
          orange: '#CC4422',
          'orange-light': '#E06038',
          // Dark sections — warm dark brown (not neutral black)
          dark: '#1C1512',
          charcoal: '#2A2117',
          // Light page background — warm light gray
          cream: '#EEECE7',
          muted: '#7A746E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
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
