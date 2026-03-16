import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0f0e0d',
          soft: '#2a2724',
          muted: '#6b6560',
        },
        paper: {
          DEFAULT: '#f5f0e8',
          dark: '#ede7d9',
        },
        accent: {
          DEFAULT: '#c8442a',
          light: '#e86347',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#2a2724',
            a: { color: '#c8442a' },
          },
        },
      },
    },
  },
  plugins: [],
}
export default config