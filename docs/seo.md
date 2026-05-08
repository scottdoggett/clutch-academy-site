# SEO Reference — Clutch Academy

This doc explains how SEO is wired on this site, what every file does, where to make changes, and how to verify things. It's the operational manual for the implementation that landed in May 2026.

The decision-state symbols match the rest of `docs/spec/`: ✅ decided / shipped, 🟡 default that can change, 📎 waiting on an asset.

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

Things that exist as code/markup but reference content that is not yet final:

- **OG image** at `/og-image.png` — file does not exist yet. Social shares will currently show a broken-image preview.
- **Apple touch icon** at `/apple-touch-icon.png` — file does not exist. iOS home-screen adds will fall back to the SVG favicon.
- **Manifest icons** at `/icon-192.png`, `/icon-512.png` — same.
- **GA4 measurement ID** — `G-XXXXXXXXXX` placeholder in `index.html`.
- **Search Console verification token** — commented placeholder in `index.html`.
- **Bing Webmaster verification token** — same approach when you set it up.
- **FAQ #7 cancellation policy** — currently a safe fallback (`"please contact us directly to discuss options"`) marked with a `PENDING` comment. Replace with the real wording when finalized.
- **Privacy policy** — drafted at `public/privacy.html`. Review before relying on it.
- **Aggregate review rating** — intentionally absent from JSON-LD until Google Business Profile has reviews to cite.

When you ship a placeholder replacement, run `npm run build` so the prerender re-snapshots and the JSON-LD re-emits.

---

## Common pitfalls

- **Don't delete `<!-- FAQPAGE_LD -->`** in `index.html`. The build fails without it.
- **Don't add Review schema without a verifiable third-party source.** Google considers self-attested testimonial markup spam.
- **Don't move GSAP plugin registration out of the `__PRERENDER__` gate.** The snapshot will capture inline transforms and hydration will mismatch.
- **Don't put the Calendly script back in `index.html`'s `<head>`.** It's lazy-loaded on purpose.
- **The `dist/index.html` is regenerated every build.** Never edit `dist/` directly — edit `index.html` (template) and re-build.
- **The prerender requires Puppeteer's bundled Chromium.** If a CI/Vercel build environment can't download Chromium, the build will fail. Vercel's default build environment supports this; if you change build provider, verify.
