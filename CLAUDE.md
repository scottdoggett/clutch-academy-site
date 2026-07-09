# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Clutch Academy Website

Manual transmission driving school in Toronto. The site has been **rebuilt** from a single-page React/Vite/GSAP brochure into a conventional, SEO-focused, multi-page site on **Next.js 16 (App Router, React 19)**. The rebuild lives on the **`overhaul` branch** and is **not yet merged or deployed** — `main` still holds the old live Vite site.

## ⚠️ Start here

1. **`docs/spec/09-handoff-status.md`** — where the build actually is: phase-by-phase status, git state, open flags, the Aug-1 checklist, and the launch runbook. **Read it before doing anything.**
2. `docs/spec/07-overhaul-build-plan.md` — the ordered plan (status block at top).
3. `docs/spec/08-overhaul-reference.md` — sitemap, per-page content, pricing, SEO targets, open decisions.
4. Spec files `01`–`06` are superseded for structure/stack/animation; use them only for durable intent (audience, positioning, voice, visual language).

Where docs disagree: `09` wins on *current state*, `07`/`08` win on *target direction*, older files lose.

## Current state (July 2026)

- **All 9 routes are built with real content**: `/`, `/about`, `/manual-driving-lessons` (hub), `/lessons/{individual,manual-foundations,manual-confidence,group}`, `/faq`, `/contact`, plus a custom 404.
- Phases 2–8 of the build plan are **done**; Phase 12 QA has **run** (Lighthouse 100 accessibility / 100 SEO on every route; crawlability, redirects, links, consent all verified). Phase 9 was largely absorbed into the page builds; **Phase 10 (Aug-1 pricing switch) has NOT run**; Phase 11's account-side Ads work is pending (see `docs/google-ads-mapping.md`).
- **Old pricing + new package names is the deliberate current state** — the announcement banner (auto-hides Aug 1) explains the upcoming change. Do not "fix" prices to the new offering before the switch.
- **10 commits on `overhaul` are unpushed**; the working tree carries one intentional uncommitted change (Scott's own deletion of `docs/spec/coding-agent-prompts.md` — keep excluding it from commits: `git add -A -- . ':!docs/spec/coding-agent-prompts.md'`).

## Stack & architecture

- **Next.js App Router** (`src/app/`), fully static (`next build` prerenders every route). No prerender scripts, no GSAP, no `window.__PRERENDER__` — that world is gone.
- **Shared shell** in `src/app/layout.jsx`: fonts via `next/font` (Plus Jakarta Sans + Inter — note: they render for the first time; the old site silently fell back to system fonts), metadata defaults, inline Consent Mode v2 bootstrap (deny-first) + gtag.js, skip link, AnnouncementBanner, Nav, Footer, ConsentBanner, AnalyticsLoader.
- **Analytics** (all consent-gated): GA4 `G-5E5GEN5N59`, Google Ads `AW-18196514948`, Meta Pixel `2845684255788584`, TikTok Pixel. Pixels load only after consent (`src/lib/consent.js` holds the storage key). `public/booked.html` is the Calendly-redirect conversion page — **its Google Ads conversion label is still empty (no-op)**; see `09` §5.9.
- **Calendly** popup via `src/hooks/useCalendly.js` — keep the iOS Safari mobile-host fix; every CTA goes through `src/components/BookButton.jsx` with a per-placement `source` tag (full tag map in `09` §6).
- **FAQ single source**: `src/lib/faqs.js` renders `/faq`, generates its FAQPage JSON-LD, feeds package-page subsets, and supplies `/contact` cancellation copy. Never fork FAQ copy.
- **Redirects/rewrites/headers** live in `next.config.mjs` (`vercel.json` deleted): `.com`/`www` → apex, `/booked` + `/privacy` rewrites, cache headers.
- `src/components/sections/` is **dead code kept as copy reference** (old gear sections; they import deleted modules — never import them).

## Conventions

- **Design tokens** in `src/styles/tokens.css` — note `--chrome` was lifted to `#E4E4E4` for WCAG AA. **Muted text on the brand red must be solid `var(--cream)`**, not white-alpha or opacity-faded (alpha over the saturated red fails 4.5:1 even when it looks fine).
- **Respect `prefers-reduced-motion`** — the only JS motion is the reviews marquee, which is matchMedia-gated; keep any new motion gated the same way.
- **Pending inputs** are `{/* PENDING: ... */}` / `❓ BLOCKED` comments — `grep -rn "PENDING\|BLOCKED" src/ public/` lists all outstanding client inputs. Never invent content that conflicts with the brand: no invented reviews, bios, policies, or inclusions.
- **No `Review`/`aggregateRating` markup on any new page.** The homepage business schema still carries the live site's 5.0/15 rating verbatim — an unresolved flag (`09` §5.3), not a precedent.
- After completing each numbered step in a multi-step task, **pause and report progress** before continuing.
- If a doc conflicts with the code, with itself, or with what the developer asks, **flag it — don't silently pick a side.**

## Non-negotiable constraints

- **Work on the `overhaul` branch; never commit directly to `main`.** Merge to `main` only via the launch runbook in `09` §8.
- **SEO-first and multi-page** — don't collapse pages back together; each package page is an Ads destination.
- **iOS Safari is a first-class target** — the Calendly mobile-host fix exists for an iOS-specific bug; it has NOT yet been re-tested on a real device since the migration (pre-launch requirement).
- **Reduced motion must remain fully functional.**
- **August 1, 2026 is a hard business date**: prices/durations change (`08` §3). If launch happens first, current pricing ships with the banner; either way the Phase 10 checklist (`09` §7) must be executed around that date — otherwise the site shows stale prices with no banner explaining them.

## Developer-environment quirks

Scott runs hooks that will intercept you: a **config-protection hook** blocks edits to `eslint.config.js` (legitimate changes go through its documented escape hatch), and a **GateGuard hook** requires stating "facts" before the first Bash call of a session and before destructive commands. Present the facts it asks for and retry.
