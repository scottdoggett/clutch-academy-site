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
4. **Working on the homepage hero?** `docs/spec/hero-drive.md` §Handoff says
   exactly where the rebuild is, what to build next, how Scott reviews it, and
   what bit last time. Read it before touching `src/components/hero/`.

`docs/spec/archive/` holds the retired single-page spec and the rebuild's
planning docs. **Don't work from anything in there.**

## Current state (September 24, 2026)

- **All 9 routes are built with real content**: `/`, `/about`,
  `/manual-driving-lessons` (hub), `/lessons/{individual,manual-foundations,manual-confidence,group}`,
  `/faq`, `/contact`, plus a custom 404.
- **Pricing is the post-August-1 offering, rounded up to the nearest $10 on
  September 21** — $110 / 75 min, $300, $470, $220 / 2.5 hr, all + HST. On
  both branches. The dated announcement banner has been removed.
- **Three rounds of client review are applied.** August 16 was copy and
  structure; August 18 was layout, mobile and the package cards; August 20 was
  the hub's chooser — see `07-status.md`.
- **September: a homepage redesign pass.** Reviews and pricing sit on beige
  `.section--light` bands, the homepage copy was rewritten, and the homepage is
  animated with GSAP under `docs/spec/08-motion.md`. Other routes haven't had
  their motion pass yet.
- **The July QA pass is stale.** It predates the August 18 layout rework and the
  September motion work, so re-running Lighthouse across all 9 routes is a
  cutover requirement now, not a formality.
- **The homepage hero is being rebuilt** as a top-down city with traffic and a
  drivable car, with a manual or an automatic gearbox. Spec:
  `docs/spec/hero-drive.md`, which works in seven phases and stops for review
  after each. Phases 1–2 (spec, road maps) are done, committed (`8bd1a72`,
  `f922e2e`) and pushed to `origin/overhaul`. Phase 3 (ambient traffic) is
  built and its roads approved; Phase 4 (a drivable black car, planck.js) is
  built and retuned. **Phase 5 (a manual and an automatic gearbox with a
  switch, and the gear display) is built and waiting for Scott's review.**
  Since then the car can be driven over the whole page, with the page
  scrolling after it (spec §Driving the whole page); Scott tried it and
  liked it. Phases 3 to 5 and the whole-page drive are committed and pushed
  to `origin/overhaul`. Tyre marks (Phase 6's, pulled forward) and the
  reviews strip as a treadmill for the car followed on September 25,
  committed but not pushed. The code is in
  `src/components/hero/`, the traffic in its lazy `engine/` chunk and the
  driving in its lazy `drive/` chunk, tested with `npm test` (88 tests). The
  spec's §Handoff says where it is, what changed from the spec, and what's
  next (Phase 6, knocks, recovery, tyre marks and smoke).
- **Not yet merged or deployed to the real domain.** Remaining work is
  verification and client sign-off, not building — see `07-status.md`.

## Stack & architecture

- **Next.js App Router** (`src/app/`), fully static (`next build` prerenders
  every route). No prerender scripts, no `window.__PRERENDER__` — that world is
  gone.
- **GSAP** (re-added September 2026 for homepage animation) is set up in
  `src/lib/gsap.js`: import `gsap` / `ScrollTrigger` / `useGSAP` from there, not
  the packages, and wrap every animation in `gsap.matchMedia(MOTION_OK)`.
  **Read `docs/spec/08-motion.md` before animating anything** — it sets the
  rules, the six allowed animation types, and the timing values.
- **The homepage hero's city** (`src/components/hero/`) draws its traffic with
  three.js (WebGL2) and drives the black car with planck.js. Both load lazily
  in their own chunks, the traffic once the page is idle and the driving on
  the Drive pill's hover or focus, so neither is in the first load. The
  simulation modules are pure (no three.js, no DOM) and tested with
  `npm test`. `hero-drive.md` is the spec.
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
- **Light sections** are `.section--light` (globals.css): a `--beige`
  (`#FBE9DF`) band that flips header type to red. A button sitting on the beige
  itself adds `btn--on-light` (solid red, inner white ring); buttons inside red
  cards on the band don't. Red on `--beige` clears AA at 4.99:1, so don't darken
  the beige without re-checking.
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
- **The hub's "Pick by where you are today" chooser is plain text** — four
  sentences on gear-lever bullets, package as the inline link. It was cards with
  their own Book buttons for two days in August 2026 and was rejected as too much
  furniture next to the package cards. Don't rebuild it as cards, and don't
  revive the retired `lessons_overview_pick_*` source tags.
- **Respect `prefers-reduced-motion`** — the reviews marquee is matchMedia-gated,
  and every GSAP animation goes under `gsap.matchMedia(MOTION_OK)` so reduced
  motion gets the final static state. Never hide content in CSS for a JS
  entrance to reveal.
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

- **Commit only when asked; Scott pushes himself** unless he asks for a push
  in that session. Pushing over SSH fails from this Mac (its key isn't on
  GitHub); the GitHub CLI is logged in, and the one-off HTTPS push command is
  in `hero-drive.md` §Handoff.
- **The dev server is usually already running** on :3000 from Scott's own
  session. Reuse it rather than starting another. `npm run build` is safe
  alongside it, because dev builds into `.next/dev`.
- **Browser checks through the Chrome extension run in a hidden tab**, so
  `requestAnimationFrame` and ResizeObserver never fire there. The homepage
  hero's entrance stalls halfway, with the subhead and buttons invisible. It's
  a tab quirk, not a site bug. `hero-drive.md` §Handoff has the iframe harness that
  works around it, and the development-only `window.__heroEngine.step()` that
  moves the traffic by hand there. Keys sent by the extension also stop
  arriving after the tab has sat a while; the same section says how to drive
  by script instead.
