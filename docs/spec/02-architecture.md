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
CTA was removed in August 2026 at the client's request. The page now closes with
its own Book CTA (`lessons_overview_close`), added on August 18 because
`01-brief.md` requires every page to funnel to one and this is a significant
entry point.

### Package cards

Two four-card sets share a shape and a set of rules: the homepage teasers
(`PackagesTeaser`) and the hub's cards (`hub.css`). Both are **one card per row
below 768px** — a two-column grid was tried and reverted as too busy.

The hub card carries more than the teaser (gear number, who-it's-for line,
feature bullets), so on phones its bullets fold into a native `<details>`
labelled "What's included":

- **Phones only.** Above 768px the `<summary>` is hidden and the content is
  forced visible — `::details-content { content-visibility: visible }`, plus a
  child `display` override for engines predating that pseudo-element. Desktop
  was never the crowded case. One copy of the bullets in the markup either way.
- **The whole card is the toggle.** The summary carries an overlay covering the
  card, so a tap anywhere flips it. The CTA is lifted above the overlay with
  `z-index` so "See full details" still navigates.
- Note the side effect: at desktop the `<details>` is a closed element with
  visible content and no exposed control. Assistive tech sees plain rendered
  content rather than a collapsed disclosure — the intended reading, since there
  is no control left to mislabel, but an unusual construction.

Both cards wrap price + CTA in a `__foot` element. On phones it's a row (a
full-width card is wide and short, so stacking them wasted a row per card); at
desktop it's `display: contents`, so the column layout is untouched. The row is
deliberately `nowrap` — letting it wrap put the CTA on its own line and gave
back the row the layout exists to save.

The hub's "Pick by where you are today" chooser is **not** cards. It's four
plain sentences, each hanging off a gear-lever bullet, with the package it points
to as the inline link. It was cards for two days in August 2026 — situation,
package plaque, Book Now and See More — and read as far too heavy for what is a
signpost. The package name is looked up from the page's `PACKAGES` array by href
rather than stored on the chooser entry, so the two can't drift; the entry holds
only the verb phrase that carries the name inside the sentence.

The bullet is an inline SVG in the page's own 24x24 line-icon idiom, at
`strokeWidth` 2 because it renders at 20px where the package-page icons render at
24. A flat H shift-pattern was drawn first, to echo the gate motif the hero and
the card chips use — at bullet size it read as the letter H.

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

**`--column-inset` is how narrow blocks stay on the page's left edge.**
`.section__inner` centres a 1200px column and publishes `--column-inset`, the
distance from the section's padding edge to that column's left edge. Any block
that caps itself narrower must use `margin-inline: var(--column-inset) auto` —
otherwise it inherits `margin: 0 auto` and re-centres inside the column, landing
~150px right of the nav, the footer, and every full-width section on the same
page. The cap is a reading measure, not a centring device. Fixed August 18,
2026; every route resolves to a single left edge from 320px to 1713px.

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
- **Interactive targets are at least 44px.** Nav toggle and Book button, footer
  links, FAQ rows, card CTAs and the disclosure toggle all clear it. Where width
  is scarce or padding would drag an underline away from its text, grow the hit
  area with an absolutely positioned overlay instead — see the nav toggle and
  `ContactCard`. Inline links inside a sentence are exempt (WCAG 2.5.8), and
  breadcrumbs sit at 28px, past the 24px AA floor.
- **The mobile nav bar must stay one row.** It is `flex-wrap: nowrap`, the open
  menu is an absolutely positioned dropdown, and the logo shrinks to absorb the
  squeeze. A wrapped bar grows past `--nav-height`, which every page reserves as
  fixed, so the bar lands on top of the first heading.
- **Don't set `touch-action` on horizontal scrollers.** `pan-x` reads like "this
  pans horizontally" but declares horizontal panning to be the *only* gesture
  the element handles, so vertical drags over it are swallowed and the page
  won't scroll. The default already locks the axis from the gesture's initial
  direction. Removed from the reviews marquee on August 18, 2026.
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
