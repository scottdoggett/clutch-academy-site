# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Clutch Academy Website

Manual transmission driving school in Toronto. The site is being rebuilt from a single-page React/Vite/GSAP brochure into a **conventional, SEO-focused, multi-page site on Next.js**.

## ⚠️ Active overhaul — read this first

- **Authoritative docs:** `docs/spec/07-overhaul-build-plan.md` (ordered build phases) and `docs/spec/08-overhaul-reference.md` (sitemap, per-page content, pricing, SEO targets, migration map). These win over everything else — including the current code — where they conflict.
- **Older spec files `01`–`06` are superseded** for structure, stack, and animation (each carries a notice at its top). Use them only for durable intent: audience, positioning, brand voice, color, typography.
- **Branch:** do all overhaul work on a dedicated **`overhaul`** branch (`git checkout -b overhaul`). Keep `main` as the live/stable baseline and merge to `main` only when the rebuild is verified. Never commit overhaul changes directly to `main`.
- **Locked decisions:** migrate to Next.js App Router; conventional multi-page (real routes, real nav); the **gear-shift animation is removed entirely** (keep a similar homepage content structure, but no GSAP, no H-pattern, no scroll-jacking); static generation replaces the custom Puppeteer prerender.

## Current code vs. target

The repo currently holds the **pre-overhaul single-page build** (React 19 + Vite + GSAP, live on Vercel). Treat it as the starting point being migrated, not the target. When the current code and the overhaul docs disagree, the docs win.

Facts about the current build worth knowing before touching it:

- **Payment is collected at booking** (Stripe), not in person — Reverse/Contact, FAQ, and Packages copy already reflect this.
- **Analytics is fully wired** behind a consent gate: GA4 `G-5E5GEN5N59`, Google Ads `AW-18196514948`, Meta Pixel `2845684255788584`, and TikTok Pixel. `public/booked.html` tracks the Calendly-redirect conversion. All of this carries over to the Next build.
- **The Reverse section is a contact-info card** (phone, email, Instagram, Facebook) — it becomes the `/contact` page. The hidden Netlify form stub in `index.html` is unused and gets removed.
- Pricing/naming is mid-flight: the current cards show the **old** prices; the overhaul target is the **new** offering (75-minute lessons; "Manual Foundations" / "Complete Manual Confidence" names; new prices) — see `08` §3.

## Target stack (post-migration)

- **Next.js (App Router)** with static generation for content/landing pages; React 19.
- **Calendly** (popup) for bookings — lazy-loaded on first CTA; keep the iOS Safari mobile-host fix.
- **GA4 + Consent Mode v2** default-deny; `ConsentBanner` grants; Meta / TikTok / Google Ads gated the same way.
- **Hosting: Vercel.** Redirects (`.com → .ca`, `www →` apex) and per-asset cache headers move from `vercel.json` into `next.config`.
- **`next/image`** replaces the manual WebP/JPEG pipeline and `scripts/generate-images.mjs`.
- **Removed:** GSAP + `@gsap/react`, `GearSection`, `GearIndicator`, the `window.__PRERENDER__` guards, and `scripts/prerender.mjs` (SSG replaces it).

## SEO architecture (target)

SEO is the primary goal of the overhaul. Next's static generation gives each route crawlable HTML natively — no more bespoke prerender. Per-route metadata via `generateMetadata` (unique title / description / canonical / OG). FAQPage JSON-LD generated from the FAQ array so on-page copy and structured data can't drift. DrivingSchool / Offer / Person schema on the homepage. `robots.txt`, `sitemap.xml` (now multi-URL), and `llms.txt` carry over. **No `Review` / `aggregateRating` schema** until Google Business Profile reviews can be legitimately cited — self-attested rating markup risks a manual action.

## Conventions

- **Design tokens in CSS custom properties** (`src/styles/tokens.css`), not hardcoded values.
- **Respect `prefers-reduced-motion`.** With the gear animation gone this is largely automatic, but any new motion needs a matchMedia gate or equivalent fallback.
- **Pending assets** are tracked as `<!-- PENDING: [name] -->` comments (or the JSX equivalent). Never invent content that conflicts with the client's brand — see `08` §7 for the open-decisions and pending-asset list.
- After completing each numbered step in a multi-step task, **pause and report progress** before continuing.
- If a doc conflicts with the code, with itself, or with what the developer is asking, **flag it — don't silently pick a side.**

## Non-negotiable constraints

- **Work on the `overhaul` branch, never directly on `main`.**
- **SEO-first and multi-page.** The whole point of the rebuild is dedicated, crawlable landing pages per package for organic search and Google Ads. Don't collapse the pages back together.
- **iOS Safari is a first-class target.** The Calendly mobile-host fix exists because of an iOS-specific bug — don't remove it without testing on iOS.
- **Reduced motion must remain a fully functional path.**
- **New pricing/naming is the target state** (see `08` §3); keep old pricing live only until the August 1 switch, and only if launching before then.
