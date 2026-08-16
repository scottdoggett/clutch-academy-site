# 02 — Architecture

How the `overhaul` build is put together. For the deployed shape of things
(branches, Vercel projects, domains) see `06-deployment.md`.

## Stack

- **Next.js 16.2** — App Router, every route statically generated at build time
- **React 19.2**
- **Plain CSS** — one stylesheet per component or route, plus design tokens.
  No Tailwind, no CSS-in-JS, no preprocessor.
- **ESLint 9** with `eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y`
- **No test framework, no routing library, no state library, no animation
  library.** The dependency list is deliberately three packages long.

```
npm run dev      # dev server
npm run build    # static production build
npm run start    # serve the production build locally
npm run lint     # eslint over the project
```

`next build` prerenders all 11 entries (9 routes + 404 + global error). There is
no separate prerender step — that was the Vite build's Puppeteer script, and it
is gone along with `window.__PRERENDER__`.

## Routes

Nine routes plus a custom 404. Every one is static, carries its own metadata and
canonical, and has exactly one `<h1>`.

| Route | Page | Role |
|---|---|---|
| `/` | Homepage | Positioning, social proof, how it works, package teasers, About teaser |
| `/manual-driving-lessons` | Lessons hub | Compares all four packages; the internal-linking spine |
| `/lessons/individual` | Individual Manual Lesson | Ads + organic landing page |
| `/lessons/manual-foundations` | Manual Foundations (3 lessons) | Ads + organic landing page |
| `/lessons/manual-confidence` | Complete Manual Confidence (5 lessons) | Ads + organic landing page |
| `/lessons/group` | Group Manual Lessons | Ads + organic landing page |
| `/about` | About Sam | Trust — the origin story in Sam's own words |
| `/faq` | FAQ | Rendered from the shared FAQ array; source of the FAQPage schema |
| `/contact` | Contact | Channels, hours, payment & cancellation |
| — | 404 (`not-found.jsx`) | Noindexed, links back into the site |

Two static pages ship verbatim from `public/` and are reached through rewrites,
not the App Router: **`/booked`** (`booked.html`, the Calendly confirmation and
conversion page) and **`/privacy`** (`privacy.html`).

## Source layout

```
src/
├── app/
│   ├── layout.jsx              # Shared shell: fonts, metadata defaults,
│   │                           # consent bootstrap + gtag, skip link,
│   │                           # Nav, Footer, ConsentBanner, AnalyticsLoader
│   ├── globals.css             # Base elements, .section / .section__inner
│   ├── page.jsx                # Homepage + DrivingSchool/Offer/Person JSON-LD
│   ├── not-found.jsx
│   ├── about/                  # page.jsx + about.css
│   ├── contact/                # page.jsx + contact.css
│   ├── faq/                    # page.jsx + faq.css
│   ├── manual-driving-lessons/ # page.jsx + hub.css
│   └── lessons/{individual,manual-foundations,manual-confidence,group}/
│
├── components/
│   ├── Nav.jsx                 # Sticky nav, mobile toggle, section-aware
│   │                           # active state, Book Now CTA
│   ├── Footer.jsx              # Brand, contact, Explore sitemap, social
│   ├── Breadcrumbs.jsx         # Trail + BreadcrumbList JSON-LD
│   ├── BookButton.jsx          # THE booking CTA — every one goes through it
│   ├── ContactCard.jsx         # Channels with per-channel intent tracking
│   ├── ConsentBanner.jsx       # Consent Mode v2 accept/decline
│   ├── AnalyticsLoader.jsx     # Loads pixels only after consent
│   ├── ReviewsMarquee.jsx      # Google-review marquee (progressive enhancement)
│   ├── home/                   # Hero, Reviews, HowItWorks, PackagesTeaser,
│   │                           # AboutTeaser — homepage sections
│   └── lessons/
│       ├── LessonFaq.jsx       # Renders an FAQ subset by id
│       └── lessons.css         # Shared package-page styles
│
├── hooks/
│   └── useCalendly.js          # openCalendly(source) + CALENDLY_URL
│
├── lib/
│   ├── faqs.js                 # Single source of FAQ truth
│   ├── googleReviews.js        # Rating, review count, profile URL
│   ├── consent.js              # Consent storage key + helpers
│   ├── metaPixel.js
│   └── tiktokPixel.js
│
└── styles/
    ├── tokens.css              # Design tokens
    └── buttons.css             # Shared button classes
```

