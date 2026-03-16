/* eslint-env node */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        'app-accent': '#f9c270',
        'app-blue': '#003f63',
        'app-orange': '#e96439',
        'app-text': '#222222',
        'app-black': '#050a1e',
        'menu-default': '#339999',
        'app-bg': '#f0f0f0',
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
