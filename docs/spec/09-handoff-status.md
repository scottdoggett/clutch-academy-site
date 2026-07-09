# 09 — Handoff Status (read this first)

**Written:** July 9, 2026, at the end of the overhaul build sessions.
**Audience:** the next agent (or Scott) picking this repo up cold.
**Authority:** this file describes *where the build actually is*; `07` is the
plan, `08` is the reference. Where this file and older docs disagree about
current state, this file wins.

---

## 1. Where we are, in one paragraph

The Vite/GSAP single-page site has been fully rebuilt as a **Next.js 16 App
Router** multi-page site on the **`overhaul` branch**. All 9 routes carry real
content, analytics/consent are wired, Lighthouse scores 100 accessibility +
100 SEO on every route, and the pre-launch QA checklist (Phase 12) has run.
**The branch has NOT been merged to `main` and mostly NOT been pushed** — the
merge was deliberately paused for: a push + Vercel preview, a real-device iOS
Safari test, and client (Sam) sign-offs. `main` still holds the old live Vite
site. Old pricing is intentionally still displayed everywhere (the August 1
switch is Phase 10, not yet run).

## 2. Git state (as of handoff)

| Fact | Value |
|---|---|
| Working branch | `overhaul` |
| `origin/overhaul` | at `fe863f6` (Phase 2 only) — **10 local commits are unpushed** |
| `main` | pre-overhaul live Vite site; never touched during the rebuild |
| Working tree | one uncommitted change: `docs/spec/coding-agent-prompts.md` **deleted by Scott himself** — deliberately left out of every commit. Keep excluding it: `git add -A -- . ':!docs/spec/coding-agent-prompts.md'` |
| node_modules | **4,490 tracked node_modules files were untracked in `fe863f6`** (they predated .gitignore). Never re-add them. This is why the Phase 2 commit shows ~1.16M deletions |

Commits on `overhaul` beyond `main` (oldest → newest): docs/plan (`16a0fd8`,
`f634c31` — pre-session), Phase 2 migration (`fe863f6`), Phase 3 routes
(`0cfee2a`), Phase 4 homepage (`db8e531`), Phase 5 About (`0d6648a`), Phase 5
hub (`17baba9`), Phase 6a individual (`18bfbad`), Phases 6b–d (`61e40ed`),
Phase 7 FAQ+Contact (`0ed1e4b`), Phase 8 trust (`bd0abf2`), Phase 11 Ads doc
(`366bc93`), Phase 12 QA fixes (`193fe37`).

## 3. Phase-by-phase status (against `07-overhaul-build-plan.md`)

| Phase | Status | Notes |
|---|---|---|
| 0 Coordination | ⚠️ Partial | Docs updated, but the **❓ open decisions were never resolved** — group format, per-person/per-pair pricing, inclusions, cancellation wording, testimonials all still open (see §5) |
| 1 Pricing notice | ✅ Done | Banner live on old site pre-session; the missing **Book Now button was added during the Phase 2 port** (source tag `announcement`) |
| 2 Next.js foundation | ✅ Done | Next 16.2.10, React 19.2.5; Vite/GSAP/prerender/Puppeteer removed; fonts actually load now (see §6-flag) |
| 3 Routes & nav | ✅ Done | 9 routes, 404, footer = full sitemap, per-page source tags |
| 4 Homepage | ✅ Done | 5 sections, copy ported verbatim, marquee is progressive enhancement, next/image |
| 5 About + hub | ✅ Done | About origin-story paragraph is **drafted, PENDING Sam** (see §5) |
| 6 Package pages | ✅ Done | 4 landing pages; group options PENDING-flagged |
| 7 FAQ + Contact | ✅ Done | FAQPage JSON-LD generated from `src/lib/faqs.js` (single source) |
| 8 Trust layer | ✅ Done | Every route verified to carry trust elements |
| 9 SEO pass | ⚠️ Mostly done *implicitly* | Per-route metadata/canonicals/H1s were built with each page; sitemap.xml expanded to 9 URLs during Phase 12. **Not done:** deliberate keyword audit of titles/slugs before Ads point at them (08 says slugs are 🟡 recommended, not locked), and the **aggregateRating decision** (§5) |
| 10 Pricing switch | ❌ **Not run** | The Aug-1 flip. Full checklist in §7 — more surfaces than just the cards |
| 11 Ads alignment | ⚠️ Code side done | Conversion path verified from every route; `docs/google-ads-mapping.md` written. **Account-side work not done** and the **Ads conversion label is still empty** (§5) |
| 12 QA & launch | ⚠️ QA done, launch NOT | Checklist results in `193fe37` / §4. Merge + deploy deliberately paused (§8) |

## 4. What was verified in Phase 12 (so you don't re-verify blindly)

- Lighthouse (headless Chrome, local prod server): **acc 100 / SEO 100 / BP
  100 on all 9 routes**; homepage desktop perf 100 (LCP 1.6s, CLS 0). Mobile
  perf 61–70 under slow-4G emulation — throttling artifact, CLS 0 everywhere.
