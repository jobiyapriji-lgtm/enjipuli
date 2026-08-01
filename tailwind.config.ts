import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ej: {
          deep:       '#150F2E',
          indigo:     '#241B5E',
          violet:     '#3B2C8C',
          surface:    '#2A2168',
          'surface-2':'#322878',
          border:     '#3D3580',
          'border-lt':'#4E44A0',
          lime:       '#D4FF3D',
          'lime-dim': '#a8cc31',
          vermilion:  '#F0562E',
          gold:       '#F4B400',
          'gold-dim': '#c89200',
          magenta:    '#B33DB0',
          teal:       '#2FBFA0',
          'teal-dim': '#249985',
          cream:      '#FFF7E8',
          muted:      '#9B95C4',
          ink:        '#150F2E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        malayalam: ['Baloo Chettan 2', 'Noto Sans Malayalam', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow':     '0 0 24px 0 rgba(212,255,61,0.25)',
        'glow-sm':  '0 0 12px 0 rgba(212,255,61,0.25)',
        'card':     '0 4px 32px 0 rgba(0,0,0,0.5)',
        'vermilion':'0 0 20px 0 rgba(240,86,46,0.2)',
        'gold':     '0 0 16px 0 rgba(244,180,0,0.15)',
      },
    },
  },
  plugins: [],
};
export default config;
