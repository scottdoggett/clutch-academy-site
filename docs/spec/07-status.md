# 07 — Status

**Last updated:** August 16, 2026.

Where the build actually is, and every question still waiting on a human. If
this file disagrees with another doc about current state, this file wins.

## In one paragraph

The Next.js rebuild is **complete and unmerged**. All 9 routes carry real
content, analytics and consent are wired, and the pre-launch QA pass scored 100
accessibility and 100 SEO on every route. It is deployed to its own Vercel
project for review while `main` keeps serving customers the original Vite site.
The August-1 pricing switch has now been applied to both branches. What remains
before cutover is verification and client sign-off, not building.

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

## Known bugs — found, not yet fixed

**Content blocks sit left of centre on wide screens.** Measured August 16, 2026
at a 1713px viewport. `.section__inner` is `max-width: 1200px; margin: 0 auto`
and centres correctly, but several children are capped narrower with `margin: 0`,
so the leftover width all collects on the right instead of splitting:

| Block | Where | Width in a 1200px column | Skew |
|---|---|---|---|
| `.hub-cards` | The four package cards on the hub | 1100px | 100px left of centre |
| `.lesson-quotes` | Review quotes, all four package pages | 1100px | 100px |
| `.lesson-faq` | FAQ block, all four package pages | 900px | 300px |

Blocks whose parent `.section__inner` is itself capped at 900px (the package
hero, "who it's for", the hub chooser) are centred correctly — so a page can
show content on two different alignments, which is what makes it noticeable.

Scales with viewport: zero below ~1230px, full effect above ~1330px. Invisible
on a laptop, obvious on a large monitor.

⚠️ **The fix is not simply `margin-inline: auto`.** That would centre the card
grid but leave its left edge 50px right of the "Four ways to learn" heading
above it — trading a subtle misalignment for a more visible one. The better fix
is to drop the narrower `max-width` so each block fills the column its heading
already uses. Awaiting a decision on scope.

**`/manual-driving-lessons` has no booking CTA.** The hub's only Book button
lived in the intro hero removed on August 16, 2026. Booking still works via the
package pages and the site-wide nav button, and routing to package pages is
arguably a comparison page's job — but `01-brief.md` states every page funnels
to a Book CTA, and this is a significant entry point.

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
