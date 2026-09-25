# 07 — Status

**Last updated:** September 25, 2026.

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
(`hero-drive.md`), in seven phases. Six are built, committed and pushed:
the roads, the traffic, a car you can drive over the whole page with a
manual or automatic gearbox, a dashboard along the bottom of the window,
tyre marks, and traffic that's bumped out of its lane when you hit it,
with sparks and smoke. Phase 7, performance and fallbacks, is left.
Everything else that remains before cutover is verification and client
sign-off. The other caveat: **the July QA pass no longer reflects
the build**, so re-running it is now a cutover requirement rather than a
formality.

## In progress — the hero rebuild (from September 24, 2026)

The homepage hero becomes a top-down city on the brand red: white roads,
blue traffic that stops at every junction, and one black car a visitor can
drive, with a real manual gearbox or an automatic one, anywhere on the
page. Phases 1 to 6 are built and pushed; the log below runs in order. The copy and both CTAs stay as they are, in
HTML. The spec is `hero-drive.md`; it was reviewed and every recommendation
accepted on September 24.

- **Phase 1, the spec:** ✅ done.
- **Phase 2, the roads:** ✅ done, and revised after review the same day.
  From 768px the copy keeps to the left half of the hero and a fixed downtown
  map fills the right. The headline comes down to fit, 72px at 1920px instead
  of 96px. On phones the hero is the copy, a size smaller with the two
  buttons on one row, then a street band 240px tall (fixed at that in the
  Phase 3 review; it used to grow to fill the first screen). The roads are server-rendered
  positioned elements, so they're there with no JavaScript; centre ticks end
  in whole ticks at every junction, and every road into a cross or a T has a
  thin black zebra crossing. The phone map is drawn zoomed out, every road
  size at 0.6, so the blocks have room. A client check hides any road that
  comes within 48px of the copy; at all 32 measured sizes nothing needs
  hiding. 31 tests (`npm test`). Committed as `8bd1a72` and `f922e2e`, and
  pushed to `origin/overhaul`, so it's on the review deployment.
- **Phase 3, ambient traffic:** built September 24. Blue cars drive both maps: they keep their lanes and
  their distance, stop just behind each zebra crossing, take every cross and
  T one at a time, and leave by the edges to come back in elsewhere. The
  black car drives with them until Phase 4 makes it drivable. It's three.js,
  loaded as its own 136KB chunk once the page is idle, and the homepage's
  first-load JS grew 1.2KB. Under reduced motion the cars are drawn parked
  and never move; `08-motion.md` rules 7 and 8 now say so. A headless test
  drives five simulated minutes on three sizes and checks that no two cars
  ever touch and nothing jams. 42 tests, lint and build clean. Two questions
  are open for Scott, in `hero-drive.md` §Handoff: whether the black car
  belongs on phones, where it can't be driven, and the few short blocks
  where a stopped car sits on the crossing.
- **First Phase 3 revision, the same day:** both maps read as slightly too
  busy, so four roads came out of the desktop map and two out of the phone
  map. All were side streets or short stubs, so the desktop grid still has
  the brief's 20 to 30% of its roads removed. Scott reviews the roads next,
  and the car logic after that.
- **Second revision, the same day:** every road is now one width, 40px on
  desktop and 24px on phones, where side streets used to be 60% of that.
  One more short road came off the desktop map's right edge. The wider side
  street leaves the blocks beside it too short in windows under about 730px
  tall, and at 1280×600 the traffic can jam there; `hero-drive.md` §Handoff
  has the options.
- **Third revision:** the phone street band is always 240px, its smallest
  height, so the hero on a tall phone no longer stretches to fill the
  screen.
- **Roads approved.** The side street stays. The traffic now copes with its
  short blocks, and a new runtime rule hides it in windows too short for it,
  including phones on their side.
- **Phase 4, the drivable car:** built September 24. On a desktop-class screen a small Drive pill sits in
  the hero's bottom-right corner. Press it and the black car is yours with
  WASD or the arrows until Esc or the ×; it drives anywhere in the hero,
  over the headline too, bounces off the edges and off traffic, and traffic
  stops for it. When you stop, it drives itself back into traffic. Physics is
  planck.js, loaded only when the pill is hovered or pressed, as a 49KB
  chunk. Until Phase 5, a stand-in automatic drove it.
  Pressing Drive sends one GA4 event, `hero_drive` (`05-analytics.md`).
  Keyboard and focus rules follow the spec, checked in Chrome. 54 tests, lint
  and build clean. A few recovery values were changed from the spec after
  testing; `hero-drive.md` §Handoff lists them for review.
