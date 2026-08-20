# 04 — SEO

SEO is the reason the rebuild exists. The single-page site had one URL competing
for every query; this build has nine, each targeting something specific.

## The architecture

Every route is **statically generated at build time**, so crawlers that don't
execute JavaScript — GPTBot, ClaudeBot, PerplexityBot, plain Googlebot fetches,
social scrapers — receive complete HTML. This is structural, not a plugin: there
is no prerender script to break, because `next build` emits the finished markup.

Each route carries a unique `<title>`, meta description, canonical, a single
`<h1>`, a sensible heading hierarchy, descriptive image alt text, internal
links, and a booking CTA.

## Per-route targets

Homepage title pattern is established and should be kept:
`Manual Driving Lessons in Toronto | Clutch Academy`.

| Route | Primary keyword | Supporting |
|---|---|---|
| `/` | manual driving lessons Toronto | stick shift lessons, learn manual |
| `/manual-driving-lessons` | stick shift lessons Toronto | learn manual in Toronto, manual lesson packages |
| `/lessons/individual` | manual driving refresher Toronto | first stick shift lesson, one-on-one |
| `/lessons/manual-foundations` | learn to drive manual Toronto | beginner manual lessons |
| `/lessons/manual-confidence` | highway manual lessons Toronto | hill starts, city driving, rush hour |
| `/lessons/group` | group manual lessons Toronto | learn stick with a friend |
| `/about` | — (trust page) | Sam Anthony, manual instructor Toronto |
| `/faq` | — | manual lesson questions, licence requirements |
| `/contact` | — | book manual lesson Toronto |

⚠️ **The hub's H1 no longer carries the keyword.** `/manual-driving-lessons`
used to open with `Manual Driving Lesson Packages in Toronto`; that whole intro
section was removed in August 2026 at the client's request, and the page's H1 is
now **"Four ways to learn"**. The keyword survives in the `<title>`
(`Stick Shift & Manual Driving Lessons in Toronto | Clutch Academy`), which
carries more ranking weight than the H1, and the "Manual · Stick Shift ·
Standard" eyebrow keeps the synonyms on-page. Still, this is the site's main SEO
hub and an Ads destination — if rankings for that term soften, restoring a
keyword-bearing H1 (e.g. "Four ways to learn manual in Toronto") is the first
thing to try.

🟡 Slugs are recommended, not locked. `/manual-driving-lessons` and
`/lessons/*` have never had a deliberate keyword audit — worth one **before**
Google Ads final URLs point at them, since changing a slug afterwards means
redirects and re-approval.

## Structured data

| Schema | Where | Generated from |
|---|---|---|
| `DrivingSchool` (+ `PostalAddress`, `GeoCoordinates`, `OpeningHoursSpecification`, `areaServed`) | Homepage | `src/app/page.jsx` |
| `Offer` × 3 | Homepage graph | Same file — must track the real prices |
| `Person` (Samuel Anthony) | Homepage graph | Same file |
| `AggregateRating` | Homepage `DrivingSchool` | `src/lib/googleReviews.js` |
| `FAQPage` | `/faq` | `src/lib/faqs.js` |
| `BreadcrumbList` | Each package page | `src/components/Breadcrumbs.jsx` |

Two things to hold onto:

- **The FAQ schema and the visible FAQ cannot drift** — both render from the
  same array. Preserve that property.
- ❓ **`AggregateRating` is an open flag.** It carries the real Google Business
  Profile figures (5.0 from 33 reviews) rather than anything invented, but
  self-attested rating markup on your own site is the pattern Google's 2019
  guidance warns about, and it can earn a manual action. It was inherited from
  the live site, not introduced here. Someone has to decide: keep it, or remove
  it. **Do not add `Review` markup or extend `aggregateRating` to any other
  page** while this is unresolved.

`Offer` entries currently reflect three of the four packages — individual,
foundations, confidence. Group is not represented; adding it would be a small,
correct improvement.

## Collapsed content and crawlers

The hub's package cards fold their feature bullets behind a `<details>` on
phones (`02-architecture.md`). This is safe: `<details>` hides content
visually, it does not remove it, so the bullets are in the served static HTML on
every request and above 768px they aren't hidden at all. There is no
cloaking and no second copy of the markup — the same element serves both.

The same holds for the `/faq` accordion and the package pages' FAQ subsets,
which have always been `<details>`, and whose copy also feeds the FAQPage
schema.

## Crawler-facing files

| File | Purpose |
|---|---|
| `public/robots.txt` | Allows everything, then **explicitly allows 16 AI crawlers** — GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot, Bytespider, Amazonbot, Meta-ExternalAgent, cohere-ai and others. This is a deliberate business decision for maximum discoverability in AI assistants, not an oversight. Points at the sitemap. |
| `public/sitemap.xml` | All 9 canonical URLs with `lastmod`. Update `lastmod` when content changes materially. |
| `public/llms.txt` | Mintlify-style plain-language summary for LLM crawlers: services and prices, service area, booking, contact, requirements, curriculum, cancellation, instructor. **Prices live here too** — update on any pricing change. |
| `public/site.webmanifest` + icons | Home-screen install |
| `public/og-image.png` | Social sharing card |

### The OG image cache-bust

The OG image URL carries a `?v=N` query parameter. **Increment it whenever
`og-image.png` changes**, or Facebook, Slack, iMessage, and preview tools will
serve their cached copy for anywhere from a day to a month.

## Verified in QA

Recorded so nobody re-runs it blindly. From the pre-launch pass (July 2026,
headless Chrome against a local production server):

- **Lighthouse: 100 accessibility, 100 SEO, 100 best-practices on all 9
  routes.** Homepage desktop performance 100 (LCP 1.6s, CLS 0). Mobile
  performance 61–70 under slow-4G emulation — a throttling artefact; CLS was 0
  everywhere.
- Every route serves complete static HTML (725–2,181 words) with a correct h1
  and canonical. Junk URLs return the noindexed 404.
- Full internal link audit: every link on every page resolved 200.
- Host redirects (`www.` and `.com` → apex, 308) verified via Host header.

**Not verified:** anything requiring the production domain, and real-device iOS
Safari.

⚠️ **This QA predates the August 2026 changes and is now materially stale.**
The August 16 round was copy, ordering and one new component, but August 18
reworked layout across the site: the shared content column, the mobile nav,
touch targets, the package cards, and the hub's chooser — which changed again on
August 20. A re-run across all 9 routes is a cutover requirement rather than
cheap insurance — it is listed in the runbook in `06-deployment.md`.

## Future content

Not launch-blocking, but the reason a `/blog` is worth keeping in mind. Topics
seeded by the client brief: Stick Shift Lessons Toronto · Learn Manual in
Toronto · Manual Driving Refresher · Highway Lessons · Hill Starts · Driving
Manual in Europe.

The Europe angle is the strongest of these — it's the audience's top motivation
(`01-brief.md`) and has near-zero local competition.

## Off-site dependencies

Both sit with Sam, not in this repo:

- **Google Search Console** — the `verification` field in
  `src/app/layout.jsx` is stubbed with a `PENDING` comment awaiting the token.
  Submit the sitemap once verified.
- **Google Business Profile** — the source of the rating and review count in
  `src/lib/googleReviews.js`. Update that file when the numbers move; NAP data
  must match the site exactly.
