// Tailwind v4 runs as a PostCSS plugin. It exists for the Magic UI components
// in src/components/ui/, which are written against Tailwind utilities — the
// rest of the site is hand-written CSS on the tokens in src/styles/tokens.css
// and stays that way. See globals.css for why preflight is left out.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
