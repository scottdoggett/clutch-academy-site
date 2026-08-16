# SEO & Tracking — Operational Reference

The practical companion to the spec. **Architecture and decisions live in
`docs/spec/04-seo.md` and `docs/spec/05-analytics.md`** — this file is the
where-to-change-it, how-to-verify-it, what-will-bite-you guide.

Rewritten August 16, 2026 for the Next.js build. If you find references to
`scripts/prerender.mjs`, `@sparticuz/chromium`, `vercel.json`, or
`window.__PRERENDER__`, they belong to the Vite site on `main` — see
`docs/spec/06-deployment.md` for why two builds exist.

---

## Where to change things

| To change… | Edit |
|---|---|
| A price | `PackagesTeaser.jsx`, hub `PACKAGES`, all four `lessons/*/page.jsx`, homepage `Offer` entries, `booked.html` `priceForEvent`, `llms.txt` — full list in `spec/03-content-and-pricing.md` |
| Page title / description / canonical | The `metadata` export at the top of that route's `page.jsx` |
| Site-wide metadata defaults | `src/app/layout.jsx` |
| An FAQ (question, answer, or order) | `src/lib/faqs.js` only — page, subsets, and schema all follow |
| Which FAQs a package page shows | That page's `FAQ_IDS` array |
| Google rating / review count | `src/lib/googleReviews.js` |
| Business schema (address, hours, area served) | `SCHEMA_GRAPH` in `src/app/page.jsx` |
| Redirects, rewrites, cache headers | `next.config.mjs` |
| Crawler policy | `public/robots.txt` |
| The AI-crawler summary | `public/llms.txt` |
| Canonical domain | `metadataBase` in `layout.jsx`, plus `sitemap.xml`, `llms.txt`, `next.config.mjs`, `privacy.html`, and the JSON-LD `@id`s |
| Conversion values | `priceForEvent()` and `DEFAULT_VALUE` in `public/booked.html` |
| Consent storage key | Three places: `src/lib/consent.js`, the inline snippet in `layout.jsx`, and `public/booked.html` |

---

## Verification

Run against a real production build — `npm run dev` renders differently enough
to mislead on anything metadata- or SSG-related.

```bash
npm run build && npx next start -p 4321
```

`npm run start` defaults to :3000, which is often already taken on this machine
— a stray 307 to `/sign-in` means you're talking to something else entirely.
Pick a free port and use it throughout:

```bash
P=4321

# Every route returns 200
for p in / /manual-driving-lessons /lessons/individual /lessons/manual-foundations \
         /lessons/manual-confidence /lessons/group /about /faq /contact; do
  printf '%-34s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' localhost:$P$p)"
done

# AI-crawler readability: body copy must be present without JS
curl -s localhost:$P/lessons/individual | grep -c 'Seventy-five minutes'

# One h1 per route
curl -s localhost:$P/about | grep -o '<h1' | wc -l

# Structured data present
curl -s localhost:$P/        | grep -o '"@type":"DrivingSchool"'
curl -s localhost:$P/faq     | grep -o '"@type":"FAQPage"'
curl -s localhost:$P/lessons/group | grep -o '"@type":"BreadcrumbList"'

# Static SEO files reachable
for f in robots.txt sitemap.xml llms.txt site.webmanifest; do
  printf '%-20s %s\n' "$f" "$(curl -s -o /dev/null -w '%{http_code}' localhost:$P/$f)"
done

# Rewrites
curl -s -o /dev/null -w '%{http_code}\n' localhost:$P/booked
curl -s -o /dev/null -w '%{http_code}\n' localhost:$P/privacy

# Pixels must NOT appear in served HTML — they load only after consent
curl -s localhost:$P/ | grep -c 'connect.facebook.net'   # expect 0
curl -s localhost:$P/ | grep -c 'analytics.tiktok.com'   # expect 0

# Consent must default to denied
curl -s localhost:$P/ | grep -o "analytics_storage: 'denied'" | head -1

# No stale pricing anywhere in the build
grep -rlE '\$(90|180|240|400)\b' .next/server/app/ || echo "clean"

# Host redirects (308 → apex)
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: www.clutchacademy.ca' localhost:$P/
```

