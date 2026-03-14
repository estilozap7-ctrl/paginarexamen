/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        unicordoba: {
          // Colores institucionales Universidad de Córdoba Colombia
          primary:    '#26924C', // Verde Eucalyptus (principal)
          'primary-dark': '#1a6536',
          'primary-light': '#33b860',
          'primary-50':  '#f0faf4',
          'primary-100': '#dcf5e6',
          'primary-200': '#b9ebce',
          'primary-300': '#83d9a6',
          'primary-400': '#4dc07d',
          'primary-500': '#26924C',
          'primary-600': '#1e7a3e',
          'primary-700': '#1a6536',
          'primary-800': '#18532d',
          'primary-900': '#154527',
          secondary:  '#053F67', // Teal Blue
          accent:     '#FF2B6D', // Radical Red
          gold:       '#F5C842', // Dorado académico
          cream:      '#F9F5EC',
          dark:       '#0F1E14',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'unicordoba-gradient': 'linear-gradient(135deg, #1a6536 0%, #26924C 50%, #33b860 100%)',
        'unicordoba-radial': 'radial-gradient(ellipse at top, #26924C 0%, #1a6536 60%, #0F1E14 100%)',
        'hero-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2326924C' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(38, 146, 76, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(38, 146, 76, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'green-glow': '0 0 20px rgba(38, 146, 76, 0.3)',
        'green-glow-lg': '0 0 40px rgba(38, 146, 76, 0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 40px rgba(38, 146, 76, 0.15)',
      },
    },
  },
  plugins: [],
}
