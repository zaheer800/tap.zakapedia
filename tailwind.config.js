/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', '"Times New Roman"', 'serif'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        editorial: ['"Playfair Display"', 'Georgia', 'serif'],
        expressive: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          dark:    '#0C0A08',
          surface: '#141210',
          border:  '#252018',
          muted:   '#8A7F74',
          faint:   '#4A4540',
          text:    '#F2EDE4',
          gold:    '#C9963A',
          'gold-light': '#E8B84B',
        },
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease-out both',
        'slide-up':    'slideUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
        'bounce-in':   'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'marquee': 'marquee 28s linear infinite',
        'levitate':    'levitate 5s ease-in-out infinite',
        'blob-1':      'blob1 9s ease-in-out infinite',
        'blob-2':      'blob2 11s ease-in-out infinite',
        'blob-3':      'blob3 13s ease-in-out infinite',
        'cursor-blink':'cursorBlink 1.1s step-end infinite',
        'scan':        'scan 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:      { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:     { '0%': { opacity: '0', transform: 'translateY(28px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        bounceIn:    { '0%': { opacity: '0', transform: 'scale(0.8)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        marquee:     { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        levitate:    { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        blob1:       { '0%, 100%': { transform: 'translate(0,0) scale(1)' }, '33%': { transform: 'translate(40px,-60px) scale(1.1)' }, '66%': { transform: 'translate(-30px,30px) scale(0.9)' } },
        blob2:       { '0%, 100%': { transform: 'translate(0,0) scale(1)' }, '33%': { transform: 'translate(-50px,40px) scale(0.95)' }, '66%': { transform: 'translate(30px,-40px) scale(1.05)' } },
        blob3:       { '0%, 100%': { transform: 'translate(0,0) scale(1)' }, '33%': { transform: 'translate(20px,50px) scale(1.08)' }, '66%': { transform: 'translate(-40px,-20px) scale(0.92)' } },
        cursorBlink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
        scan:        { '0%': { transform: 'translateY(0)', opacity: '0' }, '6%': { opacity: '1' }, '90%': { opacity: '0.7' }, '100%': { transform: 'translateY(600px)', opacity: '0' } },
      },
    },
  },
  plugins: [],
}
