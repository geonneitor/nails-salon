import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'fondo-zen': 'var(--fondo-zen)',
        'primario-zen': 'var(--primario-zen)',
        'secundario-zen': 'var(--secundario-zen)',
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
