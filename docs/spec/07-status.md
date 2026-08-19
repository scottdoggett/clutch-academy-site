# 07 — Status

**Last updated:** August 18, 2026.

Where the build actually is, and every question still waiting on a human. If
this file disagrees with another doc about current state, this file wins.

## In one paragraph

The Next.js rebuild is **complete and unmerged**. All 9 routes carry real
content, analytics and consent are wired, and the pre-launch QA pass scored 100
accessibility and 100 SEO on every route. It is deployed to its own Vercel
project for review while `main` keeps serving customers the original Vite site.
The August-1 pricing switch has now been applied to both branches. What remains
before cutover is verification and client sign-off, not building.

## Recently completed — August 18, 2026

A layout and mobile pass. Both entries under "Known bugs" are fixed, plus
several defects that pass hadn't caught. No content decisions were made — the
open questions below are untouched.

- **One content column per page.** The skew described in the old "known bugs"
  entry was half the story. Blocks capped *narrower* than the 1200px
  `.section__inner` inherit its `margin: 0 auto` and re-centre, landing ~150px
  right of the nav, the footer, and every full-width section on the same page —
  so a page showed two competing left edges, which is what made it noticeable.
  `.section__inner` now publishes `--column-inset` (the distance from the
  section padding edge to the column's left edge) and every narrower block uses
  `margin-inline: var(--column-inset) auto`. The blocks capped at 1100px inside
  the column were uncapped. Measured at 320 / 390 / 1024 / 1280 / 1440 / 1713:
  all 9 routes resolve to a single left edge.
- **The mobile nav no longer wraps.** At 375px and below, the bar's row (logo
  189px + toggle + Book Now) didn't fit; Book Now dropped to a second line and
  the bar grew to 113px while every page still reserved `--nav-height` (64px),
  so the fixed bar covered the first heading. 375 and 360 are the two most
  common phone widths. The bar is `nowrap`, the open menu is an absolutely
  positioned dropdown (opening it can't change the bar's height), and the logo
  shrinks to absorb the remainder. Verified one row from 320 to 767px.
- **The mobile menu panel is opaque.** It was inheriting the bar's 0.85 alpha,
  and the hero's display-size headline read through it.
- **Breadcrumbs were rendering under the fixed nav on phones.** The
  `max-width: 639px` block replaced the bar's nav clearance with a flat
  `0.75rem`, reasoning that the hero below carries it — but
  `.breadcrumbs + .section--first` deliberately shrinks the hero's padding
  *because* the trail is meant to do the clearing. The trail sat at y=12-33 and
  the hero eyebrow at y=49-71, under a 64px nav. The bar also had no horizontal
  padding, so it sat flush to the viewport edge.
- **Touch targets.** Nav toggle (37px), nav Book Now (34px), footer links (17px
  on a 25px pitch), FAQ rows (39px), contact tap-to-call/mail (29px), `/about`
  "pick where to start" (27px) all now clear 44px; breadcrumbs sit at 28px, past
  the 24px AA floor. Where width was scarce or padding would have detached an
  underline from its text, the hit area grows via an overlay rather than
  padding.
- **`/manual-driving-lessons` has a closing Book CTA again** — see the retired
  bug below. New `source` tag `lessons_overview_close`; the old
  `lessons_overview` stays retired because it labelled the intro-hero placement
  and conflating them would muddy the GA4 series.
- **Homepage About stats** sat on three different baselines on phones, because
  two of the three labels wrap and one doesn't.
- **`/faq` lead** was missing a space: "Get in touch" ran into "and".
- **Package cards: 2x2 on phones, and less of them.** Both four-card sets (the
  homepage teasers and the hub's) held a single column below 768px, so comparing
  four prices meant scrolling past all four; they now keep the 2x2 grid down to
  320px, with the card internals scaled by vw-with-clamp rather than fixed
  sizes. The grid alone read as busy, so the hub card now leads with a much
  larger title and folds its feature bullets behind a native `<details>`
  ("What's included"), using the same +-rotates-to-x affordance as the `/faq`
  accordion. No JS, and the bullet copy stays in the HTML for crawlers.
  ⚠️ The disclosure applies at **every** width, not just phones — CSS alone
  can't open a `<details>` on desktop and leave it closed on mobile, and the
  alternative was a client component for a purely presentational concern. The
  homepage teasers took the type change but no disclosure: their one-line
  description is the only thing that could hide, and `01-brief.md` says the
  homepage should route to the package pages rather than explain them inline.

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
| 4 | **Confidence-guarantee terms** | `/lessons/manual-confidence` | Mentioned on the page (it was already public on the live site) but the terms have never been written. |
| 5 | **Package inclusions** | `/lessons/individual`, `/lessons/group` | Current bullets are the live site's placeholders. Sam owes final 3–5 each. |
| 6 | **Cancellation-policy final wording** | `src/lib/faqs.js` (`cancellation`) | Current text is the live site's. Editing it there propagates everywhere. |
| 7 | **Dedicated testimonials** | `/about` | Every quote on the site is a real Google review. Sam may supply dedicated ones; there's a `PENDING` slot. |
| 8 | **Fonts now actually render** | Site-wide | Plus Jakarta Sans + Inter were referenced but never loaded on the old site — it silently fell back to system fonts. `next/font` loads them, so the rebuild *looks different*. Per the tokens' clear intent, but nobody has confirmed it with Sam. |
| 9 | **Search Console verification token** | `src/app/layout.jsx` | Stubbed `PENDING`. Sam-side. |
| 10 | **Slug keyword audit** | Routes | 🟡 Slugs were never deliberately audited. Cheap to change now, expensive once Ads final URLs point at them. |

### From the Site 2.0 review doc — still needing clarification

Raised with the client, not yet answered:

| Item | The problem |
|---|---|
| "Update cancellation policy" | The screenshot supplied is character-identical to the current text. No new wording was given. |
| Move Payment & cancellation from Contact → FAQ | `/faq` already renders payment *and* cancellation answers from `faqs.js`. Moving the Contact block there duplicates them. Replace the FAQ entries, or add a distinct styled section? |
| Highlight Complete Confidence "like Foundations" | Move the featured treatment from Foundations to Confidence, or feature both? |
| Gear-shifter clip art as chooser bullets | Supplied as a black-on-white raster PNG; the section is brand red with cream text. Needs a vector, or a traced inline SVG recoloured. |
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
| Build + lint | ✅ Clean as of August 16, 2026 |
| Lighthouse, all 9 routes | ✅ 100 a11y / 100 SEO / 100 BP — but **predates the August content changes** |
| Crawlability, canonicals, h1s | ✅ Verified July 2026 |
| Internal links | ✅ All 200, July 2026 |
| Consent Mode deny-first | ✅ Verified — no pixel URLs in served HTML |
| `booked.html` conversion scripts | ✅ Syntax-checked; dedup guard intact |
| Host redirects | ✅ Verified locally via Host header |
| **Real-device iOS Safari** | ❌ **Never done since the migration.** Pre-launch requirement. |
| **Production domain behaviour** | ❌ Not testable until cutover |
| **Re-run of QA after August changes** | ❌ Not done |

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
