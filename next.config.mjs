/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    // Domain canonicalization: .com → .ca and www → apex. Also configured at
    // the Vercel domain level; kept here so the behavior is in the repo and
    // survives a hosting move.
    const canonicalize = (host) => ({
      source: '/:path*',
      has: [{ type: 'host', value: host }],
      destination: 'https://clutchacademy.ca/:path*',
      permanent: true,
    })
    return [
      canonicalize('www.clutchacademy.ca'),
      canonicalize('clutchacademy.com'),
      canonicalize('www.clutchacademy.com'),
    ]
  },

  async rewrites() {
    // Replaces vercel.json's `cleanUrls` for the two static pages that ship
    // verbatim from public/. Calendly's booking confirmation redirects to
    // /booked; the consent banner links to /privacy.
    return [
      { source: '/booked', destination: '/booked.html' },
      { source: '/privacy', destination: '/privacy.html' },
    ]
  },

  async headers() {
    // Ported from vercel.json. The old `/assets/*` immutable rule is gone —
    // that was Vite's hashed-output dir; Next serves hashed bundles from
    // /_next/static with immutable caching built in.
    return [
      {
        source: '/:all*(webp|jpeg|jpg|png|svg|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000' },
        ],
      },
      {
        source:
          '/:file(robots\\.txt|sitemap\\.xml|llms\\.txt|site\\.webmanifest)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600' }],
      },
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300' },
          { key: 'X-Robots-Tag', value: 'index, follow' },
        ],
      },
    ]
  },
}

export default nextConfig
