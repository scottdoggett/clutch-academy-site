# Clutch Academy — Coding-Agent Prompt Playbook

Paste these into the coding agent **one at a time**, in order. Review the agent's output at each checkpoint before sending the next. Every prompt assumes the agent has read `CLAUDE.md`, `docs/spec/07-overhaul-build-plan.md`, and `docs/spec/08-overhaul-reference.md`. All work happens on the `overhaul` branch; `main` stays the live baseline.

Prompts map 1:1 to the build-plan phases. Some later prompts are blocked on open decisions (group-lesson options, per-person vs per-pair pricing, inclusions, testimonials) — those are flagged inline.

---

## Prompt 1 — Create the `overhaul` branch and commit the plan

```
Read CLAUDE.md and docs/spec/07-overhaul-build-plan.md before doing anything.

We're starting the multi-page overhaul. All of it happens on a dedicated branch.

1. Run `git status` and show me the result. Expect: modified CLAUDE.md, docs/spec/README.md, and docs/spec/01–06; new untracked docs/spec/07-overhaul-build-plan.md, docs/spec/08-overhaul-reference.md, docs/spec/coding-agent-prompts.md, and docs/spec/Clutch_Academy_Website_Revamp_Brief_July2026.pdf. There is ALSO a pre-existing, unrelated modification to src/components/sections/Packages.jsx.
2. Create and switch to a new branch named `overhaul`: `git checkout -b overhaul`. Do not commit anything to `main`.
3. Stage and commit ONLY the planning docs: CLAUDE.md, docs/spec/README.md, docs/spec/01-project-brief.md through docs/spec/06-design-system.md, docs/spec/07-overhaul-build-plan.md, docs/spec/08-overhaul-reference.md, docs/spec/coding-agent-prompts.md, and docs/spec/Clutch_Academy_Website_Revamp_Brief_July2026.pdf. Commit message:
   docs: plan multi-page Next.js overhaul (build plan, reference, spec reconciliation)
4. Do NOT include the Packages.jsx change in this commit. Show me `git diff src/components/sections/Packages.jsx` and ask what I want to do with it before touching it.
5. Confirm with `git branch --show-current`, `git log --oneline -1`, and `git status`.

Pause and report. Make no code changes yet.
```

---

## Prompt 2 — Next.js foundation & shared shell (Phase 2)

```
Read Phase 2 of docs/spec/07-overhaul-build-plan.md and §5–§6 of docs/spec/08-overhaul-reference.md.

On the `overhaul` branch, migrate the app shell from Vite to Next.js (App Router, React 19). Do NOT rebuild page content yet — this step is scaffolding only.

- Initialize the Next.js App Router project; remove Vite, scripts/prerender.mjs, and the Puppeteer devDependency.
- Port design tokens (src/styles/tokens.css), global styles, and buttons.css into the Next global stylesheet / root layout.
- Build the root layout with the shared shell: Nav, Footer, AnnouncementBanner, ConsentBanner.
  - While porting AnnouncementBanner, ADD the missing "Book Now" button/link (routes to the booking flow) and align copy to the brief (60→75 min, 25% more time, new pricing, "book before August 1 to lock in current pricing"). Keep the auto-hide-at-August-1 logic.
- Carry over integrations as client components / Next <Script> with the existing consent gate: Calendly (keep the iOS Safari mobile-host fix), GA4 + Consent Mode v2 (G-5E5GEN5N59), Meta Pixel (2845684255788584), TikTok Pixel, Google Ads (AW-18196514948), and the public/booked.html conversion redirect.
- Move public/ assets; set up next/image; move redirects (.com→.ca, www→apex) and cache headers from vercel.json into next.config.
- Remove GSAP, @gsap/react, GearSection, GearIndicator, and all window.__PRERENDER__ guards.

Acceptance: the Next app builds and a Vercel preview renders the shared shell; consent + analytics smoke-test passes; no GSAP remains. Keep the existing section components' copy available to port in later steps — don't delete their content.

Pause and report.
```

