module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        'app-pink': 'var(--app-pink)',
        'app-success': 'var(--app-success)',
        'app-slate': 'var(--app-slate)',
        'app-muted': 'var(--app-muted)',
        'app-chip': 'var(--app-chip)',
        'app-tag-dark': 'var(--app-tag-dark)',
        'app-gray': 'var(--app-gray)',
        'app-ink': 'var(--app-ink)',
        'app-indigo': 'var(--app-indigo)',
      },
      screens: {
        'custom-xl': { max: '1100px' },
        'custom-lg': { max: '900px' },
        'custom-sm': { max: '600px' },
      },
    },
  },
  plugins: [],
};
