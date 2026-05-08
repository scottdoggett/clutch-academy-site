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
- Google Analytics 4 + Consent Mode v2 default-deny snippet (placeholder ID `G-XXXXXXXXXX`).
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
- Google Business Profile approved (managed by Sam's partner).
- Google Search Console: domain property verified (auto-via GoDaddy), `sitemap.xml` submitted, status `Success`.
- Bing Webmaster Tools: imported from GSC, sitemap synced, homepage `Request indexing` clicked.

**Cache-bust convention**
- OG image URL referenced from meta tags includes a `?v=N` query param. Bump the integer whenever `og-image.png` changes so Facebook / Slack / opengraph.xyz / Vercel's OG tab re-fetch instead of serving their cached copy. Currently at `?v=2`.

---

### 📎 Open

Grouped by who/what is blocking. Anyone unblocking an item should follow the linked steps and tick it off here.

#### Blocked on Sam's partner (shared Google account / GBP)

These are queued waiting for access to the Google account that owns the Google Business Profile.

1. **Create the GA4 property and share the Measurement ID.** Once you have `G-XXXXXXXXXX`, replace the two placeholder occurrences in `index.html` (one in the inline `gtag('config', …)` call, one in the async `<script src="https://www.googletagmanager.com/gtag/js?id=…">` URL). Commit and push. After deploy, click Accept on the consent banner and confirm yourself in **GA4 → Reports → Realtime**.
2. **Add the GBP listing URL to the DrivingSchool JSON-LD `sameAs` array.** Find the listing's canonical link (`https://g.page/r/…` or the long `https://maps.app.goo.gl/…` share URL) inside business.google.com and append it to the `sameAs` array in `index.html` (currently has IG + FB). This is the canonical "this website is that GBP listing" signal Google's index and AI assistants both look for.
3. **(Future) Wire `aggregateRating` JSON-LD** once GBP has accumulated real reviews. Cite GBP as the source — never hand-write the count or score.

#### Visual identity polish

4. **Refresh the favicon (browser tab + Google search result icon).**
   - **Where it shows:** the icon in the user's browser tab, the icon next to the site title in Google's search results, and the iOS Safari pinned-tab icon.
   - **Current state:** `public/favicon.svg` exists and is referenced from `index.html`'s `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`. It's the original asset and may not match the rest of the new icon set generated from `logo2.svg`.
   - **What to do:** replace `public/favicon.svg` with a square logomark on brand red (the bracket motif works at small sizes; the full wordmark doesn't). Then add a `favicon.ico` and a 32×32 PNG fallback for older browsers and Google's search-result icon (which, per Google's docs, prefers a 48px-multiple PNG/ICO). Recommended file set: `favicon.svg` (vector, primary), `favicon.ico` (legacy fallback), `favicon-32.png` (Google search), `favicon-48.png` (better resolution for some clients). Wire each into `index.html`:
     ```html
     <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
     <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
     <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
     <link rel="alternate icon" href="/favicon.ico" />
     ```
     Cache-bust with `?v=2` once if the file path stays the same.
   - **Re-using the existing pipeline:** `scripts/generate-images.mjs` can be extended with a square-only target that uses a tighter crop/different SVG source. Quickest path: ask the designer for a square logomark SVG (just the brackets, or a stylized "C"); drop it in as `favicon.svg`.
   - **Why it matters for SEO:** Google shows the favicon in mobile search results next to the site name. A clean, branded favicon increases click-through rate.

5. **WebP versions of hero + headshot for perf.**
   - Re-export `public/hero-section.jpeg` and `public/headshot.jpeg` as `.webp` (same dimensions, quality ~80). Drop in `public/`.
   - Update `Home.jsx` and `About.jsx` to use a `<picture>` element with the WebP source first, JPEG fallback. This is purely a Lighthouse Performance win — not strictly SEO, but Page Experience signals are part of Google's ranking now.

#### User review

6. **Privacy policy review (`public/privacy.html`).** I drafted a sensible default covering data collection, third parties (Calendly, GA4, Vercel), cookies, your-rights section, and contact. Read it through; tweak wording to match how you actually handle data.

#### Future / opportunistic

7. **Auto-bump OG `?v=` in `generate-images.mjs`.** Right now you have to manually bump the version param in `index.html` whenever you regenerate `og-image.png`. The generator script could read the current `v=N`, increment it, and write it back to `index.html` automatically. ~15 lines of code; do it next time you iterate the OG image.
8. **Watch GSC + Bing for first indexing.** Within 1–2 weeks of the sitemap submission, check Search Console → Indexing → Pages and Bing Webmaster → URL Inspection. Should report "indexed" / "URL can appear on Bing" once their crawlers process the homepage.
9. **Local pack monitoring.** ~2 weeks after GBP went live, search "manual driving lessons toronto" from a Toronto-area incognito window. Clutch's GBP card should appear in the local-3-pack on the SERP. If it isn't appearing, check GBP for category accuracy and service-area definition.
10. **AI-citation testing.** Periodically ask ChatGPT, Claude, Perplexity, and Google Gemini "where can I learn manual transmission in Toronto?" — Clutch should appear in answers within a few weeks of each crawler's index refresh.

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
  favicon.svg                    <- Existing
  apple-touch-icon.png           <- 📎 PENDING from designer
  icon-192.png, icon-512.png     <- 📎 PENDING from designer
  og-image.png                   <- 📎 PENDING from designer
  hero-section.webp              <- 📎 PENDING (perf, not strictly SEO)
  headshot.webp                  <- 📎 PENDING (perf, not strictly SEO)
src/
  main.jsx                       <- Gates GSAP behind window.__PRERENDER__
  components/
    GearSection.jsx              <- Same gate inside useGSAP
    ConsentBanner.jsx + .css     <- GA4 consent UI
    sections/Reviews.jsx         <- Same gate around the rAF marquee
    sections/Faq.jsx             <- Source-of-truth FAQS array (drives FAQPage JSON-LD)
  hooks/
    useCalendly.js               <- Lazy-loads Calendly + fires booking_cta_click
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

The measurement ID is currently the placeholder `G-XXXXXXXXXX`. Until you swap it in (two locations in `index.html`), gtag is a harmless no-op.

We track one custom event: `booking_cta_click` with a `source` parameter (`hero` / `nav` / `packages_single` / `packages_3pack` / `about` / `reverse`), fired from `useCalendly.js`. Once GA4 is live, you'll be able to see which CTA is converting best.

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
| Add the GA4 measurement ID | `index.html` — replace `G-XXXXXXXXXX` in two locations (the inline `gtag('config', ...)` call and the script `src=`) |
| Add Search Console verification | Uncomment the meta line at `index.html:15-16` and paste the GSC token |
| Change the canonical domain | Six places in `index.html` (canonical link, og:url, og:image, twitter:image, JSON-LD URLs) **and** `public/sitemap.xml`, `public/llms.txt`, `vercel.json`, `public/privacy.html`. Use a search-and-replace. |
| Change cache or redirect rules | `vercel.json` |
| Update the privacy policy | `public/privacy.html` |

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
