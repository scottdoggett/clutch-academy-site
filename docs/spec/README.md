# Clutch Academy — Website Spec

Specification for the Clutch Academy website, written for the developer and for
AI coding agents working in this repo. Everything here describes the site **as
it actually is** on the `overhaul` branch as of **August 18, 2026**.

Superseded material lives in `archive/` and should not be worked from.

## Quick facts

| Field | Value |
|---|---|
| Business | Clutch Academy — manual transmission driving school, Toronto |
| Site | Multi-page, statically generated, 9 routes + 404 |
| Stack | Next.js 16 (App Router) · React 19 · plain CSS |
| Primary conversion | Book a lesson via Calendly popup |
| Payment | Collected at booking via Stripe (never in person) |
| Hosting | Vercel — **two projects**, one per branch (see `06-deployment.md`) |
| Live site | `clutchacademy.ca` — built from **`main`** (the old Vite build) |
| Rebuild | Built from **`overhaul`** (Next.js) on its own Vercel project, for review |
| Pricing | Post-August-1 offering — $109 / $299 / $469 / $219, all + HST |

## The one thing to understand first

There are **two sites deployed right now**. `main` holds the original
single-page Vite/GSAP build and serves the real domain. `overhaul` holds the
Next.js rebuild and serves a separate Vercel project so work can be shown to
people before cutover. They are different codebases in the same repo, and they
have drifted. `06-deployment.md` covers what each one is, and what a cutover
takes.

Unless you are specifically fixing the live site, **work on `overhaul`.**

## The files

| File | Contains |
|---|---|
| `01-brief.md` | Business context, audience, positioning, brand voice, scope boundaries |
| `02-architecture.md` | Stack, routes, component map, styling system, conventions |
| `03-content-and-pricing.md` | Per-page content, the four packages, current pricing, copy rules |
| `04-seo.md` | SEO architecture, per-route targets, structured data, crawler policy |
| `05-analytics.md` | Consent Mode, GA4 / Ads / Meta / TikTok, conversion tracking, CTA source tags |
| `06-deployment.md` | The two Vercel projects, branch model, config, launch runbook |
| `07-status.md` | What's done, what isn't, and every open question needing a human |
| `../google-ads-mapping.md` | Account-side Google Ads work still to apply |
| `../seo.md` | Long-form SEO reference and maintenance guide |
| `archive/` | The retired single-page spec and the rebuild's own planning docs |

## Decision-state legend

Used throughout these files:

- ✅ **DECIDED** — locked in
- 🟡 **RECOMMENDED** — the default unless someone overrides it
- ❓ **OPEN** — needs a decision before it can ship
- 📎 **PENDING ASSET** — waiting on the client to deliver something

In code, the same states appear as `{/* PENDING: ... */}` and `❓ BLOCKED`
comments. `grep -rn "PENDING\|BLOCKED" src/ public/` lists every one.

## Non-negotiable constraints

1. **Work on `overhaul`; never commit directly to `main`.** `main` is live.
2. **SEO-first and multi-page.** Each package page is a real landing page and a
   Google Ads destination. Don't collapse them back together.
3. **The instructor is the product.** Trust — About, reviews, testimonials — is
   the primary conversion lever, not feature lists.
4. **Payment is collected at booking.** Keep secure-payment and cancellation
   messaging explicit and consistent.
5. **Reduced motion must remain fully functional.** Every animation needs a
   matchMedia gate.
6. **Never invent content.** No fabricated reviews, bios, policies, or package
   inclusions. If it isn't supplied, flag it `PENDING`.
7. **iOS Safari is a first-class target.** The Calendly mobile-host workaround
   exists for a real iOS bug.

## Conventions for updating these docs

- If a doc disagrees with the code, **the code wins** — then fix the doc.
- If a doc disagrees with another doc, **flag it; don't silently pick a side.**
- Convert relative dates to absolute ones ("July 2026", not "last month").
- When a decision moves from ❓ to ✅, update `07-status.md` in the same commit
  as the code change.