## Page composition

The homepage is five components in order: `Hero → Reviews → HowItWorks →
PackagesTeaser → AboutTeaser`.

The four package pages share a shape: breadcrumbs → hero (eyebrow, h1, lead,
pull quote, price, Book CTA) → who it's for → what's included → real Google
review quotes → FAQ subset → next steps.

`/manual-driving-lessons` opens **directly on the packages** — its heading
"Four ways to learn" is the page's `<h1>`. The intro hero that used to carry a
separate H1, a lead paragraph, the training-car photo, and the hub's only Book
CTA was removed in August 2026 at the client's request.

**There is no site-wide trust strip.** A `TrustBlock` band (Google rating +
three trust points) used to close About, the hub, the FAQ, and all four package
pages; it was removed everywhere in August 2026. The homepage "What Students Are
Saying" section — marquee plus a Google badge — is a different component and
remains.

## Single sources of truth

Duplicating any of these is a bug:

| Thing | Lives in | Feeds |
|---|---|---|
| FAQ copy | `src/lib/faqs.js` | `/faq`, its FAQPage JSON-LD, every package-page FAQ subset, `/contact`'s cancellation text |
| Google rating + review count | `src/lib/googleReviews.js` | The homepage reviews badge and the homepage `aggregateRating` |
| Booking CTA behaviour | `src/components/BookButton.jsx` | Every Book button on the site |
| Calendly URL | `src/hooks/useCalendly.js` | All booking entry points |
| Consent storage key | `src/lib/consent.js` | Banner, analytics loader, `booked.html` |

## Styling

**Design tokens in `src/styles/tokens.css`** — colours, type scale, spacing,
timings. Use the tokens, not literal values.

Two contrast rules that are easy to get wrong on the brand red (`#C8102E`):

- `--chrome` is `#E4E4E4`, lifted from `#D9D9D9` because the old value failed
  WCAG AA at 4.18:1. It now passes at 4.64:1.
- **Muted text on the brand red must be a solid colour** — `var(--cream)` or
  `var(--chrome)`. White-alpha and opacity-faded text fail 4.5:1 on the
  saturated red even when the blend maths suggests otherwise.

`--announcement-height` is held at `0px`. It exists so a future notice strip can
publish its own height into one token and have every `--nav-height` clearance
follow; the August-1 banner that used it was removed once the switch shipped.

## Conventions

- **Booking always goes through `BookButton`** with a distinct `source` tag per
  placement. Never call `openCalendly` directly from a page.
- **`prefers-reduced-motion` must be respected.** The only JS motion left is the
  reviews marquee, which is matchMedia-gated. Gate anything new the same way.
- **Client components are the exception.** Most pages are server components;
  `'use client'` appears only where interaction demands it (Nav, BookButton,
  ConsentBanner, AnalyticsLoader, ContactCard, ReviewsMarquee).
- **Nav active state is section-aware.** `/lessons/*` keeps the Lessons item
  underlined via prefix matching, while `aria-current="page"` stays exact — on a
  package page you are *in* the section but not *on* the hub page.
- **Pending inputs are comments, not omissions.** Use `{/* PENDING: ... */}` or
  `❓ BLOCKED`, and never invent content to fill the gap.
- **iOS Safari is a first-class target.** `useCalendly` mounts an inline widget
  into a custom overlay on mobile because Calendly's native popup mis-sizes on
  iOS Safari. Don't "clean that up" without testing on a real device.

## What was removed in the rebuild

Worth knowing, because half the archive talks about it: the gear-shift
metaphor, the H-pattern shifter, all GSAP/ScrollTrigger choreography,
`useShiftTransition`, `src/components/sections/`, the Puppeteer prerender
script, `window.__PRERENDER__`, and `vercel.json`. The old section copy is
recoverable with `git log -- 'src/components/sections/*'`.