---

## Prompt 3 — Routing & navigation (Phase 3)

```
Read Phase 3 of docs/spec/07 and the route table in docs/spec/08 §1.

Create the full route structure (stub pages are fine — headings + placeholder; content comes in later prompts):
/  /about  /manual-driving-lessons  /lessons/individual  /lessons/manual-foundations  /lessons/manual-confidence  /lessons/group  /faq  /contact

- Rebuild Nav as real <Link>s (drop the gear numbers and scroll handlers). Rebuild Footer links. Add a 404 page.
- Wire a distinct Calendly `source` tag per page/CTA, extending the existing packages_* tags, so conversion attribution survives the split.

Acceptance: every route resolves; nav and footer link correctly; each page's booking CTA opens Calendly with the right source tag.

Pause and report.
```

---

## Prompt 4 — Homepage, conventional (Phase 4)

```
Read Phase 4 of docs/spec/07 and the Homepage spec in docs/spec/08 §2.

Rebuild `/` as a conventional scrolling page, reusing the existing section content (hero, reviews, how-it-works, package teasers, about teaser) as plain semantic blocks — no animation. Its job: introduce Clutch Academy, build trust, showcase reviews, introduce Sam, and route visitors to the dedicated package pages (don't explain every service inline). Link the package teasers to their routes.

Acceptance: homepage renders statically, is fully functional with no JS animation, and links out to each package page.

Pause and report.
```

---

## Prompt 5 — About page + trust sections (Phase 5a)

```
Read Phase 5 of docs/spec/07 and the About spec in docs/spec/08 §2 (voice guidance in docs/spec/01 and 03).

Rewrite `/about` as a personal story: why Clutch Academy was started; learning manual can feel intimidating; lessons are calm, patient, judgment-free; real Toronto roads; tailored to each student's pace; the goal is confidence, not just passing. Then add:
- "Why Students Choose Clutch Academy" — icon grid (6 items listed in 08 §2).
- "What Lessons Are Really Like" — common student fears and how each is overcome.
- "Why Learn Manual Driving" — use the copy supplied in the brief (08 §2 references it).

Acceptance: About page complete with all three new sections and internal links to package pages.

Pause and report.
```

---

## Prompt 6 — Lessons Overview hub (Phase 5b)

```
Read Phase 5 of docs/spec/07 and docs/spec/08 §1–§2, §4.

Build `/manual-driving-lessons` as the overview hub: frame the whole offering, summarize each of the four packages in a card, and link to each dedicated page. This is the primary internal-linking hub. Target keyword: "stick shift lessons Toronto" / "learn manual in Toronto".

Acceptance: hub page live and links to all four package pages.

Pause and report.
```

---

## Prompt 7 — Package / landing pages (Phase 6)

```
Read Phase 6 of docs/spec/07 and docs/spec/08 §2–§4. Build these FOUR pages, one at a time, pausing after each:

a) /lessons/individual — best for refreshers / a first introduction; who it's for; inclusions; FAQ subset; trust block; CTA.
b) /lessons/manual-foundations — the 3-lesson progression (L1 clutch control/bite point/starts-stops; L2 traffic/intersections/hill starts; L3 independent driving/smoother shifting); ideal for complete beginners.
c) /lessons/manual-confidence — the 5-lesson flagship (downtown, highway merging, rush-hour, advanced hill starts, parking, personalized coaching); position as premium.
d) /lessons/group — learn with a friend; supportive environment; the option(s) per the resolved group-lesson decision.

Each page: unique title/meta/keyword, current price, a ⭐ Rated 5.0 on Google trust block ("hundreds of successful lessons taught"), a relevant FAQ subset, and a booking CTA with its own source tag.

BLOCKED/PENDING: use placeholders where inputs aren't final — group-lesson option (1hr+2.5hr vs 2.5hr only), and inclusions for the Individual and Group pages. Flag each placeholder clearly; don't invent specifics.

Pause and report after each page.
```

---

## Prompt 8 — FAQ & Contact pages (Phase 7)

