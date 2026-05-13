# SEO Reference — Clutch Academy

This doc explains how SEO is wired on this site, what every file does, where to make changes, and how to verify things. It's the operational manual for the implementation that landed in May 2026.

The decision-state symbols match the rest of `docs/spec/`: ✅ decided / shipped, 🟡 default that can change, 📎 waiting on an asset.

---

## Status — what's done, what's open

This section is the running progress log. Anyone (human or AI) reading the doc cold can use it to know exactly what's wired up and what's left.

### ✅ Shipped (May 2026)

**Build pipeline & runtime**
- Build-time pre-render via `scripts/prerender.mjs` (Puppeteer + headless Chromium). Non-JS-executing crawlers now see fully-rendered HTML.
- `@sparticuz/chromium` swap on Vercel (statically-linked Chromium with the libs Vercel's container is missing).
- Vite's preview server driven in-process (no `npx` shell-out — was flaky in CI).
- `window.__PRERENDER__` runtime gate in `main.jsx`, `GearSection.jsx`, `Reviews.jsx`, `ConsentBanner.jsx` so the snapshot has zero animation-injected attributes.
- Calendly assets lazy-loaded on first CTA click (was a heavy `<head>` script before).

**Meta surface in `index.html`**
- `<html lang="en-CA">`, full `<title>` + meta description.
- Canonical, robots, theme-color (`#C8102E`), Open Graph (image, locale, type, site_name, url, title, description), Twitter `summary_large_image`.
- Apple touch icon link, manifest link.
- Google Analytics 4 + Consent Mode v2 default-deny snippet (Measurement ID `G-5E5GEN5N59`).
- DrivingSchool / Offer / Person JSON-LD `@graph`.
- `<!-- FAQPAGE_LD -->` splice marker (filled by the prerender script at build time).

**Structured data**
- DrivingSchool entity with name, url, description, telephone, email, priceRange, `areaServed: City "Toronto"`, image, logo, `sameAs: [Instagram, Facebook]`, `makesOffer`, `employee`.
- Two `Offer` entities ($90 single, $240 3-pack) in CAD.
- `Person` for Sam Anthony.
- `FAQPage` generated automatically from `Faq.jsx`'s `FAQS` array on every build (build fails on truncated/unterminated answers — caught the original cancellation copy bug on first run).

**Static SEO files (`public/`)**
- `robots.txt` allowing all crawlers, with explicit allows for the major AI bots.
- `sitemap.xml` (single canonical URL).
- `llms.txt` (Mintlify-style summary for LLM crawlers).
- `site.webmanifest` (PWA manifest).
- `privacy.html` (standalone privacy page; resolves at `/privacy` via Vercel `cleanUrls`).

**Assets generated from `logo2.svg` (via `scripts/generate-images.mjs`)**
- `og-image.png` — 1200×630, logo centered on brand red, no tagline.
- `apple-touch-icon.png` — 180×180.
- `icon-192.png` — PWA manifest 192.
- `icon-512.png` — PWA manifest 512.

**Meta Pixel (ad measurement, shipped 2026-05-12)**
- Pixel ID `2845684255788584` integrated via `src/lib/metaPixel.js`.
- `fbevents.js` is **lazy-loaded only after consent** (mirrors GA4 gating). Zero requests to `connect.facebook.net` before the user clicks Accept.
- Returning visitors with stored consent get the Pixel loaded from `main.jsx` on boot; first-time visitors load it from `ConsentBanner.jsx` on accept.
- Events fired from the site:
  - `PageView` — once after consent.
  - `Lead` with `{ source }` — on every Book Now CTA (`hero`, `nav`, `packages_single`, `packages_3pack`, `about`, `reverse`), called from `useCalendly.js` alongside the existing GA4 `booking_cta_click`.
  - `Contact` with `{ method }` — on phone / email / Instagram / Facebook taps in the Reverse section.
- **Booking completions (`Schedule` / `CompleteRegistration`) are NOT fired from this site.** Sam has Calendly's native Meta integration wired on his end, so adding a completion event here would double-count. See also "Common pitfalls" below.
- Consent banner copy and `public/privacy.html` updated to disclose Meta as a third-party data recipient.
- Prerender verified clean: `grep -c -E "fbq|connect\.facebook|2845684255788584" dist/index.html` returns `0`.

**On-page SEO fixes**
- Footer anchor `href`s switched from `#` to real `#home` / `#packages` / etc.
- About section h2 changed from instructor name to "Meet Your Instructor" (descriptive heading), name demoted to h3.
- Packages payment copy aligned to FAQ + Reverse ("Pay securely at booking.").
- FAQ #7 cancellation policy populated with finalized wording (was originally truncated mid-sentence).

**Hosting (`vercel.json`)**
- `cleanUrls: true`, `trailingSlash: false`.
- Cache headers for `/assets/*` (1y immutable), images (30d), static SEO files (1h), root (5min + `X-Robots-Tag`).
- Note: host-level redirects intentionally NOT in `vercel.json` — Vercel's domain dashboard handles `www`↔apex (an earlier `vercel.json` redirect rule clashed with that and produced a redirect loop; lesson learned).

**External / user-side**
- Domain `clutchacademy.ca` registered + live on Vercel.
- Google Business Profile approved and **linked to the website** via the `sameAs` JSON-LD entry (`https://maps.app.goo.gl/Ubte7wrVTArPyqM29`).
- Google Search Console: domain property verified (auto-via GoDaddy), `sitemap.xml` submitted, status `Success`.
- Bing Webmaster Tools: imported from GSC, sitemap synced, homepage `Request indexing` clicked.

**Cache-bust convention**
- OG image URL referenced from meta tags includes a `?v=N` query param. Bump the integer whenever `og-image.png` changes so Facebook / Slack / opengraph.xyz / Vercel's OG tab re-fetch instead of serving their cached copy. Currently at `?v=2`.
- Same convention applies to the favicon set in `index.html` and `public/privacy.html` — every `favicon.svg` / `favicon-32.png` / `favicon-48.png` / `apple-touch-icon.png` reference carries `?v=N`. SVG is currently `?v=3` (bumped once after a visual tweak); PNGs are at `?v=2`. Bump the integer next to any file whose bytes change so returning visitors don't keep serving the cached version.

### ✅ Shipped 2026-05-13 (this session)

**Analytics & local-business linkage**
- GA4 Measurement ID `G-5E5GEN5N59` wired into both the inline `gtag('config', …)` call and the `googletagmanager.com/gtag/js?id=…` script src in `index.html`. The placeholder `G-XXXXXXXXXX` is gone; data flows after the user grants consent on the banner. Verify in **GA4 → Reports → Realtime**.
- Google Business Profile listing URL (`https://maps.app.goo.gl/Ubte7wrVTArPyqM29`) appended to the DrivingSchool JSON-LD `sameAs` array. This is the canonical "this website is that GBP listing" signal for Google's index and AI assistants. After the deploy, Google Search Console URL Inspection was used to **Request Indexing** so the new `sameAs` is picked up on the next crawl.

**Visual identity polish — favicon refresh**
- Replaced `public/favicon.svg` with the new disc-and-bracket logomark (red circle with C+brackets cut out via `fill-rule: evenodd`). A white quadrilateral backing path was later added behind the disc so the cutouts render correctly regardless of where the SVG is composited (browser tab, iOS home screen).
- Added `public/favicon-32.png` and `public/favicon-48.png` for legacy browsers and Google's search-result icon. New `<link rel="icon">` entries wired into both `index.html` and `public/privacy.html`.
- Regenerated `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` on a **white background** (previously red — the new logomark is red, so red-on-red wouldn't read).
- Refactored `scripts/generate-images.mjs` to support two source SVGs and two backgrounds: `logo2.svg` → OG image (red BG, unchanged); `favicon.svg` → icon set (white BG). One script, two output groups.

**Performance — WebP for hero + headshot**
- `public/hero-section.webp` (336 KB, **38% smaller** than the 541 KB JPEG) and `public/headshot.webp` (885 KB, **32% smaller** than the 1.3 MB JPEG) committed.
- `Home.jsx` and `About.jsx` `<img>` tags wrapped in `<picture>` with WebP `<source>` first and the original JPEG retained as the fallback `<img>`. CSS classes stay on the inner img so layout/blend-mode are unchanged. Modern browsers serve WebP; older browsers fall back transparently.

**Contact email**
- Switched the public-facing contact email from `samuel.anthony@clutchacademy.ca` to `hello@clutchacademy.ca` across all surfaces: Reverse contact card, Footer, DrivingSchool JSON-LD `email` field, `public/llms.txt`, and `public/privacy.html` (two locations). Keeps the structured data, AI-readable summary, and visible contact UI all in sync.
- **Confirm before relying on this:** `hello@clutchacademy.ca` must exist as a deliverable mailbox/alias at the email provider (Google Workspace / GoDaddy mail / wherever the domain email is hosted). Without that alias, clicking a `mailto:` link will bounce.

---

### 📎 Open

Grouped by who/what is blocking. Anyone unblocking an item should follow the linked steps and tick it off here.

#### Blocked on Sam's partner (shared Google account / GBP)

1. **(Future) Wire `aggregateRating` JSON-LD** once GBP has accumulated real reviews. Cite GBP as the source — never hand-write the count or score.

#### Blocked on Sam (Meta Pixel / ad launch)

These were surfaced 2026-05-12 when Sam sent the Pixel ID `2845684255788584` and asked for integration before launching Meta ads. The browser-side integration is shipped; the items below need Sam's input or confirmation.

a. **Confirm Pixel is firing in Meta Events Manager.** After the next deploy, open Events Manager → Test Events for dataset `2845684255788584`, paste the live URL, click around the site (Book Now CTA + a contact link), and confirm `PageView`, `Lead`, and `Contact` show up within seconds. If they don't, check whether consent was actually accepted (the banner appears once per browser; `localStorage.removeItem('clutch.consent.v1')` resets it).

b. **Conversions API (CAPI) — does Sam want it?** Current setup is browser-only via the Pixel. CAPI is server-side, survives ad-blockers and iOS tracking restrictions, and Meta's own guidance recommends dual browser+CAPI. Not required to launch ads, but it's a known quality signal in Meta's ad optimization. Adding it later requires either: (i) a small serverless endpoint that proxies events to Meta's Graph API, or (ii) a connector service (Stape, Zapier, etc.). Decision is Sam's — implementation effort is ~half a day either way.

c. **Confirm Sam's Calendly→Meta integration uses the same Pixel ID.** If Calendly is configured to fire `Schedule` against a *different* dataset/Pixel than `2845684255788584`, his ad-optimization signal will be split across two assets. Have him open Calendly → Integrations → Meta Pixel and verify the ID matches. (This is also why the site code does NOT fire `Schedule` — see "Common pitfalls".)

d. **Does Sam want a `ViewContent` event on the Packages section?** Standard for e-commerce-style ads; tells Meta which visitors actually saw pricing. Cheap to add (an IntersectionObserver in `Packages.jsx` calling a `trackViewContent` helper). Useful if he plans to run "viewed pricing but didn't book" retargeting audiences. Defer until he asks.

e. **Does Sam want a custom audience for retargeting set up in Ads Manager?** Once Pixel data starts flowing, Sam can create audiences like "visited site in last 30 days" or "clicked Book Now but didn't complete booking." That's a Meta Ads Manager task, not a code task — but worth flagging during the FaceTime so he sets it up before launching ads, not after.

#### Visual identity polish

2. **(Optional) Add a `favicon.ico` legacy fallback.** The SVG + 32/48 PNG variants are shipped, which covers all modern browsers and Google's search-result icon. A `favicon.ico` is only needed for older IE-era browsers — almost no real-world impact today. If you want one anyway, ImageMagick (`convert favicon-32.png favicon-48.png favicon.ico`) generates a multi-resolution ICO; then add `<link rel="alternate icon" href="/favicon.ico" />` to `index.html` and `public/privacy.html`.

#### User review

3. **Privacy policy review (`public/privacy.html`).** I drafted a sensible default covering data collection, third parties (Calendly, GA4, Vercel), cookies, your-rights section, and contact. Read it through; tweak wording to match how you actually handle data.

#### Future / opportunistic

4. **Auto-bump cache-bust `?v=` in `generate-images.mjs`.** Right now you have to manually bump the version param in `index.html` and `public/privacy.html` whenever you regenerate the OG image or any icon. The generator script could read each current `v=N`, increment it, and write it back automatically. ~15 lines of code; do it next time you iterate.
5. **Watch GSC + Bing for first indexing.** Within 1–2 weeks of the sitemap submission, check Search Console → Indexing → Pages and Bing Webmaster → URL Inspection. Should report "indexed" / "URL can appear on Bing" once their crawlers process the homepage.
6. **Local pack monitoring.** ~2 weeks after GBP went live, search "manual driving lessons toronto" from a Toronto-area incognito window. Clutch's GBP card should appear in the local-3-pack on the SERP. If it isn't appearing, check GBP for category accuracy and service-area definition.
7. **AI-citation testing.** Periodically ask ChatGPT, Claude, Perplexity, and Google Gemini "where can I learn manual transmission in Toronto?" — Clutch should appear in answers within a few weeks of each crawler's index refresh.

---

## TL;DR — what shipped and why it matters

The site is a **single-page React + Vite app** that runs entirely in the browser. Without intervention, every crawler that doesn't execute JavaScript would fetch the page and see an empty `<div id="root"></div>` — and that's most AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Bytespider, etc.) plus a meaningful share of social-share scrapers and traditional indexers.

To fix that we added a **build-time pre-render**: after Vite finishes building, a small Puppeteer script opens the production bundle in a headless browser, captures the fully-rendered HTML, and writes it back over `dist/index.html`. Crawlers now fetch real content; users still get the full client-side experience because React hydrates over the static markup.

On top of that base, the site now has:
- A complete `<head>` (description, canonical, Open Graph, Twitter card, robots, theme-color, manifest, apple-touch-icon).
- Two `application/ld+json` blocks: a `DrivingSchool` graph and an `FAQPage`. Search engines and AI assistants use these to extract structured facts (price, service area, contact, FAQ answers).
- `robots.txt` that explicitly allows the major AI crawlers (per business decision: maximum discoverability).
- `sitemap.xml` and `llms.txt`.
- A GA4 + Consent Mode v2 setup that defaults to deny and only fires analytics after the user clicks Accept on the in-page consent banner.
- A `vercel.json` for canonical-domain redirects and cache headers.

The single highest-leverage change is the pre-render. Everything else is either feeding structured data into the pre-rendered HTML or housekeeping around it.

---

## File map

```
index.html                       <- Source HTML template (head/meta/JSON-LD/gtag)
vercel.json                      <- Vercel config: redirects, cache headers
package.json                     <- "build" runs vite + the prerender script
scripts/
  prerender.mjs                  <- Post-build pre-render + FAQPage injection
public/
  robots.txt                     <- Crawler policy (allow all incl. AI bots)
  sitemap.xml                    <- Sitemap (single URL)
  llms.txt                       <- Mintlify-style summary for LLM crawlers
  site.webmanifest               <- PWA manifest
  privacy.html                   <- Static privacy policy
  logo2.svg                      <- Wide wordmark — source for og-image.png
  favicon.svg                    <- Square logomark — source for icon set
  og-image.png                   <- Generated by scripts/generate-images.mjs
  apple-touch-icon.png           <- Generated (icon on white BG, iOS)
  icon-192.png, icon-512.png     <- Generated (PWA manifest icons)
  favicon-32.png, favicon-48.png <- Generated (browser tab + Google search)
  hero-section.jpeg + .webp      <- Home hero, served via <picture>
  headshot.jpeg + .webp          <- About headshot, served via <picture>
src/
  main.jsx                       <- Gates GSAP behind window.__PRERENDER__
  components/
    GearSection.jsx              <- Same gate inside useGSAP
    ConsentBanner.jsx + .css     <- GA4 consent UI
    sections/Reviews.jsx         <- Same gate around the rAF marquee
    sections/Faq.jsx             <- Source-of-truth FAQS array (drives FAQPage JSON-LD)
  hooks/
    useCalendly.js               <- Lazy-loads Calendly; fires booking_cta_click (GA4) + Lead (Meta)
  lib/
    metaPixel.js                 <- Loads fbevents.js on consent + trackLead/trackContact helpers
docs/
  seo.md                         <- This file
  spec/                          <- Original build specification (mostly historical now)
```

---

## How the pre-render works

The pipeline is one extra command tacked onto `vite build`:

```
npm run build
  └── vite build              produces dist/ (CSR shell)
  └── node scripts/prerender.mjs
        ├── parses src/components/sections/Faq.jsx FAQS array
        ├── builds FAQPage JSON-LD
        ├── spawns `vite preview` on :4173
        ├── launches headless Puppeteer
        ├── sets window.__PRERENDER__ = true via evaluateOnNewDocument
        ├── navigates to / and captures document.documentElement.outerHTML
        ├── splices the FAQPage JSON-LD into the <!-- FAQPAGE_LD --> marker
        └── overwrites dist/index.html
```

**Why `window.__PRERENDER__`.** Several runtime systems would corrupt the snapshot if they ran:
- GSAP injects inline `style` and `data-*` attributes on every animated element. Capturing those would freeze the animation in mid-state and cause hydration mismatches in real-user sessions.
- The Reviews marquee runs a `requestAnimationFrame` loop that mutates `scrollLeft` — captured at the wrong moment, the first card would render off-screen.
- The consent banner is post-mount UI; it shouldn't be in the snapshot.

So `main.jsx`, `GearSection.jsx`, `Reviews.jsx`, and `ConsentBanner.jsx` all check `window.__PRERENDER__` and bail out. Production users never see this flag (it's only set by Puppeteer).

**The FAQ build-fails-on-bad-copy guard.** `prerender.mjs` reads the FAQS array, validates each answer ends with terminal punctuation, and aborts the build if not. The first time it ran it caught FAQ #7's truncated cancellation answer (`"…will be charged in "`). To add an FAQ: edit `Faq.jsx`'s FAQS array, run `npm run build`. The structured data updates automatically — there is no second source of truth to maintain.

---

## What every meta tag in `index.html` does

| Tag | Purpose |
|---|---|
| `<html lang="en-CA">` | Tells assistive tech and search engines the page is Canadian English. Pairs with `og:locale=en_CA`. |
| `<title>` | Browser tab + Google's blue link. Keep under ~60 chars. |
| `<meta name="description">` | Google's snippet text under the link. Keep under ~155 chars. |
| `<link rel="canonical">` | Tells search engines `https://clutchacademy.ca/` is the authoritative URL — eliminates duplicate-content risk if the page is reachable via `www.`, `.com`, query strings, etc. |
| `<meta name="robots">` | `index, follow, max-image-preview:large` — opt into Google's largest image preview format. |
| `<meta name="theme-color">` | Mobile browser chrome tint. |
| `og:*` (OpenGraph) | What Facebook, LinkedIn, iMessage, Slack, and Discord scrape for link previews. |
| `twitter:card=summary_large_image` | Big-image card on X/Twitter previews. |
| `<link rel="apple-touch-icon">` | Icon when an iOS user adds the site to their home screen. |
| `<link rel="manifest">` | Pointer to `/site.webmanifest` for Android home-screen install. |
| `<!-- FAQPAGE_LD -->` | **Don't delete this comment.** The prerender script splices the FAQPage JSON-LD here. Without it, the build fails. |

---

## JSON-LD: what we publish and why

Google, Bing, and AI assistants extract facts from `application/ld+json` blocks far more reliably than from prose. We publish two:

### 1. The DrivingSchool graph (in `index.html`)

```
@graph:
  - DrivingSchool   @id .../#business
      name, url, description, telephone, email
      priceRange "$$"
      areaServed: City "Toronto" in "Ontario, Canada"
      sameAs: [Instagram, Facebook]
      makesOffer: [@offer-single, @offer-3pack]
      employee: [@instructor-sam]
  - Offer           @id .../#offer-single   ($90 CAD)
  - Offer           @id .../#offer-3pack    ($240 CAD)
  - Person          @id .../#instructor-sam (Sam Anthony)
```

All four entities are linked by `@id`, so a search engine can walk from "this driving school" → "Sam works there" → "and offers these two packages" without ambiguity.

**What is intentionally missing:** `Review` and `aggregateRating`. Google's structured-data guidance (updated 2019) explicitly disallows self-attested testimonials marked up as `Review` on a business's own page. They will issue a manual action. We will add `aggregateRating` only after the Google Business Profile has accumulated real reviews and we can cite GBP as the source.

### 2. FAQPage (generated by `prerender.mjs`)

This block is built from the `FAQS` array in `Faq.jsx` at every build. Maintain the on-page copy, get the schema for free. When Google parses it, the FAQ can appear directly in search results as an expandable list of questions.

---

## robots.txt and AI-bot policy

Per the business decision locked at planning time — maximum discoverability, including in AI assistants — `robots.txt` allows everything by default and then explicitly names the AI crawlers that often respect explicit allow:

```
User-agent: *           # Everyone
Allow: /

User-agent: GPTBot      # OpenAI training corpus
User-agent: ChatGPT-User    # ChatGPT live retrieval
User-agent: OAI-SearchBot   # ChatGPT Search
User-agent: ClaudeBot   # Anthropic
User-agent: anthropic-ai
User-agent: Claude-Web
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended # Google AI Overviews + Gemini training
User-agent: Applebot-Extended # Apple Intelligence
User-agent: CCBot       # Common Crawl
User-agent: Bytespider  # ByteDance / Doubao
User-agent: Amazonbot
User-agent: Meta-ExternalAgent
User-agent: cohere-ai

Sitemap: https://clutchacademy.ca/sitemap.xml
```

If you ever want to opt out of AI training while keeping AI search retrieval, change those `Allow: /` lines to `Disallow: /` for the **training** bots only (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `Bytespider`, `cohere-ai`, `anthropic-ai`) and keep the search/retrieval ones (`ChatGPT-User`, `OAI-SearchBot`, `Perplexity-User`, etc.) allowed.

---

## llms.txt

`public/llms.txt` is a Mintlify-style markdown summary of the business. It's an emerging convention — not yet honored by every AI crawler, but cheap to provide and increasingly read by retrieval-augmented assistants. Update this file whenever the **factual** content of the site changes (price, service area, contact, requirements). The on-page FAQ and JSON-LD don't replace it; LLM crawlers seem to prefer the markdown form for short business summaries.

---

## GA4 + consent banner

The setup uses Google's Consent Mode v2 with a hard default-deny:

1. `index.html` declares all storage categories denied before any tag fires.
2. The `gtag.js` library is loaded async.
3. `ConsentBanner.jsx` shows on first visit if no decision is stored.
4. Accept → `localStorage.setItem('clutch.consent.v1', 'granted')` + `gtag('consent', 'update', { analytics_storage: 'granted' })`. Queued events flush.
5. Decline → stored as `'denied'`. GA never fires.
6. On subsequent visits, the inline `<script>` reads localStorage **before** the gtag config call so consent is restored without a banner re-prompt.

The Measurement ID is `G-5E5GEN5N59` (wired in two places in `index.html`: the inline `gtag('config', …)` call and the `googletagmanager.com/gtag/js?id=…` script src).

We track one custom event: `booking_cta_click` with a `source` parameter (`hero` / `nav` / `packages_single` / `packages_3pack` / `about` / `reverse`), fired from `useCalendly.js`. Watch which CTA converts best in GA4 → Explore.

---

## Meta Pixel + conversion tracking

Sam runs Meta (Facebook + Instagram) ads to drive bookings. To measure performance and optimize delivery, the site fires a small set of standard Meta events. The Pixel ID is `2845684255788584` (hardcoded in `src/lib/metaPixel.js` — change there if it ever rotates).

### Architecture: consent-gated lazy load

Unlike GA4 (which uses Consent Mode v2 and loads `gtag.js` unconditionally, suppressing data until consent), the Meta Pixel is **not loaded at all** until the user grants consent. This is the strictest interpretation of consent gating and the cleanest match for PIPEDA / GDPR:

1. `src/lib/metaPixel.js` exports `loadPixel()`, `trackLead(source)`, and `trackContact(method)`.
2. On app boot in `src/main.jsx`, if `localStorage['clutch.consent.v1'] === 'granted'` (returning visitor), `loadPixel()` fires immediately.
3. On first-time accept in `src/components/ConsentBanner.jsx`, the same `loadPixel()` runs.
4. `loadPixel()` is idempotent (guards on a module-level `loaded` flag and on `window.fbq?.loaded`) and short-circuits during the build-time prerender (`window.__PRERENDER__`). It defines the standard `fbq` queue, injects `https://connect.facebook.net/en_US/fbevents.js`, then fires `fbq('init', PIXEL_ID)` + `fbq('track', 'PageView')`.
5. The track helpers (`trackLead`, `trackContact`) guard with `typeof window.fbq !== 'function'` so they no-op silently before consent.

The prerender output `dist/index.html` contains **zero** Meta Pixel artifacts — verified with `grep -c -E "fbq|connect\.facebook|2845684255788584" dist/index.html` returning `0`.

### Events fired from this site

| Event | Where it fires | Params |
|---|---|---|
| `PageView` | Once, after consent — inside `loadPixel()` | — |
| `Lead` | `useCalendly.js` → `openCalendly(source)` — every Book Now CTA click that opens Calendly | `{ source: "hero" \| "nav" \| "packages_single" \| "packages_3pack" \| "about" \| "reverse" }` |
| `Contact` | `Reverse.jsx` — click on phone / email / Instagram / Facebook contact links | `{ method: "phone" \| "email" \| "instagram" \| "facebook" }` |

### Events NOT fired from this site

- **`Schedule` / `CompleteRegistration` (completed booking).** Sam has Calendly's native Meta integration configured on his end, so it fires booking-completion events to the same dataset. Firing one here too would double-count. See the FaceTime open item `c.` above — if Sam ever turns off the Calendly-side integration, we'd need to listen to Calendly's `event_scheduled` postMessage and fire it from `useCalendly.js`.
- **`ViewContent` (saw pricing).** Cheap to add via IntersectionObserver on the Packages section, but not requested. Tracked as FaceTime open item `d.`.
- **Server-side events via CAPI.** Browser-only setup. CAPI would survive ad-blockers + iOS tracking restrictions but needs a small backend. Tracked as FaceTime open item `b.`.

### How this differs from GA4

| | GA4 | Meta Pixel |
|---|---|---|
| Loaded when? | Library loads on every page; Consent Mode suppresses data | Library not loaded at all until consent |
| Used for | Site analytics | Ad performance + audience building |
| Custom event | `booking_cta_click` | `Lead`, `Contact` |
| ID | `G-5E5GEN5N59` (2 places in `index.html`) | `2845684255788584` (in `src/lib/metaPixel.js`) |
| Owns the account | Sam's partner (shared Google account) | Sam (Meta Business) |

### Adding new event firings

Pattern: import the helper, call it in the click/effect handler. Example for a hypothetical new "Watch demo video" event:

```js
import { trackEvent } from '../lib/metaPixel' // would need to export a generic helper

trackEvent('ViewContent', { content_name: 'demo_video' })
```

Currently only `trackLead` and `trackContact` are exported. If you need a generic `track`, export the internal `track` function from `metaPixel.js` — it's already implemented.

---

## Calendly: now lazy-loaded

Previously the Calendly widget script (~100 KB of third-party JS) and stylesheet loaded on every page visit, blocking the prerender and inflating critical-path payload. They now inject only on the first call to `openCalendly()`. The hook caches a load promise so subsequent calls reuse the same script tag, and there's a fallback that opens `calendly.com` in a new tab if the script fails (ad-blocker, network).

This means the first booking click has a small delay (one round-trip + script parse) before the popup opens. After that, instant. The trade-off is favorable: every visitor pays zero Calendly cost, only bookers pay it once.

---

## vercel.json

```
- cleanUrls: true              /privacy → /privacy.html automatically
- trailingSlash: false
- redirects:
    clutchacademy.com/*   → https://clutchacademy.ca/*  (301)
    www.clutchacademy.ca  → https://clutchacademy.ca/*  (301)
- headers:
    /assets/*              Cache-Control: public, max-age=31536000, immutable
    *.{webp,jpg,png,svg,woff2}  Cache-Control: public, max-age=2592000
    {robots,sitemap,llms,manifest}  Cache-Control: public, max-age=3600
    /                      Cache-Control: public, max-age=300, X-Robots-Tag: index, follow
```

The redirect rules will only fire if those alternate hosts are pointed at the Vercel project. If you don't own `.com` or never set up `www`, the rules are inert.

---

## Quick reference: where to change things

| You want to… | Edit |
|---|---|
| Update the page title | `index.html` `<title>` (and the matching `og:title` / `twitter:title`) |
| Update the meta description | `index.html` description meta + matching `og:description` / `twitter:description` |
| Add or edit an FAQ | `src/components/sections/Faq.jsx` FAQS array. JSON-LD updates on next build. |
| Change a price | The visible copy in `Packages.jsx` **and** the `price` field in the Offer JSON-LD in `index.html`. These are not yet linked. |
| Update the LLM business summary | `public/llms.txt` |
| Change AI-bot policy | `public/robots.txt` |
| Change the GA4 measurement ID | `index.html` — `G-5E5GEN5N59` appears in two locations (the inline `gtag('config', ...)` call and the script `src=`) |
| Update the Meta Pixel ID | `src/lib/metaPixel.js` — `PIXEL_ID` constant. Single source of truth. |
| Add a new Meta Pixel event | Import a helper from `src/lib/metaPixel.js` in the calling component. Add a new exported wrapper there if it's a standard event used in multiple places. |
| Add Search Console verification | Uncomment the meta line at `index.html:15-16` and paste the GSC token |
| Change the canonical domain | Six places in `index.html` (canonical link, og:url, og:image, twitter:image, JSON-LD URLs) **and** `public/sitemap.xml`, `public/llms.txt`, `vercel.json`, `public/privacy.html`. Use a search-and-replace. |
| Change cache or redirect rules | `vercel.json` |
| Update the privacy policy | `public/privacy.html` |
| Change the contact email | 5 places (search-and-replace): `src/components/Footer.jsx`, `src/components/sections/Reverse.jsx`, the DrivingSchool JSON-LD `email` in `index.html`, `public/llms.txt`, and `public/privacy.html`. Currently `hello@clutchacademy.ca`. |
| Regenerate the OG image or icon set | `npm run generate:images` (reads `public/logo2.svg` + `public/favicon.svg`, writes the PNGs). Bump the relevant `?v=N` cache-bust in `index.html` and `public/privacy.html` afterward. |
| Add/edit a `<picture>` source | `src/components/sections/Home.jsx` (hero) or `src/components/sections/About.jsx` (headshot). Keep the className on the inner `<img>` so CSS stays attached. |

---

## Verification commands

After every deploy, run these to confirm the SEO surface is intact:

```bash
# AI-crawler readability (should return non-zero)
curl -s -A "GPTBot" https://clutchacademy.ca/ | grep -c "manual transmission"
curl -s -A "ClaudeBot" https://clutchacademy.ca/ | grep -c "Frequently Asked Questions"
curl -s -A "PerplexityBot" https://clutchacademy.ca/ | grep -c "Samuel Anthony"

# Static SEO files reachable
curl -I https://clutchacademy.ca/robots.txt
curl -I https://clutchacademy.ca/sitemap.xml
curl -I https://clutchacademy.ca/llms.txt
curl -I https://clutchacademy.ca/site.webmanifest
curl -I https://clutchacademy.ca/privacy

# Both JSON-LD blocks present
curl -s https://clutchacademy.ca/ | grep -c "application/ld+json"   # expect 2

# Prerender output is Meta-Pixel-free (Pixel must only load at runtime, after consent)
curl -s https://clutchacademy.ca/ | grep -c -E "fbq|connect\.facebook|2845684255788584"  # expect 0

# Canonical redirects
curl -sI https://www.clutchacademy.ca/ | grep -i location            # expect 301 → apex
curl -sI https://clutchacademy.com/ | grep -i location               # expect 301 → .ca (if .com is owned + pointed)
```

Then in browsers:
- **Google Rich Results Test** — paste `https://clutchacademy.ca/`. Both DrivingSchool and FAQPage should be detected with no errors.
- **Facebook Sharing Debugger** — confirm the OG preview renders correctly. After uploading the OG image, click "Scrape Again" to clear the cache.
- **Twitter Card Validator** — same idea for X.
- **PageSpeed Insights / Lighthouse** — SEO score should be 100. Performance ≥ 85 mobile.
- **Google Search Console → URL Inspection** — once verified, paste the homepage URL. Expect "URL is on Google" within 1–2 weeks.
- **Meta Events Manager → Test Events** (for dataset `2845684255788584`) — paste the live URL, accept the consent banner, click around the site. `PageView` fires immediately; `Lead` fires when you click any Book Now CTA; `Contact` fires when you tap a phone/email/social link in the Reverse section. **Note:** Test Events only shows events from sessions matching the test URL, so use the actual live origin (not localhost).
- **Meta Pixel Helper** (Chrome extension by Meta) — visit the live site as a normal user, accept consent, and confirm the extension badge shows the Pixel ID and recent events. Faster sanity check than opening Events Manager.

---

## What's still placeholder

See the **Status — what's done, what's open** section near the top of this doc. The `📎 Open` list there is the single source of truth for placeholders and TODOs; this section used to duplicate it and has been folded in to prevent drift.

When you ship a placeholder replacement (icon, copy, GA4 ID, etc.), run `npm run build` so the prerender re-snapshots and the JSON-LD re-emits.

---

## Common pitfalls

- **Don't delete `<!-- FAQPAGE_LD -->`** in `index.html`. The build fails without it.
- **Don't add Review schema without a verifiable third-party source.** Google considers self-attested testimonial markup spam.
- **Don't move GSAP plugin registration out of the `__PRERENDER__` gate.** The snapshot will capture inline transforms and hydration will mismatch.
- **Don't put the Calendly script back in `index.html`'s `<head>`.** It's lazy-loaded on purpose.
- **The `dist/index.html` is regenerated every build.** Never edit `dist/` directly — edit `index.html` (template) and re-build.
- **The prerender uses `@sparticuz/chromium` on Vercel, Puppeteer's bundled Chromium locally.** The split is gated on `process.env.VERCEL` inside `scripts/prerender.mjs`. If you change build provider, you may need to add another branch (Netlify, Railway, etc.) or unify on `@sparticuz/chromium` everywhere if the local dev machine can also run a Linux Chromium binary.
- **`vercel.json` has no `redirects` block on purpose.** A previous version had a `www → apex` redirect rule that fought Vercel's domain-dashboard auto-redirect (when the dashboard had `www` set as Primary, the two layers pointed at each other and produced an infinite loop). Use Vercel's domain dashboard for canonical-domain routing; do not re-add host redirects here.
- **OG image cache-bust pattern.** When you regenerate `public/og-image.png`, increment the `?v=N` query param everywhere it appears in `index.html` (currently three places: `og:image`, `twitter:image`, JSON-LD `image`). Without this, Facebook / Slack / iMessage / opengraph.xyz / Vercel's OG preview tab will all serve their old cached copy until their TTL expires (1–30 days).
- **Don't add a `Schedule` / `CompleteRegistration` event for completed Calendly bookings.** Sam wired up Calendly's native Meta integration on his end, so the booking-completion conversion is already firing from Calendly's side. Adding one from the site would double-count in Ads Manager and mis-train Meta's ad-optimization algorithm. If Sam ever turns off the Calendly-side integration, *then* add a `postMessage` listener for Calendly's `calendly.event_scheduled` message inside `useCalendly.js`.
- **Don't load `fbevents.js` unconditionally from `index.html`.** The Pixel is intentionally not loaded before consent — moving it to `<head>` breaks the consent gate and creates PIPEDA / GDPR exposure. The lazy-load pattern in `src/lib/metaPixel.js` is the supported pattern.
- **Don't change the Pixel ID without telling Sam.** It's hardcoded in `src/lib/metaPixel.js`. If it's wrong, Sam's ad data flows to a dataset he can't see — symptoms are "no events showing up in Events Manager" despite `fbq` running fine in the browser console. Mismatched Pixel ID is the #1 cause of "the Pixel doesn't work."
