import process from 'node:process'

// Security headers on every response (October 2026: securityheaders.com
// graded the live site a D for missing all five). The same set is in
// vercel.json on `main`. docs/spec/06-deployment.md §Security headers.
//
// The CSP lists every outside host the site loads from or sends to: the
// Google tag (GA4 and Ads), the Meta and TikTok pixels, and Calendly. A new
// third-party script has to be added here, or the browser blocks it without
// a visible error. Scripts need 'unsafe-inline' because the pages carry
// inline scripts (Next's own page data, the consent bootstrap in layout.jsx,
// booked.html), and the site is static, so there's no per-request nonce.
// Images may come from any https host, since the ad tags ping a different
// Google domain per country. Development adds 'unsafe-eval', which React
// uses in dev, and websockets for hot reload.
const isDev = process.env.NODE_ENV === 'development'

const csp = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline'",
    isDev && "'unsafe-eval'",
    'https://www.googletagmanager.com',
    'https://www.googleadservices.com',
    'https://www.google.com',
    'https://googleads.g.doubleclick.net',
    'https://connect.facebook.net',
    'https://analytics.tiktok.com',
    'https://assets.calendly.com',
  ],
  "style-src 'self' 'unsafe-inline' https://assets.calendly.com",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    isDev && 'ws: wss:',
    'https://www.googletagmanager.com',
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.google.com',
    'https://*.google.ca',
    'https://*.g.doubleclick.net',
    'https://ad.doubleclick.net',
    'https://pagead2.googlesyndication.com',
    'https://www.googleadservices.com',
    'https://www.facebook.com',
    'https://connect.facebook.net',
    // The Meta pixel's Conversions API Gateway and its fallback. They come
    // from the pixel's own config (connect.facebook.net/signals/config/
    // <pixel id>), so if the gateway is ever set up again, check them there.
    'https://xd-f1cf3d4fdb19408ea770fc6f80817dcb.ecs.us-east-1.on.aws',
    'https://bded8a3c6ae-1-1053047382554.us-central1.run.app',
    'https://analytics.tiktok.com',
    'https://analytics-ipv6.tiktokw.us',
  ],
  // After a booking, Calendly loads /booked in its frame on our page. The
  // browser checks that against frame-src, and the frame gets there from
  // whichever host Calendly's redirect names, so both are listed. The
  // live site sends the bare domain to www today; this one does the
  // reverse.
  [
    "frame-src 'self'",
    'https://clutchacademy.ca',
    'https://www.clutchacademy.ca',
    'https://calendly.com',
    'https://www.googletagmanager.com',
  ],
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self' https://clutchacademy.ca https://www.clutchacademy.ca",
]
  .map((d) => (Array.isArray(d) ? d.filter(Boolean).join(' ') : d))
  .join('; ')

// SAMEORIGIN rather than DENY, and frame-ancestors to match: /booked has
// to keep working inside Calendly's frame on our own page. The
// Permissions-Policy turns off hardware the site never uses. It leaves
// payment alone, since Calendly takes cards through Stripe at booking.
const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), usb=(), serial=(), hid=(), midi=(), display-capture=()',
  },
]

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
      { source: '/:path*', headers: securityHeaders },
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