```
Read Phase 7 of docs/spec/07 and docs/spec/08 §2.

- /faq: dedicated page built from the existing 10-question FAQ array; generate FAQPage JSON-LD from that same array (via Next metadata) so on-page copy and structured data can't drift. Surface the most relevant Q&As on the matching package pages too.
- /contact: the contact-info card (phone, email, Instagram, Facebook); keep secure-payment and cancellation messaging here.

Acceptance: FAQ renders with valid structured data; contact details are correct and clickable.

Pause and report.
```

---

## Prompt 9 — Trust layer pass (Phase 8)

```
Read Phase 8 of docs/spec/07.

Sprinkle social proof across the site: ⭐ Rated 5.0 on Google + "hundreds of successful lessons taught" on every package page; student testimonials; secure-payment messaging; a clear cancellation policy; real photos; and the "most students arrive nervous…" reassurance.

BLOCKED/PENDING: testimonials and cancellation-policy wording aren't final — use clearly-marked placeholders. Do NOT invent reviews, and do NOT add Review/aggregateRating structured data.

Acceptance: every page carries at least one trust element.

Pause and report.
```

---

## Prompt 10 — SEO & metadata pass (Phase 9)

```
Read Phase 9 of docs/spec/07 and the SEO targets in docs/spec/08 §4.

- Per-route generateMetadata: unique title tag, meta description, canonical, and OG per page.
- Clean H1–H3 hierarchy per page; descriptive image alt text; internal linking between hub, packages, About, and FAQ.
- Multi-URL sitemap.xml; keep robots.txt and llms.txt; DrivingSchool/Offer/Person schema on the homepage.
- No Review/aggregateRating schema until Google Business Profile reviews can be legitimately cited.

Acceptance: each page has unique, accurate metadata; view-source shows full rendered content (SSG working); structured data validates.

Pause and report.
```

---

## Prompt 11 — Pricing switch to the new offering (Phase 10)

```
Read Phase 10 of docs/spec/07 and the pricing table in docs/spec/08 §3.

Make the NEW offering the steady state across every page, lesson description, FAQ duration reference, and Calendly description:
- 75-minute Individual Lesson — $109 + HST
- Manual Foundations Package (3 lessons) — $299 + HST
- Complete Manual Confidence Package (5 lessons) — $469 + HST
- Group Lesson (2.5 hours) — $219 + HST
All private lessons are 75 minutes (up from 60). If we launch before August 1, keep current pricing shown until July 31 with the banner active; after the switch the banner auto-retires.

BLOCKED/PENDING: confirm per-person vs per-pair group pricing before finalizing the group page.

Acceptance: pricing, durations, and package names are consistent everywhere; banner behavior matches launch timing.

Pause and report.
```

---

## Prompt 12 — Google Ads alignment (Phase 11)

```
Read Phase 11 of docs/spec/07.

- In code: verify Google Ads + GA4 conversion tracking fires on public/booked.html from every new route.
- Produce a mapping (page → recommended Ads final URL) so each Google Ads asset and sitelink points to its matching landing page, plus price assets from the new pricing. (The Ads-account changes themselves happen in the Google Ads UI, not the codebase — output the list I should apply there.)

Acceptance: conversions record correctly from each route; I have a clear page-to-sitelink mapping to apply in Google Ads.

Pause and report.
```

---

## Prompt 13 — QA, performance & launch (Phase 12)

```
Read Phase 12 of docs/spec/07.

Run the pre-launch checklist:
- Mobile-first testing including iOS Safari; Lighthouse performance/SEO/accessibility.
- Reduced-motion path; keyboard + screen-reader navigation and focus order.
- Crawlability: confirm static HTML content for non-JS crawlers on every route; canonicals and redirects correct; 404 works.
- Analytics + consent verified across routes; full link audit; content proofread against the brief.

When everything passes: merge `overhaul` into `main` and deploy. Show me the checklist results and the diff summary before merging.

Pause and report before the merge.
```
