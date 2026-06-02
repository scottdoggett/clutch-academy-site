# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Clutch Academy Website

Manual transmission driving school in Toronto. Single-page React site with a gear-shift animation metaphor. The original launch target was **May 1, 2026**; that date has now passed, so treat ongoing work as polish/iteration on a live or near-live build rather than greenfield scaffolding.

## Spec vs. implementation

The build specification lives in `docs/spec/` and is still useful for *intent* (audience, content, brand voice, pending assets). Several decisions in the spec have been **superseded by the current code** — when the two disagree, the code wins. Notable drift to be aware of before quoting the spec:

- **Gear → section mapping has changed.** The spec's earlier ordering put About at gear 2 and HowItWorks at gear 3. The shipped order is `Home → Reviews → HowItWorks → Packages → About → Faq → Reverse` (see "Architecture" below). Reviews was previously at gear 5 — moving it forward to gear 2 was a deliberate ordering decision (social proof up high).
- **Payment is now collected at booking time**, not in person. The Reverse section ("Payment collected at time of booking, not in person — All cards accepted"), FAQ #6 ("Payment is securely collected at the time of your booking using Stripe…"), and the Packages lead ("Pay securely at booking.") all reflect this.
- **The Reverse contact form was removed** (commit `eea4250`) and replaced with a contact info card (phone, email, IG, FB). `index.html` still contains the hidden Netlify form-registration stub; it is unused by the rendered app.
- **No analytics is wired up.** The spec recommends GA4; the code references it only in a comment in `useCalendly.js`.

When loading spec files, start with `docs/spec/README.md` for the routing table and decision-state legend (✅ decided / 🟡 recommended / ❓ open / 📎 pending asset), then load only the file(s) relevant to the task.

## Stack

- React 19 + Vite 8
- GSAP 3 with `@gsap/react` (`useGSAP`), `ScrollTrigger`, and `ScrollToPlugin` — registered in `src/main.jsx`, gated behind `window.__PRERENDER__` so the build-time prerender captures clean static HTML
- Calendly (popup widget) for bookings — script is **lazy-loaded** by `useCalendly.js` on first CTA click, not in `<head>`, to keep the prerendered HTML and critical-path payload small
- Google Analytics 4 with Consent Mode v2 default-deny — initialized in `index.html`; `ConsentBanner.jsx` flips `analytics_storage` to granted
- **Hosting: Vercel.** `vercel.json` defines the `.com → .ca` and `www.` redirects plus per-asset cache headers
- Puppeteer (devDep only) for the build-time prerender script

No testing or routing libraries are installed.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/` **and** runs `scripts/prerender.mjs` to snapshot fully-rendered HTML over `dist/index.html` and inject the FAQPage JSON-LD
- `npm run preview` — preview production build locally
- `npm run lint` — ESLint over the project

## Conventions

- **Use the `useGSAP` hook** from `@gsap/react` for all GSAP animation code — never raw `useEffect` with GSAP. This guarantees cleanup on unmount. The Reviews marquee uses `useEffect` because it's a `requestAnimationFrame` loop, not a GSAP timeline.
- **Design tokens in CSS custom properties** (`src/styles/tokens.css`), not hardcoded values.
- **Gear sections are components.** Each of the seven sections is its own component under `src/components/sections/`, wrapped by `GearSection`, which handles pinning, viewport-position alignment, and the per-gear scroll-triggered transition.
- **Respect `prefers-reduced-motion`.** Both `GearSection` (matchMedia gate) and `Reviews` (early return) check this. Any new motion must follow suit.
- **`useGSAP` over `useEffect` for animations**, but co-locate the timeline setup with the component that owns the animated DOM (per `GearSection`'s `mm.add(...)` blocks).

## Architecture

Single-page app where scroll position drives a gear-shift metaphor. Seven sections map to gear positions on an H-pattern shifter:

```
src/
├── App.jsx              # Wires sections, owns currentGear state, scrollToGear,
│                        # and the nav/CTA → Calendly handlers
├── main.jsx             # Registers ScrollTrigger + ScrollToPlugin
├── components/
│   ├── Nav.jsx          # Sticky nav, mobile toggle, "Book Now" CTA
│   ├── GearSection.jsx  # Wrapper: pinning + position + per-gear ScrollTrigger
│   │                    # animation setup (no separate hook file)
│   ├── GearIndicator.jsx
│   ├── Footer.jsx
│   └── sections/        # One component per gear
│       ├── Home.jsx         # gear 1 — top-left
│       ├── Reviews.jsx      # gear 2 — top-left
│       ├── HowItWorks.jsx   # gear 3 — top-center
│       ├── Packages.jsx     # gear 4 — top-center
│       ├── About.jsx        # gear 5 — top-right
│       ├── Faq.jsx          # gear 6 — top-right
│       └── Reverse.jsx      # gear R — center; Book CTA + contact info card
├── hooks/
│   └── useCalendly.js   # openCalendly(): native popup on desktop, custom
│                        # iframe host on mobile (iOS Safari sizing fix)
└── styles/
    ├── tokens.css       # CSS custom properties (colors, type scale, timings)
    └── buttons.css      # Shared button utility classes
