# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

# Clutch Academy Website

Manual transmission driving school in Toronto. The site has been **rebuilt**
from a single-page React/Vite/GSAP brochure into a conventional, SEO-focused,
multi-page site on **Next.js 16 (App Router, React 19)**.

## ⚠️ Two branches, two live deployments

This repo builds **two different sites with two different frameworks**, each on
its own Vercel project:

| Branch | Stack | Deployment |
|---|---|---|
| `main` | Vite + GSAP, single-page | **`clutchacademy.ca`** — the real, customer-facing site |
| `overhaul` | Next.js 16, multi-page | A separate Vercel project, for showing the rebuild to reviewers |

This is deliberate: `main` stays live and unbroken while the rebuild is
reviewed. **Work on `overhaul`. Never commit directly to `main`.**

`npm install` after switching branches — the dependency trees are different.

## Start here

1. **`docs/spec/07-status.md`** — where the build actually is, and every open
   question. Read it before doing anything.
2. `docs/spec/README.md` — the index and the routing table for the rest.
3. `docs/spec/06-deployment.md` — the two-project setup, config, cutover runbook.

`docs/spec/archive/` holds the retired single-page spec and the rebuild's
planning docs. **Don't work from anything in there.**

## Current state (August 18, 2026)

- **All 9 routes are built with real content**: `/`, `/about`,
  `/manual-driving-lessons` (hub), `/lessons/{individual,manual-foundations,manual-confidence,group}`,
  `/faq`, `/contact`, plus a custom 404.
- **Pricing is the post-August-1 offering** — $109 / 75 min, $299, $469,
  $219 / 2.5 hr, all + HST. Applied to `main` on July 31 and to `overhaul` on
  August 16. The dated announcement banner has been removed.
- **Two rounds of client review are applied.** August 16 was copy and structure;
  August 18 was layout, mobile and the package cards — see `07-status.md`.
- **The July QA pass is stale.** It predates the August 18 layout rework, so
  re-running Lighthouse across all 9 routes is a cutover requirement now, not a
  formality.
- **Not yet merged or deployed to the real domain.** Remaining work is
  verification and client sign-off, not building — see `07-status.md`.

## Stack & architecture

- **Next.js App Router** (`src/app/`), fully static (`next build` prerenders
  every route). No prerender scripts, no GSAP, no `window.__PRERENDER__` — that
  world is gone.
- **Shared shell** in `src/app/layout.jsx`: fonts via `next/font` (Plus Jakarta
  Sans + Inter), metadata defaults, inline Consent Mode v2 bootstrap
  (deny-first) + gtag.js, skip link, Nav, Footer, ConsentBanner, AnalyticsLoader.
- **Analytics** (all consent-gated): GA4 `G-5E5GEN5N59`, Google Ads
  `AW-18196514948`, Meta Pixel `2845684255788584`, TikTok Pixel. Pixels load
  only after consent (`src/lib/consent.js` holds the storage key).
  `public/booked.html` is the Calendly-redirect conversion page — **its Google
  Ads conversion label is still empty (no-op)**.
- **Calendly** popup via `src/hooks/useCalendly.js` — keep the iOS Safari
  mobile-host fix; every CTA goes through `src/components/BookButton.jsx` with a
  per-placement `source` tag (full map in `docs/spec/05-analytics.md`).
- **FAQ single source**: `src/lib/faqs.js` renders `/faq`, generates its FAQPage
  JSON-LD, feeds package-page subsets, and supplies `/contact` cancellation
  copy. Never fork FAQ copy.
- **Redirects/rewrites/headers** live in `next.config.mjs` (`vercel.json` is
  deleted on this branch): `.com`/`www` → apex, `/booked` + `/privacy`
  rewrites, cache headers.

## Conventions

- **Design tokens** in `src/styles/tokens.css` — note `--chrome` was lifted to
  `#E4E4E4` for WCAG AA. **Muted text on the brand red must be solid
  `var(--cream)`**, not white-alpha or opacity-faded (alpha over the saturated
  red fails 4.5:1 even when it looks fine).
- **One left edge per page.** `.section__inner` centres a 1200px column and
  publishes `--column-inset`. Any block that caps itself narrower must use
  `margin-inline: var(--column-inset) auto`, or it re-centres inside the column
  and lands ~150px right of the nav and footer.
- **Interactive targets are ≥44px**, and the mobile nav bar must stay one row —
  it's `position: fixed` against a `--nav-height` every page reserves, so a
  wrapped bar covers the first heading. Details in `02-architecture.md`.
- **Package cards** are one per row below 768px, with the hub card's bullets
  behind a phones-only `<details>` whose toggle is the whole card. Don't
  reintroduce a 2-up grid there — it was tried and rejected as too busy.
- **Respect `prefers-reduced-motion`** — the only JS motion is the reviews
  marquee, which is matchMedia-gated; keep any new motion gated the same way.
- **Pending inputs** are `{/* PENDING: ... */}` / `❓ BLOCKED` comments —
  `grep -rn "PENDING\|BLOCKED" src/ public/` lists all outstanding client
  inputs. Never invent content that conflicts with the brand: no invented
  reviews, bios, policies, or inclusions.
- **No `Review`/`aggregateRating` markup on any new page.** The homepage
  business schema still carries the live site's 5.0/33 rating — an unresolved
  flag (`07-status.md` #2), not a precedent.
- After completing each numbered step in a multi-step task, **pause and report
  progress** before continuing.
- If a doc conflicts with the code, with itself, or with what the developer
  asks, **flag it — don't silently pick a side.**

## Non-negotiable constraints

- **Work on the `overhaul` branch; never commit directly to `main`** — `main` is
  live. Merge only via the cutover runbook in `docs/spec/06-deployment.md`.
- **SEO-first and multi-page** — don't collapse pages back together; each
  package page is an Ads destination.
- **iOS Safari is a first-class target** — the Calendly mobile-host fix exists
  for an iOS-specific bug; it has **not** been re-tested on a real device since
  the migration (pre-launch requirement).
- **Reduced motion must remain fully functional.**

## Developer-environment quirks

Scott runs hooks that will intercept you: a **config-protection hook** blocks
edits to `eslint.config.js` (legitimate changes go through its documented escape
hatch), and a **GateGuard hook** requires stating "facts" before the first Bash
call of a session and before destructive commands. Present the facts it asks for
and retry.
