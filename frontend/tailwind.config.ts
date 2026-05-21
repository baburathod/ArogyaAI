import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        arogya: {
          50: '#f3fbf6',
          100: '#e6f7ee',
          200: '#bfeed6',
          300: '#99e5bd',
          400: '#6ee7b7',
          500: '#0f8c51',
          600: '#0b6c3e',
          700: '#07542f'
        }
      },
      borderRadius: {
        'lg-card': '18px'
      },
      boxShadow: {
        glass: '0 10px 30px rgba(15,38,23,0.08)'
      }
    }
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        'html': { fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }
      });
    })
  ]
};

export default config;