```

Key animation concepts (detailed in `docs/spec/06-design-system.md`):

- **Three transition types**, all driven by `ScrollTrigger` pinning inside `GearSection.jsx`:
  - **Same-column shifts** (1→2, 3→4, 5→6) — `setupSameColumnExit`: pins for a short scroll beat with no content motion.
  - **H-crossing shifts** (2→3, 4→5) — `setupHCrossingExit` on the outgoing gear and `setupHCrossingEntry` on the incoming gear; content drops, slides laterally, and fades.
  - **Reverse shift** (6→R) — `setupReverseExit`: gear 6 scales/fades/slides out while the Reverse section eases in.
- **Mobile** collapses every transition to a fast upward slide (`setupMobile`); Reverse keeps a zoom-out + fade.
- **`useShiftTransition` does NOT exist as a hook** — animation logic lives directly in `GearSection.jsx` as standalone setup functions keyed by `ANIMATION_ROLES[gear]`. If you're refactoring, that's the file to touch.
- **Nav navigation** uses `gsap.to(window, { scrollTo: ... })` with `autoKill: false` (iOS Safari address-bar workaround — don't change this without re-testing on iOS) and focuses the destination heading or primary CTA for a11y.
- **Calendly popup opens immediately** for every CTA (nav "Book Now", hero, packages, about, reverse). It does **not** wait for the Reverse shift to complete. On mobile, `openCalendly` mounts an inline widget into a custom overlay because the native popup mis-sizes on iOS Safari.

## SEO architecture

The site is a CSR React app, but the build emits a **pre-rendered** `dist/index.html` so non-JS-executing crawlers (GPTBot, ClaudeBot, PerplexityBot, plain Googlebot fetches, social-share scrapers) see the full body content. Three pieces work together:

1. **`scripts/prerender.mjs`** (runs after `vite build`): spawns `vite preview`, drives Puppeteer with `window.__PRERENDER__ = true` set via `evaluateOnNewDocument`, captures the rendered HTML, splices in the FAQPage JSON-LD, and overwrites `dist/index.html`.
2. **Runtime guards behind `window.__PRERENDER__`**: `src/main.jsx` skips GSAP plugin registration; `src/components/GearSection.jsx` short-circuits its `useGSAP` setup; `src/components/sections/Reviews.jsx` skips its rAF marquee loop; `src/components/ConsentBanner.jsx` stays hidden. This guarantees the snapshotted HTML has zero animation-injected attributes — clean static markup that hydrates without mismatch warnings.
3. **FAQPage JSON-LD is generated from the FAQS array in `Faq.jsx`** at build time, so on-page FAQ copy and the structured data can never drift. The script *fails the build* if any answer ends with whitespace or non-terminal punctuation (caught the truncated FAQ #7 cancellation answer the first time it ran). To add an FAQ: edit the FAQS array; the next build re-emits the JSON-LD.

Other SEO surfaces:

- `index.html` `<head>` carries the static meta (description, canonical, OG, Twitter, robots, theme-color), the apple-touch-icon link, the manifest link, and the DrivingSchool / Offer / Person JSON-LD `@graph`. The `<!-- FAQPAGE_LD -->` marker is the splice point for the prerender script — don't remove it.
- `public/robots.txt` allows all crawlers including the major AI bots (per business decision).
- `public/sitemap.xml` lists the single canonical URL.
- `public/llms.txt` is a Mintlify-style summary for LLM crawlers.
- `public/site.webmanifest` plus `apple-touch-icon.png` cover home-screen install.
- `public/privacy.html` is a static privacy page; `vercel.json` `cleanUrls: true` makes `/privacy` resolve to it.

**No `Review` or `aggregateRating` schema** until Google Business Profile reviews exist and can be cited. Self-attested testimonial markup violates Google's 2019 guidance and can earn a manual action.

## Pending assets

Many brand assets (final logo, instructor photo, color overrides) are tracked as `<!-- PENDING: [name] -->` HTML comments. When you encounter a missing asset, follow the same convention. Never invent content that conflicts with the client's brand — see `docs/spec/05-pending-items.md` for the full list and rules.

## Workflow

- Follow the build order in `docs/spec/04-technical-spec.md` ("Build Order Recommendation") for any greenfield work, but most of that order is already complete — typical tasks now are content/copy edits, layout polish, and animation tuning.
- After completing each numbered step in a multi-step task, pause and report progress. The developer will review before continuing.
- Track new `<!-- PENDING: -->` comments as you add them.
- If the spec conflicts with itself, with the code, or with what the developer is asking, flag it — don't silently pick a side. The drift list at the top of this file is not exhaustive.

## Non-negotiable constraints

- **Four pricing cards: two private + two group.** Private — $90 single lesson, $240 for a 3-pack. Group — $90 1-hour, $180 2-hour. (Whether the group prices are per-person or per-pair is still PENDING client confirmation — see the `PENDING` comments in `Packages.jsx`.) `App.jsx` wires one Calendly handler per card (`onBookSingle`, `onBookPack`, `onBookGroup1hr`, `onBookGroup2hr`), each tagged with its own analytics `source`.
- **Gear-shift metaphor is core, not decoration.** Don't simplify away layout positions or animation choreography without explicit approval.
- **iOS Safari is a first-class target.** The `autoKill: false` scroll tween and the custom mobile Calendly host both exist because of iOS-specific bugs — don't "clean them up" without testing on iOS.
- **Reduced motion must remain a fully functional path.** Every new animation needs a matchMedia gate or equivalent fallback.