- Crawlability: every route serves full static HTML (725–2,181 words), correct
  h1 + canonical; junk URLs → custom noindexed 404.
- Host redirects (`www.` and `.com` variants → apex, 308) verified via Host
  header locally; also expected to exist at the Vercel domain level.
- Full internal link audit: every link on every page → 200.
- Consent Mode v2: deny-first default inline in `<body>` before gtag config on
  all routes; zero Meta/TikTok pixel URLs in served HTML (they load only on
  consent); `/booked` + `/privacy` rewrites work with query params preserved.
- booked.html: all 3 inline scripts syntax-checked; GA4 `purchase` + Meta
  `Purchase` + TikTok `CompletePayment` + dedup guard intact.
- WCAG AA contrast fixed site-wide (see §6 — `--chrome` token change).

**Not verified (couldn't be, from this machine):** real iOS Safari (the
Calendly mobile-host fix is intact in code but untested on device), the Vercel
preview build, and anything requiring the production domain.

## 5. ⚠️ Open flags needing a HUMAN decision (mostly Sam)

1. **Group lessons format after Aug 1** — brief text says 1-hour AND 2.5-hour;
   the new pricing lists ONLY 2.5-hour ($219). `/lessons/group` currently
   shows the live offering (1hr $90 / 2hr $180) with `❓ BLOCKED` comments.
   Phase 10 cannot finish the group page without this answer.
2. **Group pricing basis** — per person or per pair? All copy deliberately
   avoids claiming either. Ads price assets marked contingent on this too.
3. **`aggregateRating` in the homepage JSON-LD** — carried verbatim from the
   live site (5.0, 15 reviews) while `07`/`CLAUDE.md` say *no self-attested
   rating markup* (manual-action risk). It's status quo, not new — but someone
   must decide: keep (if defensible via the real GBP reviews) or remove.
4. **About origin story** — the "why Clutch Academy exists" paragraph on
   `/about` is *drafted from positioning*, not sourced from Sam. `PENDING`
   comment in `src/app/about/page.jsx`. Sam should confirm or personalize.
5. **Confidence-guarantee terms** — mentioned on `/lessons/manual-confidence`
   (it was already public on the live site) but the terms are still owed.
6. **Inclusions** for Individual and Group pages — current bullets are the
   live site's placeholders, PENDING Sam's final 3–5 bullets each.
