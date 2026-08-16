# Clutch Academy — Overhaul Build Plan

> ✅ **BUILD STATUS (July 9, 2026)** — most of this plan has been executed on
> the `overhaul` branch. Per-phase: **0 partial** (open decisions unresolved),
> **1–8 done**, **9 mostly absorbed** into the page builds (sitemap expanded
> in Phase 12; keyword/slug lock + aggregateRating decision outstanding),
> **10 NOT run** (the Aug-1 switch — full checklist in `09` §7), **11 code
> side done** (account-side Ads work pending, see `docs/google-ads-mapping.md`),
> **12 QA done, merge/deploy deliberately paused** (runbook in `09` §8).
> Authoritative current-state doc: **`09-handoff-status.md`**.

**Status:** Supersedes the single-page assumptions in `01`–`06`. Where this file and the older spec files disagree, this file and the current code win.

This is the ordered development plan for rebuilding Clutch Academy from a single-page brochure into a conventional, SEO-focused, multi-page site. 

## Locked decisions (this overhaul)

- **Framework: migrate to Next.js (App Router).** The original Vite choice was correct for a single-page brochure with no routing, no SSR need, and no image-optimization need. The revamp inverts all three: SEO is now the primary goal, the site is multi-page, and image-heavy landing pages must be fast. Native routing, per-route metadata, static generation, and `next/image` are exactly what Next provides. This also **retires the custom Puppeteer prerender script** — static generation replaces it as a first-class feature.
- **Architecture: conventional multi-page.** Real routes and real navigation, not anchor scrolling.
- **Gear-shift animation: removed entirely.** Keep a *similar content structure* for the homepage (hero, reviews, how-it-works, package teasers, about teaser), but as a conventional scrolling page. Remove GSAP, `GearSection` pinning, the H-pattern gear metaphor, `GearIndicator`, and the `window.__PRERENDER__` animation guards. Nav becomes standard links.
- **Target offering is the new one** (75-minute lessons, new names, new prices — see `08-overhaul-reference.md`). The pre-August-1 announcement banner remains the mechanism that communicates the change and auto-retires at the deadline.

## How to read this plan

Phases run top to bottom. Steps within a phase are ordered. Each phase ends with a **Checkpoint** — pause and review before starting the next phase (matches the established atomic-step workflow). Content, pricing, routes, SEO targets, and the migration mapping referenced below all live in `08-overhaul-reference.md`.

Decision-state tags carried from the spec: ✅ decided · 🟡 recommended · ❓ open · 📎 pending asset.

---

## Phase 0 — Coordination & open decisions

Do this first so no one builds against stale guidance.

1. **Create and switch to the `overhaul` branch** — `git checkout -b overhaul`. All overhaul work happens here; `main` stays the live/stable baseline and receives the rebuild only once it's verified. Never commit overhaul changes directly to `main`.
2. Update `CLAUDE.md` and `docs/spec/README.md` to the new direction: multi-page, Next.js, no gear animation, payment collected at booking. Explicitly retire the now-false "non-negotiable" constraints (single-page, gear-shift is core, multi-page out of scope, Vite over Next, four pricing cards).
3. Resolve the ❓ open decisions the build depends on (full list in `08` → *Open decisions*). The blocking ones:
   - Group lessons: keep both 1-hour and 2.5-hour options, or a single 2.5-hour offering? (Brief text says "both"; new pricing lists only 2.5-hour.)
   - Group pricing: per-person or per-pair?
   - Package inclusions still marked `PENDING` for Individual and Group.
   - Cancellation-policy wording and any usable student testimonials.

**Checkpoint:** coordination docs reflect reality; open decisions are answered or explicitly deferred with placeholders.

---

## Phase 1 — Priority: ship the pricing & duration notice

The brief's highest-priority item. It is independent of the migration and should not wait for it.

1. Add a clear **"Book Now" button/link** to `AnnouncementBanner` (currently text-only — this is the one real gap vs. the brief).
2. Align banner copy to the approved message (60 → 75 min, 25% more time, new pricing, "book before August 1 to lock in current pricing").
3. Confirm the auto-hide-at-August-1 logic still fires and the "Book Now" target is the booking flow.

> **Sequencing note:** this can ship on the *current live site* immediately, in parallel with the Next.js rebuild below. It does not need the migration to land first.

**Checkpoint:** notice is live and visible site-wide with a working booking CTA.

---

## Phase 2 — Next.js foundation

Stand up the new app shell before moving any content.

1. Initialize the Next.js App Router project (React 19 compatible). Port `package.json` scripts; remove Vite, the prerender script, and Puppeteer.
2. Port design tokens (`tokens.css`), global styles, `buttons.css`, and fonts into the Next global stylesheet / layout.
3. Build the **root layout**: shared Nav, Footer, `AnnouncementBanner`, and `ConsentBanner`.
4. Carry over integrations as client components: the Calendly hook, GA4 + Consent Mode v2, Meta Pixel, TikTok Pixel, Google Ads tag, and the `booked.html` conversion redirect (see `08` → *Analytics carry-over* for IDs).
5. Move `public/` assets over; configure `next/image`; set redirects (`.com → .ca`, `www →` apex) and cache headers in `next.config` / Vercel.
6. Delete the GSAP dependency and the `window.__PRERENDER__` guards.

**Checkpoint:** an empty-but-wired Next site builds, deploys to Vercel, renders the shared shell, and passes consent/analytics smoke tests.

---

## Phase 3 — Routing & navigation

