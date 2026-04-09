module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        // Accents & Actions
        'indigo-vibe': 'var(--indigo-vibe)',
        'fuchsia-glam': 'var(--fuchsia-glam)',
        'vital-leaf': 'var(--vital-leaf)',
        'warm-marigold': 'var(--warm-marigold)',
        'burnt-citrus': 'var(--burnt-citrus)',
        'violet-pulsar': 'var(--violet-pulsar-filter-panel)',
        'nebula-glow': 'var(--nebula-glow)',

        // Neutrals & Surfaces
        'steel-mist': 'var(--steel-mist)',
        'silver-haze': 'var(--silver-haze)',
        'lace-trim': 'var(--lace-trim)',
        'porcelain-glaze': 'var(--porcelain-glaze)',
        'alabaster-sheen': 'var(--alabaster-sheen)',
        'antique-linen': 'var(--antique-linen)',

        // Dark Modes & Sidebar
        'astral-navy': 'var(--astral-navy)',
        'celestial-ink': 'var(--celestial-ink)',
        'midnight-abyss': 'var(--midnight-abyss)',
        'logo-base': 'var(--logo-base-dark)',

        // Transparent
        'frosted-glass': 'var(--frosted-glass)',
      },
      backgroundImage: {
        'cosmic-fusion': 'var(--cosmic-fusion-gradient)',
        'header-sunrise': 'var(--header-gradient)',
        'accent-triad': 'var(--app-gradient-accent)',
      },
      spacing: {
        'header-h': 'var(--app-header-height)',
      }
    },
  },
  plugins: [],
};