7. **Cancellation-policy final wording** — current wording (live site's) is in
   `src/lib/faqs.js` (id `cancellation`); updating it there propagates to
   /faq, /contact, and all package-page subsets.
8. **Dedicated testimonials** — every quote on the site is a real Google
   review (never invent quotes). Sam may supply dedicated testimonials; the
   About trust section has the PENDING slot.
9. **Google Ads conversion label** — `GOOGLE_ADS_CONVERSION_LABEL = ''` in
   `public/booked.html` means **Ads conversions are a silent no-op** (GA4
   `purchase` works). Someone must create the conversion action in the Ads UI
   and paste the label. Steps in `docs/google-ads-mapping.md` §1.
10. **Fonts now actually render** — Plus Jakarta Sans + Inter were referenced
    but never loaded on the old site (system fallback rendered). next/font now
    loads them, so the new site *looks different*. Nobody has confirmed this
    with Sam; it's per the tokens' clear intent, but eyeball it on preview.

## 6. Things that will confuse you (repo quirks)

- **`src/components/sections/` is dead code kept on purpose.** The old
  gear-section components still import `gsap` and the deleted `GearSection` —
  they are unimported, excluded from the build, and exist only as copy
  reference (Packages.css still has legacy 0.6-alpha colors — irrelevant).
  Safe to delete once Phase 10 lands and nobody needs the old card copy.
- **`--chrome` token changed** `#D9D9D9` → `#E4E4E4` (Phase 12): the old value
  failed WCAG AA (4.18:1) on the brand red. Related pattern: **white-alpha or
  opacity-faded text on the saturated red fails AA** even when grey-blend math
  suggests otherwise — use solid `var(--cream)` for muted text on red.
- **Scott's hooks:** a config-protection hook blocks edits to
  `eslint.config.js` (the one legit change during migration was applied via
  shell per the hook's own escape clause); a GateGuard hook demands stated
  "facts" before the first Bash call of a session and before destructive
  commands. Don't fight them; just present the facts.
- **Old vs new pricing/naming coexist by design** until Aug 1: pages show
  NEW package names ("Manual Foundations", "Complete Manual Confidence") with
  CURRENT prices ($90/$240/$400, group $90/$180) — the banner explains the
  change. The homepage JSON-LD Offers still use OLD names+prices (verbatim
  carry-over; flips in Phase 10).
- **Calendly source tags** (GA4 `booking_cta_click.source`, also sent to
  Meta/TikTok): site-wide `nav`, `announcement`; homepage `hero`, `about`;
  pages `about_page`, `lessons_overview`, `packages_single`, `packages_3pack`,
  `packages_confidence_5pack`, `packages_group` (+ historical
  `packages_group_1hr` / `packages_group_2hr` on the group option cards),
  `faq`, `contact`. Historical tags were kept where the old data should stay
  comparable; `reverse` retired with the Reverse section.
- **FAQ single source:** `src/lib/faqs.js` renders /faq, generates its
  JSON-LD, feeds every package-page subset, and supplies /contact's
  cancellation copy. Never fork FAQ copy elsewhere.
- **The old prerender/PRERENDER world is gone.** If you see references to
  `window.__PRERENDER__` or `scripts/prerender.mjs` in docs 01–06, that's
  history.

## 7. Phase 10 checklist (the Aug 1 switch — every surface that must flip)

New offering: Individual **75 min · $109**; Foundations **$299**; Confidence
**$469**; Group **2.5 hr · $219** (format pending flag §5.1) — all + HST.

- [ ] `src/components/home/PackagesTeaser.jsx` — TEASERS prices/durations
- [ ] `src/app/manual-driving-lessons/page.jsx` — PACKAGES card prices
- [ ] All four `src/app/lessons/*/page.jsx` — hero price lines, savings notes
      ("save $30/$50" math changes: 3×$109=$327 vs $299; 5×$109=$545 vs $469),
      any "one hour"/"60 minute" copy → 75 minutes
- [ ] `/lessons/group` — apply the resolved format decision (§5.1/5.2)
- [ ] Homepage JSON-LD `SCHEMA_GRAPH` offers in `src/app/page.jsx` — names,
      descriptions, prices (and consider renaming offer @ids)
- [ ] `public/booked.html` — `priceForEvent()` map + `DEFAULT_VALUE` (90→109),
      and the keyword rules if Calendly event names change
- [ ] `public/llms.txt` — services list + remove the "effective Aug 1" note
- [ ] `src/lib/faqs.js` — any duration references (check `how-many` answer)
- [ ] `src/components/AnnouncementBanner.jsx` — auto-hides at the DEADLINE
      const (2026-08-01 EDT); verify, then the banner can be deleted in a
      later cleanup
- [ ] Calendly event descriptions (Sam's Calendly account, not the repo)
- [ ] Google Ads price assets go live (already drafted in
      `docs/google-ads-mapping.md` §4)
- [ ] `public/sitemap.xml` lastmod dates

Sequencing per `07` Phase 10: if launch happens **before** Aug 1, ship with
current pricing + banner (that's today's state); flip on Jul 31/Aug 1. If
launch slips **past** Aug 1, flip before merging.

## 8. Launch runbook (what "go live" actually takes from here)

1. `git push` the `overhaul` branch (10 unpushed commits).
2. **Check the Vercel dashboard**: framework preset must be Next.js (the
   project previously built Vite with `dist` output — a stale override will
   break the deploy). Confirm the preview URL builds.
3. On the preview: real iPhone Safari pass — Calendly popup (custom mobile
   host), consent banner accept/decline, banner Book Now, general layout.
4. Sam sign-offs: fonts (§5.10), About story (§5.4), the flags in §5 he can
   answer quickly.
5. Merge `overhaul` → `main`, deploy, verify production: redirects, /booked
   with a test booking, GA4 realtime, sitemap fetch in GSC.
6. Post-launch: apply `docs/google-ads-mapping.md` in the Ads UI (final URLs,
   sitelinks, conversion action + paste label into booked.html, price assets
   scheduled for Aug 1).

## 9. Timeline reality

- **Brief's target launch was July 20, 2026** — tight but reachable; the build
  is done, the remaining work is verification + sign-offs + account-side Ads.
- **Aug 1, 2026** is the only hard business date (pricing/duration change).
  The banner auto-hides then regardless of anything else. If nothing else
  happens, Phase 10 MUST still be executed on/around Aug 1 — otherwise the
  site shows expired prices with no banner explaining anything.
- GSC verification token and GBP are Sam-side dependencies (memory: Sam owns
  GSC + GBP off-site); the `verification` field in `src/app/layout.jsx`
  metadata is stubbed with a PENDING comment.

## 10. Where things live (fast map)

| Thing | Path |
|---|---|
| Root layout, metadata, consent/gtag bootstrap, fonts | `src/app/layout.jsx` |
| Homepage + business JSON-LD | `src/app/page.jsx` + `src/components/home/*` |
| Package pages | `src/app/lessons/*/page.jsx` + `src/components/lessons/*` |
| Hub / About / FAQ / Contact | `src/app/{manual-driving-lessons,about,faq,contact}/` |
| FAQ single source | `src/lib/faqs.js` |
| Consent key + pixels + Calendly | `src/lib/consent.js`, `src/lib/{metaPixel,tiktokPixel}.js`, `src/hooks/useCalendly.js` |
| Booking CTA (all of them) | `src/components/BookButton.jsx` |
| Conversion page | `public/booked.html` (static, self-contained) |
| Redirects / rewrites / headers | `next.config.mjs` (vercel.json is gone) |
| Design tokens | `src/styles/tokens.css` |
| Ads to-apply list | `docs/google-ads-mapping.md` |
| Grep for outstanding work | `grep -rn "PENDING\|BLOCKED" src/ public/` |
