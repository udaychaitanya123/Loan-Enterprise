/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        jet_black: {
          DEFAULT: '#2d3142',
          100: '#090a0d',
          200: '#12141b',
          300: '#1b1e28',
          400: '#242735',
          500: '#2d3142',
          600: '#4e5472',
          700: '#71799e',
          800: '#a0a6bf',
          900: '#d0d2df'
        },
        blue_slate: {
          DEFAULT: '#4f5d75',
          100: '#101217',
          200: '#1f252e',
          300: '#2f3745',
          400: '#3f4a5c',
          500: '#4f5d75',
          600: '#687a99',
          700: '#8e9bb2',
          800: '#b4bdcc',
          900: '#d9dee5'
        },
        silver: {
          DEFAULT: '#bfc0c0',
          100: '#262727',
          200: '#4c4d4d',
          300: '#727474',
          400: '#989a9a',
          500: '#bfc0c0',
          600: '#cbcdcd',
          700: '#d8d9d9',
          800: '#e5e6e6',
          900: '#f2f2f2'
        },
        coral_glow: {
          DEFAULT: '#ef8354',
          100: '#3b1505',
          200: '#762b0b',
          300: '#b04010',
          400: '#e95718',
          500: '#ef8354',
          600: '#f29a75',
          700: '#f5b497',
          800: '#f9cdba',
          900: '#fce6dc'
        }
      },
      fontFamily: {
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Helvetica Neue"',
          'Inter',
          'sans-serif'
        ],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', '"Fira Code"', 'monospace']
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(to right, #e95718, #ef8354)',
        'accent-gradient-diagonal': 'linear-gradient(135deg, #e95718, #ef8354)',
        'accent-gradient-soft': 'linear-gradient(to right, #ef8354, #f29a75)',
        'hero-glow': 'radial-gradient(ellipse at 60% 50%, rgba(239,131,84,0.08) 0%, transparent 70%)',
        'dark-texture': 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)'
      },
      boxShadow: {
        card: '0 1px 3px rgba(45,49,66,0.06)',
        'card-md': '0 4px 6px rgba(45,49,66,0.07)',
        'card-lg': '0 10px 15px rgba(45,49,66,0.08)',
        'card-xl': '0 20px 25px rgba(45,49,66,0.10)',
        accent: '0 4px 14px rgba(239,131,84,0.25)',
        'accent-lg': '0 8px 24px rgba(239,131,84,0.35)'
      },
      spacing: {
        section: '7rem',
        'section-lg': '11rem'
      },
      maxWidth: {
        content: '72rem'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'rotate-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' }
        },
        'pulse-dot': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.3)', opacity: '0.7' }
        }
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 60s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

