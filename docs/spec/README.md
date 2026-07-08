# Clutch Academy — Website Build Spec

This folder contains the specification for the Clutch Academy website. It is written for AI coding agents building and iterating on the site.

> ⚠️ **The site is undergoing a July 2026 overhaul: single-page → conventional multi-page on Next.js, SEO-focused, gear-shift animation removed.** The authoritative docs are **`07-overhaul-build-plan.md`** (ordered build steps) and **`08-overhaul-reference.md`** (sitemap, content, pricing, SEO, migration). Files `01`–`06` predate the overhaul and each carry a supersession notice — treat them as intent/history, not current direction. See `CLAUDE.md` at the repo root for the master summary.
>
> **Branch:** all overhaul work happens on the **`overhaul`** branch; `main` stays the live baseline.

## Quick Facts

| Field | Value |
|---|---|
| Business | Clutch Academy |
| Type | Manual transmission driving school |
| Location | Toronto, Ontario |
| Site type | **Conventional multi-page site** (Next.js App Router, static-generated) |
| Build sequencing | **Ordered, not dated** — see `07-overhaul-build-plan.md` |
| Framework | **Next.js (App Router)** — migrated from Vite; gear-shift animation removed |
| Primary conversion | Book a lesson via Calendly |
| Payment | Collected securely at booking (Stripe) |
| Design/styling | Premium red/white brand; modern type; whitespace; mobile-first (see `06` for the still-valid visual language) |

## How to Use This Spec

Load the file(s) relevant to your current task. Start with the two overhaul docs; reach for `01`–`06` only for durable intent they still carry.

| File | Contains | Status |
|---|---|---|
| `07-overhaul-build-plan.md` | Ordered build phases for the multi-page rebuild | **Authoritative** |
| `08-overhaul-reference.md` | Sitemap/routes, per-page content, pricing, SEO targets, analytics carry-over, Vite→Next migration map, open decisions | **Authoritative** |
| `01-project-brief.md` | Business context, audience, positioning, voice | Intent still valid; see notice |
| `02-site-architecture.md` | Old single-page gear-shift architecture | Superseded (see `08` §1) |
| `03-content-spec.md` | Per-section copy direction, FAQ | Partially superseded (see `08` §2) |
| `04-technical-spec.md` | Old React/Vite/GSAP stack & integrations | Superseded on stack (see `08` §6) |
| `05-pending-items.md` | Old open decisions + May-1 schedule | Superseded (see `08` §7) |
| `06-design-system.md` | Color, typography, layout, animation system | Visual language valid; animation removed |

## Decision State Legend

- ✅ **DECIDED** — locked in
- 🟡 **RECOMMENDED** — default unless overridden
- ❓ **OPEN** — still needs a decision; use a placeholder / leave TODO
- 📎 **PENDING ASSET** — waiting on client to deliver content

## Scope Boundaries

**In scope:**
- Conventional multi-page Next.js application (real routes + navigation)
- Dedicated, SEO-optimized landing page per package (organic + Google Ads destinations)
- SEO architecture: static generation, per-route metadata, structured data
- Calendly booking integration; payment collected securely at booking
- Responsive, mobile-first, and reduced-motion-friendly (no scroll animations to gate)

**Out of scope (for now):**
- CMS / admin panel
- Blog / driving-tips content (a likely *next* phase — the brief seeds topics; Next makes it easy)
- Sound effects / audio

**Pending (delivered separately by client):**
- Final brand assets (logo variants, instructor/real-lesson photos)
- Student testimonials, cancellation-policy wording, package inclusions (see `08` §7)

## Critical Constraints

1. **Work on the `overhaul` branch, never directly on `main`.**
2. **SEO-first, multi-page.** Dedicated crawlable landing pages are the point of the rebuild — don't collapse them back together.
3. **The instructor is the product.** Trust (About + testimonials + reviews) is the primary conversion lever.
4. **Payment is collected at booking** (Stripe) — keep secure-payment and cancellation messaging clear.
5. **Reduced motion must work.** The site must be fully functional and accessible.

## Cross-Reference Notes

- Sitemap, routes, and per-page content → `08-overhaul-reference.md`.
- Build order and checkpoints → `07-overhaul-build-plan.md`.
- Stack, analytics IDs, and the migration map → `08` §5–§6 and `CLAUDE.md`.
