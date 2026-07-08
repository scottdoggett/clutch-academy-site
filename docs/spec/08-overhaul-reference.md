# Clutch Academy — Overhaul Reference

Companion to `07-overhaul-build-plan.md`. The build steps point here for the "what" (sitemap, content, pricing, SEO, migration, open decisions). Tags: ✅ decided · 🟡 recommended · ❓ open · 📎 pending asset.

---

## 1. Sitemap & routes

Nine pages. Slugs are 🟡 recommended — adjust for keyword fit before locking, since Ads/sitelinks will reference them.

| Route | Page | Primary keyword | Rebuilds from |
|---|---|---|---|
| `/` | Homepage | manual driving lessons Toronto | Home + Reviews + HowItWorks + Packages teaser + About teaser |
| `/about` | About | Sam Anthony · Clutch Academy story | `About.jsx` (rewritten) + new trust sections |
| `/manual-driving-lessons` | Lessons Overview (hub) | learn manual in Toronto / stick shift lessons Toronto | new |
| `/lessons/individual` | Individual Manual Lesson | manual driving refresher Toronto | Packages "single" card |
| `/lessons/manual-foundations` | Manual Foundations (3 lessons) | learn to drive manual Toronto (beginners) | Packages "3-pack" card |
| `/lessons/manual-confidence` | Complete Manual Confidence (5 lessons) | highway + city manual lessons Toronto | Packages "5-pack" card |
| `/lessons/group` | Group Manual Lessons | group manual driving lessons Toronto | Packages "group" cards |
| `/faq` | FAQ | manual driving lessons FAQ Toronto | `Faq.jsx` |
| `/contact` | Contact | contact Clutch Academy | `Reverse.jsx` contact card |

---

## 2. Per-page content specs

**Homepage** — clean and visually striking. Introduce Clutch Academy, build trust, showcase reviews, introduce Sam, and route visitors to the package pages. Do **not** explain every service in detail inline. CTA: Book Now + "See packages."

**About** — replace the current "what I do" copy with a personal story:
- Why Clutch Academy was started.
- Learning manual can feel intimidating; lessons are calm, patient, judgment-free.
- Real Toronto roads; tailored to each student's pace; goal is confidence, not just passing a lesson.
- **"Why Students Choose Clutch Academy"** icon grid: ✓ Calm, patient instruction · ✓ One-on-one lessons · ✓ Real Toronto roads · ✓ Learn at your own pace · ✓ Online booking & secure payment · ✓ Hundreds of successful lessons taught.
- **"What Lessons Are Really Like"** — common student fears and how each is overcome.
- **"Why Learn Manual Driving"** — brief supplies the copy (stick/standard = "just driving" in much of the world; still common globally; could save your life; more engaging; more car choices; makes you a better driver; "you'll look cool doing it").

**Lessons Overview (hub)** — frame the whole offering, summarize each package in a card, link to all four dedicated pages. Primary internal-linking hub.

**Individual Manual Lesson** — best for refreshers / a first introduction. Who it's for, inclusions (📎), FAQs, reviews, CTA.

**Manual Foundations Package (3 lessons)** — ideal for complete beginners:
- Lesson 1: clutch control, bite point, starts/stops.
- Lesson 2: traffic, intersections, hill starts.
- Lesson 3: independent driving, smoother shifting.

**Complete Manual Confidence Package (5 lessons)** — flagship / premium:
- Downtown driving · highway merging · rush-hour traffic · advanced hill starts · parking · personalized coaching.

**Group Manual Lessons** — learn alongside a friend; fun, supportive; explain the option(s) resolved in Phase 0 (❓ 1-hour + 2.5-hour, or 2.5-hour only).

**FAQ** — existing 10 questions: license required; never driven manual; manual vs stick vs standard; where lessons take place; how many lessons needed; what to wear; how to pay; cancellation policy; what car; gift purchase. Keep FAQPage JSON-LD generated from the array. Surface relevant subsets on package pages.

**Contact** — contact-info card (phone, email, Instagram, Facebook), secure-payment + cancellation messaging. ❓ info-card only vs. reinstating a form.

---

## 3. Pricing

Build to the **new** offering as steady state; keep old visible only if launching before August 1 (see Build Plan Phase 10).

| Package | Old — until Jul 31 | New — effective Aug 1 |
|---|---|---|
| Individual lesson | 60 min · $90 + HST | **75 min · $109 + HST** |
| Manual Foundations (3 lessons) | $240 + HST | **$299 + HST** |
| Complete Manual Confidence (5 lessons) | $400 + HST | **$469 + HST** |
| Group lesson | 2 hr · $180 + HST | **2.5 hr · $219 + HST** |

