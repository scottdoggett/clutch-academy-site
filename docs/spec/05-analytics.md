# 05 — Analytics, Consent & Conversion Tracking

Four platforms, all consent-gated, plus a static conversion page that has to
work outside the React bundle.

## Accounts

| Platform | ID | Loaded |
|---|---|---|
| Google Analytics 4 | `G-5E5GEN5N59` | Always — Consent Mode gates its storage |
| Google Ads | `AW-18196514948` | Same gtag.js library, second `config` |
| Meta Pixel | `2845684255788584` | Only after consent |
| TikTok Pixel | `D87LSEBC77UENKCNER8G` | Only after consent |

## Consent Mode v2

**Deny-first.** An inline snippet in `src/app/layout.jsx` runs before gtag.js
configures anything and sets `ad_storage`, `ad_user_data`, `ad_personalization`,
and `analytics_storage` to `denied`, with `functionality_storage` and
`security_storage` granted and a 500 ms `wait_for_update`.

Flow:

1. **First visit** — everything denied. `ConsentBanner` is shown. gtag queues.
2. **Accept** — the banner writes `granted` to localStorage, sends a
   `consent update`, and loads the Meta and TikTok pixels.
3. **Decline** — the choice is stored; nothing loads. Ad pixels never fire.
4. **Return visit, already accepted** — `AnalyticsLoader` reads the stored
   choice on mount and loads the pixels so this visit's PageView fires.

**The storage key is `clutch.consent.v1`, and it exists in three places** that
cannot import each other: `src/lib/consent.js` (the app bundle), the inline
snippet in `layout.jsx`, and `public/booked.html`. All three hardcode the same
literal. Change one, change all three.

Verified in QA: the deny-first default is inline in `<body>` before gtag config
on all routes, and served HTML contains zero Meta/TikTok pixel URLs — they
genuinely load only on consent.

## Events

### `booking_cta_click` (GA4)

Fired by `openCalendly(source)` on every booking CTA, carrying a `source`
parameter identifying the placement. This is the funnel's top and the main
optimisation signal. Meta and TikTok receive parallel intent events.

**Every Book button goes through `src/components/BookButton.jsx`.** Adding a CTA
without a distinct `source` silently degrades attribution.

Active source tags:

| Tag | Placement |
|---|---|
| `nav` | Nav "Book Now" — site-wide |
| `hero` | Homepage hero |
| `about` | Homepage About teaser |
| `about_page` | `/about` |
| `packages_single` | `/lessons/individual` |
| `packages_3pack` | `/lessons/manual-foundations` |
| `packages_confidence_5pack` | `/lessons/manual-confidence` |
| `packages_group` | `/lessons/group` hero and closing CTA |
| `packages_group_2hr` | `/lessons/group` option card |
| `faq` | `/faq` |
| `contact` | `/contact` |
| `lessons_overview_close` | `/manual-driving-lessons` closing CTA |
| `lessons_overview_pick_single` | Hub "Pick by where you are today" — refresher row |
| `lessons_overview_pick_3pack` | Hub "Pick by where you are today" — never-driven-stick row |
| `lessons_overview_pick_confidence_5pack` | Hub "Pick by where you are today" — mastery row |
| `lessons_overview_pick_group` | Hub "Pick by where you are today" — with-a-friend row |

Two historical notes that matter for reading GA4 reports:

- **`packages_group_2hr` now labels a 2.5-hour session.** The tag was kept
  through the August-1 switch so the series stays continuous, matching the live
  site. The name is stale; the data is comparable.
- **`announcement` is retired.** It belonged to the August-1 banner's Book
  button, removed once the switch shipped. Historical data remains valid.
- **`reverse` is retired.** It belonged to the old single-page site's Reverse
  section.
- **`lessons_overview` is retired.** It belonged to the Book CTA in the
  `/manual-driving-lessons` intro hero, removed in August 2026. The hub got a
  booking CTA back on August 18, at the foot of the page rather than the top —
  it carries the new tag `lessons_overview_close` rather than reviving this one,
  so the two placements stay distinguishable in reports.

The four `lessons_overview_pick_*` tags are per-row on purpose: every Book
button opens the same Calendly, so the only thing distinguishing them is which
situation the visitor identified with. That's the question the chooser exists to
answer, and one shared tag would throw it away.

### Contact intent

`ContactCard` fires per-channel intent events to Meta and TikTok when someone
uses a contact method (phone, email, Instagram, Facebook).

## Conversion tracking — `public/booked.html`

Calendly redirects here after a completed booking. It is a **self-contained
static page**: its own styles, its own consent bootstrap, its own analytics. It
ships verbatim from `public/` and is served at `/booked` via a rewrite in
`next.config.mjs`.

On load it fires, once per booking:

- GA4 `purchase`
- Google Ads `conversion`
- Meta `Purchase`
- TikTok `CompletePayment`

All four share a stable `eventId` so they can be de-duplicated.

**Conversion value** comes from `priceForEvent()`, which keyword-matches
Calendly's `event_type_name` parameter:

| Match | Value |
|---|---|
| `group`, `2.5`, `two and a half`, `150` | $219 |
| `confidence`, `highway`, `five`, `\b5\b` | $469 |
| `3`, `three`, `pack` | $299 |
| anything else / missing | $109 (`DEFAULT_VALUE`) |

⚠️ **Rule order is load-bearing.** Group is tested first because `"2.5"`
satisfies the five-pack's `\b5\b` pattern — reversed, a $219 group booking
reports $469.

**De-duplication:** a booking id is built from start time + event name + invitee
name and stored, so refreshing or revisiting the confirmation URL doesn't
re-fire. This depends on Calendly's "Pass event details to your redirected page"
setting — without those parameters every booking collapses into one bucket.

### ❓ Google Ads conversions are currently a no-op

`GOOGLE_ADS_CONVERSION_LABEL` in `booked.html` is an **empty string**. The Ads
conversion fires against nothing. GA4 `purchase` works, Meta and TikTok work —
Ads does not.

Fixing it is account-side: create the conversion action in the Google Ads UI,
copy the label, paste it into `booked.html`. Steps are in
`../google-ads-mapping.md` §1. Until then, **do not trust Ads conversion data**,
and don't let anyone optimise campaigns against it.

## Maintenance checklist

When you change pricing, also change `priceForEvent()` and `DEFAULT_VALUE`.
When you add a CTA, give it a new `source`. When you add a platform, gate it
behind consent in `AnalyticsLoader` — never load it in `layout.jsx`.
