# 07 — Status

**Last updated:** September 24, 2026.

Where the build actually is, and every question still waiting on a human. If
this file disagrees with another doc about current state, this file wins.

## In one paragraph

The Next.js rebuild is **complete and unmerged**. All 9 routes carry real
content, analytics and consent are wired, and the August-1 pricing switch has
been applied to both branches. It is deployed to its own Vercel project for
review while `main` keeps serving customers the original Vite site. Three rounds
of client review — August 16 (copy and structure), August 18 (layout, mobile,
package cards) and August 20 (the hub's chooser) — have been applied, and in
September the homepage got a redesign pass: beige light sections, rewritten
copy, and GSAP motion. One piece is still being built: **the homepage hero is
being rebuilt as a small city with traffic and a car you can drive**
(`hero-drive.md`), in seven phases, of which two are done. Everything else that
remains before cutover is verification and client sign-off. The other caveat: **the July QA pass no longer reflects
the build**, so re-running it is now a cutover requirement rather than a
formality.

## In progress — the hero rebuild (from September 24, 2026)

The homepage hero becomes a top-down city on the brand red: white roads,
blue traffic that stops at every junction, and one black car a visitor can
drive with a real manual gearbox. The copy and both CTAs stay as they are, in
HTML. The spec is `hero-drive.md`; it was reviewed and every recommendation
accepted on September 24.

- **Phase 1, the spec:** ✅ done.
- **Phase 2, the roads:** ✅ done, and revised after review the same day.
  From 768px the copy keeps to the left half of the hero and a fixed downtown
  map fills the right. The headline comes down to fit, 72px at 1920px instead
  of 96px. On phones the hero fills the first screen: the copy, a size smaller
  with the two buttons on one row, then a street band that takes the rest,
  343px tall at 390×844 and never under 240px. The roads are server-rendered
  positioned elements, so they're there with no JavaScript; centre ticks end
  in whole ticks at every junction, and every road into a cross or a T has a
  thin black zebra crossing. The phone map is drawn zoomed out, every road
  size at 0.6, so the blocks have room. A client check hides any road that comes within 48px of the
  copy; at all 32 measured sizes nothing needs hiding. 31 tests (`npm test`).
- **Phases 3–7:** traffic, the drivable car, the gearbox and HUD, collisions
  with tyre marks and smoke, then phones, reduced motion, lazy loading and
  performance.
- The first prototype of this feature, a different design that was never
  mounted, is kept on the local branch `prototype/hero-drive-v0`.

## Recently completed — September 2026 (homepage)

- **Prices rounded up to the nearest $10** (Sept 21): $110 / $300 / $470 /
  $220 + HST, on both branches, including the Offer schema and the conversion
  values in `booked.html`. The savings lines follow: $30 and $80.
- **Beige light sections.** "What Students Are Saying" and pricing sit on
  `.section--light` (`--beige`, `#FBE9DF`) with red header type, alternating
  with the red sections. The Google-reviews button there is solid red with an
  inner white ring (`btn--on-light`). See `02-architecture.md` §Styling.
- **Review cards redesigned** (cream cards, red top rule, gold stars, the
  reviewer's initial), and the strip no longer reacts to page scroll: it
  drifts at one speed, and drag, touch swipe and sideways trackpad swipe still
  move it. It was rebuilt on GSAP (Sept 24), and Tailwind, `motion` and the
  Magic UI row were removed with it.
- **Homepage copy rewritten** in plainer language, keeping the original title
  casing. How It Works step 1 used to say "the single lesson or 3-pack" and now
  names all four packages. Review quotes, package names and prices are
  unchanged.
- **GSAP motion on the homepage** under the new `08-motion.md`: a hero
  timeline on load, and scroll reveals (Rise, Stagger, Headline, Draw, Settle)
  on every other section. The first version started too late on phones;
  triggers now fire at `top 95%`, and delays count from the section's start
  (see `08-motion.md` §Homepage map).

## Recently completed — August 20, 2026

- **The hub's chooser went back to plain text.** "Pick by where you are today"
  was four cards for two days — situation, package plaque, Book Now and See More
  each. For a signpost between the package cards above it and the closing Book
  CTA below it, that was too much furniture: three stacked card treatments in a
  row. It's four sentences again, each hanging off a **gear-lever bullet**, with
  the package as the inline link.
- **That bullet answers the "gear-shifter clip art" question** from the Site 2.0
  review, which had been stuck on the client supplying black-on-white raster art
  for a red section. It's an inline SVG in the same 24x24 line-icon idiom as the
  package pages — knob, shaft, and the gate slot — so it inherits `currentColor`
  and needs no asset. A flat H shift-pattern was drawn first, to echo the gate
  motif the hero and card chips use; at 20px it read as the letter H.
- **The four `lessons_overview_pick_*` source tags are retired** with the buttons
  that carried them (`05-analytics.md`). They never reached the live domain. The
  hub books through `lessons_overview_close` alone; the chooser routes to package
  pages, which book under their own tags.
- Section height, cards → text: **771px → 629px** at 320 and 729px → 557px at
  390. No overflow at 320 / 390 / 1280.

## Recently completed — August 18, 2026

A layout, mobile and card-design pass, driven by review on a real phone. Both
entries that stood under "Known bugs" are fixed, along with several defects
neither this file nor the August 16 pass had caught. **No content decisions were
made** — every open question below is untouched.

### Layout

- **One content column per page.** The old "known bugs" entry had half of it.
  Blocks capped *narrower* than the 1200px `.section__inner` inherit its
  `margin: 0 auto` and re-centre, landing ~150px right of the nav, the footer,
  and every full-width section on the same page — two competing left edges per
  page, which is what made the skew noticeable. `.section__inner` now publishes
  `--column-inset` and every narrower block uses
  `margin-inline: var(--column-inset) auto`; the blocks capped at 1100px inside
  the column were uncapped. Measured at 320 / 390 / 1024 / 1280 / 1440 / 1713:
  every route resolves to a single left edge.
- **Breadcrumbs rendered under the fixed nav on phones.** The `max-width: 639px`
  block replaced the bar's nav clearance with a flat `0.75rem`, on the reasoning
  that the hero below carries it — but `.breadcrumbs + .section--first`
  deliberately shrinks the hero's padding *because* the trail is meant to do the
  clearing. The trail sat at y=12–33 and the hero eyebrow at y=49–71, under a
  64px nav. The bar also had no horizontal padding, so it sat flush to the
  viewport edge.

### Mobile

- **The nav bar no longer wraps.** At 375px and below the row (logo 189px +
  toggle + Book Now) didn't fit; Book Now dropped to a second line and the bar
  grew to 113px while every page still reserved `--nav-height` (64px), so the
  fixed bar covered the first heading. 375 and 360 are the two most common phone
  widths. The bar is `nowrap`, the open menu is an absolutely positioned
  dropdown, and the logo shrinks to absorb the rest. One row from 320 to 767px.
- **The menu panel is opaque.** It inherited the bar's 0.85 alpha and the hero's
  display-size headline read straight through it.
- **Vertical scrolling works over the reviews marquee.** `touch-action: pan-x`
  declared horizontal panning to be the only gesture the element handles, so a
  vertical drag starting on the reviews was swallowed and the page didn't move.
  Measured before → after at 390px: 0px → 231px of page scroll, with the
  horizontal swipe still working (210px of strip travel).
- **Touch targets.** Nav toggle (37px), nav Book Now (34px), footer links (17px
  on a 25px pitch), FAQ rows (39px), contact tap-to-call/mail (29px) and
  `/about`'s "pick where to start" (27px) all clear 44px now; breadcrumbs sit at
  28px, past the 24px AA floor. Where width was scarce or padding would have
  detached an underline from its text, the hit area grows via an overlay.
- **Homepage About stats** sat on three different baselines, because two of the
  three labels wrap and one doesn't.

### Package cards

Both four-card sets — the homepage teasers and the hub's — were a column of
full-height cards below 768px, which made the packages band a long scroll. A 2×2
grid was tried and **reverted** as too busy. The shape that stuck is one card per
row, with each card much shorter:

- The hub card leads with a larger title and folds its feature bullets behind a
  native `<details>` ("What's included"), reusing the `/faq` accordion's
  +-rotates-to-× affordance. No JS.
- **The disclosure is phones-only.** Desktop was never the crowded case, so
  above 768px the summary is hidden and the content forced visible. See
  `02-architecture.md` for the mechanism and its one odd side effect.
- **The whole card is the toggle** on phones — an overlay on the summary covers
  the card. "See full details" is lifted above it and still navigates.
- Price and CTA share a row (`__foot`); at desktop that wrapper is
  `display: contents`, so the column layout is untouched.

Grid height, original → now: **1673px → 1002px** at 390px and 1782px → 1096px at
320px for the hub; 1039px → 792px and 1081px → 910px for the homepage.

### Content structure

- **`/manual-driving-lessons` has a closing Book CTA again.** It had none since
  the intro hero was removed, against `01-brief.md`, and it's a significant entry
  point. Tagged `lessons_overview_close`; the retired `lessons_overview` stays
  retired because it labelled the intro-hero placement.
- **The hub's chooser rows became cards.** ⚠️ **Reverted on August 20** — see
  above. Each card stated the situation, named the package in its own box, and
  offered Book Now and See More, with a per-row `lessons_overview_pick_*` source
  tag. The lookup that kept the package name from drifting survived the revert;
  the cards and the tags did not.
- **`/faq` lead** was missing a space: "Get in touch" ran into "and".

## Recently completed — August 16, 2026

A client review document ("Site 2.0") drove a round of changes on `overhaul`:

- **August-1 pricing switch ported from `main`.** Every surface: teasers, hub
  cards, all four package pages, homepage JSON-LD offers, `booked.html`
  conversion values, `llms.txt`, sitemap. Savings maths recomputed ($28 / $76).
  Includes the `booked.html` rule-ordering fix so a 2.5-hour group booking isn't
  priced as a five-pack.
- **The expired announcement banner was removed.** It rendered server-side and
  only hid after hydration, so non-JS crawlers were still reading "Effective
  Aug 1 — book before August 1 to lock in current rates" *next to* the new
  prices. The component and its stylesheet are deleted; recoverable from git if
  a future notice needs the pattern.
- **Group page collapsed to the single 2.5-hour option**, matching what the
  live site shipped.
- **Sam's origin story** replaced the drafted placeholder on `/about`.
- **Payment wording:** e-transfer and PayPal removed across all three surfaces;
  "All major credit and debit cards are accepted" added.
- **Breadcrumbs** added to the four package pages, with `BreadcrumbList` JSON-LD.
- **Nav active state** made section-aware so Lessons stays underlined on
  `/lessons/*`.
- **Review strip (`TrustBlock`) removed sitewide.** It was first moved last on
  About, the hub, and the package pages, then deleted entirely at the client's
  request — the component, its 108 lines of CSS, and all seven usages
  (About, hub, FAQ, four package pages). The homepage "What Students Are
  Saying" section is a different component and remains.
- **The `/manual-driving-lessons` intro hero was removed**, so the page opens
  straight on the packages. "Four ways to learn" is now the page's `<h1>`
  (promoted from `<h2>`, with the Manual/Stick Shift/Standard eyebrow moved
  onto it). Took the training-car photo and the hub's only Book CTA with it.
- **Footer Explore column** widened and reflowed so the links stop wrapping out
  of alignment.
- Homepage About-teaser CTA and the contact phone label reworded.

## Open — needs a human decision

These are the actual blockers. Most need Sam.

| # | Item | Where | Notes |
|---|---|---|---|
| 1 | **Group pricing basis** — per person or per pair? | `/lessons/group` | ❓ BLOCKED. All copy deliberately avoids claiming either. Ads price assets depend on it too. |
| 2 | **`aggregateRating` in the homepage JSON-LD** | `src/app/page.jsx` | Real GBP figures, but self-attested rating markup carries manual-action risk. Inherited from the live site. Keep or remove — decide before cutover. |
| 3 | **Google Ads conversion label** | `public/booked.html` | Empty string ⇒ Ads conversions are a silent no-op. Account-side fix. |
| 4 | **Confidence guarantee — dropped from the rebuild** | `/lessons/manual-confidence`, `src/app/page.jsx` | ✅ Resolved by removal (Sept 21, 2026). The terms were never written, so the claim is gone from the hero lead and the homepage Offer schema. `main` still advertises it — if Sam wants it back, the terms have to come first. |
| 5 | **Package inclusions** | `/lessons/individual`, `/lessons/group` | Current bullets are the live site's placeholders. Sam owes final 3–5 each. |
| 6 | **Cancellation-policy final wording** | `src/lib/faqs.js` (`cancellation`) | Current text is the live site's. Editing it there propagates everywhere. |
| 7 | **Dedicated testimonials** | `/about` | Every quote on the site is a real Google review. Sam may supply dedicated ones; there's a `PENDING` slot. |
| 8 | **Fonts now actually render** | Site-wide | Plus Jakarta Sans + Inter were referenced but never loaded on the old site — it silently fell back to system fonts. `next/font` loads them, so the rebuild *looks different*. Per the tokens' clear intent, but nobody has confirmed it with Sam. |
| 9 | **Search Console verification token** | `src/app/layout.jsx` | Stubbed `PENDING`. Sam-side. |
| 10 | **Slug keyword audit** | Routes | 🟡 Slugs were never deliberately audited. Cheap to change now, expensive once Ads final URLs point at them. |
| 11 | **New line in Sam's voice** | `src/components/home/AboutTeaser.jsx` | "Everyone stalls while they're learning. Nobody's grading you, so we keep it relaxed, and most people end up having fun." Written in the September copy pass; Sam hasn't approved it. |
| 12 | **Homepage meta description lags the copy** | `src/app/page.jsx` (`metadata`) | The on-page copy was rewritten in September; the description and OG/Twitter text weren't. Its facts are still right; the wording is the old voice. |

### From the Site 2.0 review doc — still needing clarification

Raised with the client, not yet answered:

| Item | The problem |
|---|---|
| "Update cancellation policy" | The screenshot supplied is character-identical to the current text. No new wording was given. |
| Move Payment & cancellation from Contact → FAQ | `/faq` already renders payment *and* cancellation answers from `faqs.js`. Moving the Contact block there duplicates them. Replace the FAQ entries, or add a distinct styled section? |
| Highlight Complete Confidence "like Foundations" | Move the featured treatment from Foundations to Confidence, or feature both? |
| "Social logo in footer" | Instagram/Facebook glyphs, or the Clutch Academy brand mark? The phrasing points both ways. |

## Known bugs

None outstanding. Both entries that stood here on August 16 — the off-centre
content blocks and the hub's missing booking CTA — were fixed on August 18; see
above. The fix for the first one differs from what this file proposed: it
recommended dropping the narrower `max-width` so each block fills its heading's
column, which is right for the three blocks it listed but leaves the *other*
narrowed blocks re-centring 150px away. Normalising every block onto the 1200px
column the nav and footer already use fixes both halves.

## Pending assets

📎 Final brand assets (logo variants), real lesson photography for all four
package pages, and the instructor photo's final crop. Every one is marked with a
`{/* PENDING: ... */}` comment at its use site.

`grep -rn "PENDING\|BLOCKED" src/ public/` is the live list — trust it over this
table.

## Verification state

| Check | Status |
|---|---|
| Build + lint | ✅ Clean as of September 24, 2026 |
| Hero road maps (`npm test`) | ✅ 31 tests: both maps connected, no dead ends, no U-turns, whole ticks only, crossings in place, nothing within 48px of the copy at 32 recorded sizes (September 24) |
| Hero roads in Chrome | ✅ 360, 390, 768, 1280, 1440, 1920px; every road piece within 0.007px of its tested geometry (September 24) |
| Hero roads in Safari | Not checked, but no longer a known risk: the SVG dash-length concern went with the SVG. Covered by the pre-launch real-device pass. |
| Lighthouse, all 9 routes | ⚠️ 100 a11y / 100 SEO / 100 BP in July 2026, but **materially stale** — predates the August 18 layout rework. Re-run is a cutover requirement. |
| Layout: one left edge per route | ✅ Measured at 320 / 390 / 1024 / 1280 / 1440 / 1713, August 18 |
| Mobile nav on one row | ✅ Measured 320–767px, August 18 |
| No horizontal overflow | ✅ All 9 routes at 390px; card grids 320–1440, August 18 |
| Touch targets ≥44px | ✅ August 18 (see the note above for the documented exceptions) |
| Card disclosure behaviour | ✅ Real clicks dispatched at each card region, plus `checkVisibility()` per breakpoint, August 18 |
| Crawlability, canonicals, h1s | ✅ Verified July 2026 |
| Internal links | ✅ All 200, July 2026 |
| Consent Mode deny-first | ✅ Verified — no pixel URLs in served HTML |
| `booked.html` conversion scripts | ✅ Syntax-checked; dedup guard intact |
| Host redirects | ✅ Verified locally via Host header |
| Homepage motion, desktop Chrome | ✅ Every section reveals and ends fully visible; no inline styles left behind; late-scrolled elements start without waiting (Sept 24) |
| Reviews strip, desktop | ✅ Drift, mouse drag, sideways wheel, and vertical page scroll over the strip (Sept 24) |
| **Homepage motion on a phone, and under reduced motion** | ❌ Not checked. The touch swipe on the reviews strip and the timing on small screens need a real device. |
| **Real-device iOS Safari** | ❌ **Never done since the migration.** Pre-launch requirement. |
| **Production domain behaviour** | ❌ Not testable until cutover |
| **Re-run of QA after August and September changes** | ❌ Not done. Include Lighthouse LCP/CLS on `/`: GSAP now loads on every route. |

## Known repo quirks

- **`main` tracked 4,490 `node_modules` files** for historical reasons; they
  predate `.gitignore`. `overhaul` untracked them during the migration. Never
  re-add them.
- **`src/components/sections/`** (the old gear-section components) was removed
  in the July 21, 2026 cleanup. The old copy is recoverable via
  `git log -- 'src/components/sections/*'`.
- **`docs/spec/01`–`09` were archived** on August 16, 2026 into
  `docs/spec/archive/`. They describe either the retired single-page build or
  the rebuild's own planning process. Don't work from them.