Notes / drift to reconcile:
- Current code shows **five** cards including a **1-hour group at $90** and names the 5-pack "Highway & City Confidence Drive." The brief renames packages ("Manual Foundations", "Complete Manual Confidence") and its new pricing lists **no 1-hour group** — reconcile in Phase 0.
- All prices are **+ HST**; keep that explicit on every price display.
- On August 1: update prices, durations (60 → 75 min private), lesson descriptions, FAQ duration references, and Calendly descriptions.

---

## 4. Per-page SEO targets

Each route gets a unique title tag, meta description, canonical, H1–H3 hierarchy, internal links, image alt text, and CTA. Keep the homepage title pattern already in use: `Manual Driving Lessons in Toronto | Clutch Academy`.

Keyword map (primary → supporting): homepage → *manual driving lessons Toronto*; overview → *stick shift lessons Toronto*, *learn manual in Toronto*; individual → *manual driving refresher*; foundations → *learn to drive manual (beginner)*; confidence → *highway lessons*, *hill starts*, *city driving*; group → *group / learn-with-a-friend manual lessons*.

Future content / blog seeds (from brief, not launch-blocking): Stick Shift Lessons Toronto · Learn Manual in Toronto · Manual Driving Refresher · Highway Lessons · Hill Starts · Driving Manual in Europe. (This is why Next + a future `/blog` is worth keeping in mind.)

Structured data: DrivingSchool / Offer / Person on the homepage; FAQPage from the FAQ array; **no Review/aggregateRating** until Google Business Profile reviews can be legitimately cited.

---

## 5. Analytics & integrations carry-over

Preserve all of these through the migration (re-wire as client components / Next `<Script>`):

- **GA4:** `G-5E5GEN5N59` (Consent Mode v2, default-deny; `ConsentBanner` grants).
- **Google Ads:** `AW-18196514948` (+ conversion on `booked.html`).
- **Meta Pixel:** `2845684255788584` (consent-gated).
- **TikTok Pixel:** ID in `src/lib/tiktokPixel.js` (consent-gated).
- **Calendly:** lazy-loaded popup; keep the iOS Safari mobile-host fix. Extend the per-CTA `source` tags (currently `hero`, `packages_single`, `packages_3pack`, `packages_group_1hr`, `packages_group_2hr`, `packages_confidence_5pack`, `about`, `reverse`, `nav`) to one per new landing page.
- **Booking confirmation:** `booked.html` Calendly-redirect conversion page.
- **Crawl/SEO surfaces:** `robots.txt`, `sitemap.xml` (expand to all routes), `llms.txt`, `site.webmanifest`, `privacy.html` (`/privacy`).

---

## 6. Vite → Next.js migration map

**Ports over with little change:** section component JSX + their CSS (minus animation), `tokens.css`, `buttons.css`, Nav/Footer markup, `ConsentBanner`, `AnnouncementBanner`, `useCalendly` logic, analytics libs, everything in `public/`, DrivingSchool/Offer/Person schema.

**Changes shape:**
- `main.jsx` + `index.html` → `app/layout.jsx` + the Metadata API.
- Anchor-scroll navigation → file-based routes + `<Link>`.
- `<head>` in `index.html` → root `metadata` + per-route `generateMetadata`.
- Manual WebP/JPEG fallback + `scripts/generate-images.mjs` → `next/image`.
- `vercel.json` redirects/headers → `next.config` (keep `.com → .ca`, `www →` apex, `/privacy`).

**Retired entirely:** GSAP + `@gsap/react`, `GearSection`, `GearIndicator`, the gear metaphor, `window.__PRERENDER__` guards, `scripts/prerender.mjs`, the Puppeteer devDep, and the unused hidden Netlify form stub in `index.html`.

---

## 7. Open decisions & pending assets

Resolve the ❓ items in Phase 0; 📎 items can land as placeholders and be filled before launch.

- ❓ Group lessons: 1-hour **and** 2.5-hour, or 2.5-hour only? (Brief text vs. new pricing conflict.)
- ❓ Group pricing: per-person or per-pair?
- ❓ Contact: info-card only, or reinstate a contact form?
- 📎 Inclusions for the Individual and Group pages (3–5 bullets each).
- 📎 The Confidence package "confidence guarantee" terms.
- 📎 Real student testimonials (needed for the trust layer; no invented quotes).
- 📎 Final cancellation-policy wording.
- 📎 Any still-pending brand assets (final logo variants, instructor/real lesson photos).
