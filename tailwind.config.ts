import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'fondo-zen': '#F7F5F0',
        'primario-zen': '#4A533E',
        'secundario-zen': '#E8E2D6',
      },
      fontFamily: {
        // Calgary como fuente principal, serif como fallback como se solicitó
        sans: ['var(--font-calgary)', 'serif'],
        serif: ['var(--font-calgary)', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