1. Create routes for the full sitemap (route table in `08`): `/`, `/about`, `/manual-driving-lessons`, `/lessons/individual`, `/lessons/manual-foundations`, `/lessons/manual-confidence`, `/lessons/group`, `/faq`, `/contact`.
2. Rebuild Nav as real links (drop gear numbers and scroll handlers); rebuild Footer links; add a 404 page.
3. Wire a distinct Calendly `source` tag per page/CTA so conversion attribution survives the split (extend the existing `packages_*` tags).

**Checkpoint:** every route resolves, nav/footer link correctly, booking CTAs open Calendly with the right source tag on each page.

---

## Phase 4 — Homepage (conventional, no animation)

1. Rebuild the homepage from the existing section content — hero, reviews, how-it-works, package teasers, about teaser — as a single conventional scrolling page.
2. Its job (per brief): introduce Clutch Academy, build trust, showcase reviews, introduce Sam, and **route visitors to the dedicated package pages** rather than explaining every service inline.
3. Remove all GSAP/`GearSection` wrappers; sections become plain semantic blocks.

**Checkpoint:** homepage renders statically, is fully functional with no JS animation, and links out to each package page.

---

## Phase 5 — Core content pages

1. **About** — rewrite as a personal story (why Clutch Academy exists; learning manual can feel intimidating; calm, patient, judgment-free; real Toronto roads; tailored pace; confidence over just "passing"). Add the **"Why Students Choose Clutch Academy"** icon grid and the **"What Lessons Are Really Like"** (common fears → how they're overcome) section, plus **"Why Learn Manual Driving"** (brief supplies this copy).
2. **Manual Driving Lessons (Overview)** — the hub page that frames the offering and links to all four package pages.

**Checkpoint:** About and Overview complete with the new trust sections and internal links to package pages.

---

## Phase 6 — Package / landing pages (SEO cornerstones)

Build one dedicated page each (content + per-page SEO targets in `08`):

1. **Individual Manual Lesson** — refreshers / first introduction; who it's for; FAQs; reviews; CTA.
2. **Manual Foundations Package (3 lessons)** — the three-lesson progression (clutch control → traffic/hill starts → independent driving); ideal for complete beginners.
3. **Complete Manual Confidence Package (5 lessons)** — downtown, highway merging, rush-hour, advanced hill starts, parking, personalized coaching; positioned as the **flagship**.
4. **Group Manual Lessons** — learn with a friend; supportive environment; explain the option(s) resolved in Phase 0.

Each page includes: who it's for, inclusions, current price, a trust block (⭐ Rated 5.0 on Google, hundreds of lessons taught), a relevant FAQ subset, and its own booking CTA with a unique source tag.

**Checkpoint:** all four landing pages live, each self-contained enough to serve as a Google Ads destination.

---

## Phase 7 — FAQ & Contact pages

1. **FAQ** — dedicated page built from the existing 10-question array; keep the FAQPage JSON-LD generated from that array (now via Next metadata/route, not the retired prerender script). Distribute the most relevant Q&As onto the matching package pages too.
2. **Contact** — the existing contact-info card (phone, email, Instagram, Facebook). Payment is collected securely at booking; keep secure-payment and cancellation messaging here.

**Checkpoint:** FAQ renders with valid structured data; contact details correct and clickable.

---

## Phase 8 — Trust layer

Sprinkle social proof everywhere (brief: "one thing I'd sprinkle everywhere is social proof"):

1. ⭐ Rated 5.0 on Google + "hundreds of successful lessons taught" on every package page.
2. Student testimonials (📎 pending real quotes), secure-payment messaging, clear cancellation policy, real photos, and the "most students arrive nervous…" reassurance.

**Checkpoint:** every page carries at least one trust element; no invented/self-attested review markup (see SEO rule below).

---

## Phase 9 — SEO & metadata pass

1. Per-route `generateMetadata`: unique title tag, meta description, canonical, and OG per page (targets in `08`).
2. Clean H1–H3 hierarchy per page; descriptive image alt text; internal linking between hub, packages, About, and FAQ.
3. Multi-URL `sitemap.xml`; keep `robots.txt` and `llms.txt`; DrivingSchool/Offer/Person schema on the homepage; page-appropriate schema elsewhere.
4. **No `Review`/`aggregateRating` schema** until Google Business Profile reviews can be legitimately cited — self-attested rating markup risks a manual action.

**Checkpoint:** each page has unique, accurate metadata; `view-source` shows full rendered content (SSG working); structured data validates.

---

## Phase 10 — Pricing switch

1. Ensure the new offering (75-minute lessons, new names, new prices) is the site's steady state across all pages, lesson descriptions, FAQ duration references, and Calendly descriptions.
2. If the rebuild ships *before* August 1, keep current pricing shown until July 31 with the banner active; if it ships after, the banner auto-retires and new pricing stands alone. (This is the only date the content genuinely depends on — the business, not the build schedule.)

**Checkpoint:** pricing, durations, and names are internally consistent everywhere; banner behavior matches launch timing.

---

## Phase 11 — Google Ads alignment

1. Point every Google Ads asset and **sitelink** to its matching landing page; add **price assets** from the new pricing.
2. Verify Google Ads + GA4 conversion tracking still fires on `booked.html` from each new route.

**Checkpoint:** ad destinations map 1:1 to landing pages; conversions record correctly.

---

## Phase 12 — QA, performance & launch

1. Mobile-first testing (iOS Safari included); Lighthouse performance/SEO/accessibility.
2. Reduced-motion path (now trivial with animation gone); keyboard/screen-reader nav and focus order.
3. Crawlability: confirm static HTML content for non-JS crawlers on every route; redirects and canonicals correct; 404 works.
4. Analytics/consent verification across routes; link audit; final content proofread against the brief.
5. Launch.

**Checkpoint:** all landing pages live, SEO architecture in place, trust/conversion elements throughout, tracking verified — the brief's Definition of Success.