Lighthouse, when it's worth a full pass:

```bash
npx lighthouse http://localhost:$P/lessons/individual \
  --only-categories=seo,accessibility,best-practices --chrome-flags="--headless"
```

---

## Pixel event reference

The events this site fires. Anything not listed is *not* fired here — some of it
is handled by Calendly or by the platform's own automatic tracking.

### Meta Pixel

| Event | When |
|---|---|
| `PageView` | On load, after consent |
| `Lead` | Any booking CTA click, with a `source` param |
| `Contact` | A contact channel used, with a `method` param |
| `Purchase` | On `/booked`, after a completed Calendly booking |

### TikTok Pixel

| Event | When |
|---|---|
| `page` | On load, after consent |
| `ClickButton` | Any booking CTA click, with a `source` param |
| `Contact` | A contact channel used |
| `CompletePayment` | On `/booked` |

**Why `ClickButton` and not `Lead`:** TikTok's `Lead` is defined as a completed
form submission. A booking CTA click opens a Calendly popup — it's intent, not a
submitted lead. Using `Lead` here would inflate the metric and make TikTok's
optimisation chase the wrong signal.

### GA4

| Event | When |
|---|---|
| `booking_cta_click` | Any booking CTA, with `source` |
| `purchase` | On `/booked`, with the derived value |

GA4 needs no consent-gated loader — gtag.js is always present and Consent Mode
gates its storage instead.

### Adding an event

1. Add the wrapper in `src/lib/metaPixel.js` / `tiktokPixel.js`.
2. Call it from the component, never from a page directly.
3. Confirm it only fires post-consent — the loaders are the gate; don't
   bypass them.
4. Check it in the platform's test tool before relying on the data.

---

## Common pitfalls

**The `booked.html` price-rule order.** Group must be tested before the
five-pack. `"2.5"` matches the five-pack's `\b5\b` pattern, so a reversed order
reports $469 for a $219 group booking. This has bitten once already.

**Redirect loops between config and dashboard.** A host redirect in project
config can fight Vercel's domain-dashboard redirect — with `www` set as Primary
in the dashboard *and* a `www → apex` rule in config, the two layers point at
each other forever. If you see a loop, that's the cause.

**The OG image cache.** `og-image.png` is referenced with a `?v=N` query
parameter. Bump the integer whenever the image changes, or Facebook, Slack,
iMessage, and preview tools serve their cached copy for up to a month.

**Client-rendered banners in static HTML.** A component that renders on the
server and hides after hydration is still in the HTML crawlers read. This is
exactly how the expired August-1 banner ended up advertising "book before
August 1" alongside post-August-1 prices. If something must not be crawled,
don't render it server-side.

**Consent key drift.** The key lives in three files that can't import each
other. Change one, change all three, or returning visitors silently lose their
choice.

**FAQ copy forked into a page.** The whole point of `src/lib/faqs.js` is that
the visible answer and the FAQPage schema can't disagree. Copy-pasting an answer
into a page breaks the guarantee quietly — nothing errors, the structured data
just stops matching.

**Editing `main` by accident.** `main` is the live site on a different
framework. Check `git branch --show-current` before you start.

---

## Still open

- **Google Ads conversion label is empty** in `booked.html` — Ads conversions
  are a silent no-op until someone creates the conversion action and pastes the
  label. See `google-ads-mapping.md` §1.
- **Search Console verification token** — stubbed `PENDING` in `layout.jsx`.
- **`aggregateRating`** — real GBP numbers, but self-attested rating markup
  carries manual-action risk. Decision pending; see `spec/07-status.md`.
- **Slug keyword audit** — never done deliberately; cheap now, expensive once
  Ads final URLs point at these routes.