- **First Phase 4 revision, the same day:** after Scott's test drive it felt
  slow and clunky. It's retuned: 0 to 100 km/h in 1.8s, top speed about 205
  km/h, a quarter turn in about 0.9s, and a drift above 45 km/h that holds
  without spinning.
- **Phase 5, the gearbox and gear display:** built September 24, and
  revised at Scott's request in the entries below. A real six-speed box
  with a clutch,
  in two modes: manual (↑ and ↓ shift, Shift is the clutch; it grinds,
  stalls and over-revs like a real one) and automatic (it shifts itself and
  feels like the Phase 4 car Scott liked). A button on the display, or M,
  switches between them, and the choice is remembered. The "Driving" panel
  became a gear display in the About page's shift-gate style: an H-pattern
  with a knob that travels through neutral, the gear as a big numeral, a rev
  bar with the redline, a clutch lamp, and the switch. Automatic is the
  default until a visitor picks; that's a question for Scott. 69 tests,
  lint and build clean.
- **Phases 3 to 5 and the whole-page drive are committed and pushed** to
  `origin/overhaul`, September 24, so the review deployment has them.
- **After Phase 5, the whole page:** at Scott's request the black car can
  now be driven over every section of the homepage, down to the footer.
  Near the bottom or top of the window the page scrolls after it, with
  momentum, so it carries on for a moment after the car slows. The visitor's
  own scroll always wins. A drive that ends below the hero ends with the car
  driving off the side and coming back in at a way in. This is an exception
  to `08-motion.md` rule 6 (no scroll-jacking), which now says so. Built
  September 24; Scott tried it and liked it. 77 tests, lint and build
  clean.
- **Tyre marks, September 25:** at Scott's request, pulled forward from
  Phase 6 on their own. The black car leaves marks whenever it's driven:
  faint while the wheels roll, darker and wider when a tyre slides, in a
  drift, a skid, hard braking or wheelspin. They fade over 5 to 10s, under
  the cars and anywhere on the page. The spec only marked skids; this is
  Scott's change, recorded as Decision 21. Also fixed: the gear display's
  knob went back to N before every change. 82 tests, lint and build
  clean.
- **The reviews strip as a treadmill, September 25:** at Scott's request.
  While the black car is on the moving reviews, the strip carries it and
  its tyre marks along, and the car's wheels push the strip back under it:
  drive right and the reviews run left, faster the faster the car goes;
  drive left and they turn round. With no car on it the strip drifts as
  before. 88 tests, lint and build clean. Which way it should run is a
  question for Scott (`hero-drive.md` §Open questions).
- **The September 25 work is committed and pushed** to `origin/overhaul`,
  all of it below, so the review deployment has it.
- **The driving display, redesigned, September 25:** at Scott's request,
  in four rounds the same day. The button says "Test drive". The display
  runs along the bottom of the window like a car's dash: a half-circle
  speedometer with a thin rev arc inside in the bottom-left corner; a dock
  in the middle with the keys when a drive starts, above the Auto / Manual
  switch and Stop; and a large gear shifter in the bottom-right corner, with
  a clutch lamp in manual. Each sits on a pod of dark, blurred glass shaped
  to it (a dome for the speedometer) rather than a box. Nothing rides above the car. The corner panel is
  gone. 88 tests, lint and build clean.
- **The black car starts up top, September 25:** on load it now starts on a
  street in the top part of the map instead of wherever the seed put it,
  which was often the bottom-left corner.
- **Ending a drive, September 25:** the car now always drives itself off
  the side of the window, fast (to 150 km/h, off in 2.5s at the median),
  is only handed back once it's out of sight, and comes back in at the top
  of the map. 89 tests, lint clean.
- **Phase 6, with effects, September 25:** at Scott's request. Traffic cars
  the black car hits are bumped out of their lanes as real bodies, slide
  and spin, bump others only above a nudge, and drive themselves back into
  their lanes; nothing else happens to them. Sparks where cars hit; smoke on
  a stall, an over-rev and sliding tyres. Fire was built and taken out the
  same day, at Scott's word. 92 tests, lint and build clean.
- **Phase 7, still to build:** save-data, WebGL-failure handling,
  disposal, performance (now with particles and knocked cars in it) and
  the bundle report. Its phones and touch part was done early, in Phase 4:
  Drive isn't offered there.
- The first prototype of this feature, a different design that was never
  mounted, was kept on a local branch for the day and then deleted. It was
  never pushed; `hero-drive.md` §Where this started records what it was.

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
