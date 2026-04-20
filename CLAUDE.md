# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Clutch Academy Website

Manual transmission driving school in Toronto. Single-page React site with a gear-shift animation metaphor. Launching **May 1, 2026** (hard deadline).

## Where to find the spec

The full build specification lives in `docs/spec/`. Always read `docs/spec/README.md` first — it explains the decision-state legend (✅ decided / 🟡 recommended / ❓ open / 📎 pending asset) and tells you which spec file to load for which concern.

Spec files, in load order for a full build:

1. `docs/spec/01-project-brief.md` — business context, audience, goals
2. `docs/spec/02-site-architecture.md` — gear-to-section mapping, nav, flow
3. `docs/spec/06-design-system.md` — H-pattern layout, colors, typography, the GSAP animation system
4. `docs/spec/03-content-spec.md` — per-section copy, CTAs, FAQ, pricing
5. `docs/spec/04-technical-spec.md` — React + GSAP stack, Calendly, Netlify Forms
6. `docs/spec/05-pending-items.md` — open decisions and missing assets

For any task, scan the spec routing table in `docs/spec/README.md` and load only the files you need.

## Stack

- React + Vite
- GSAP with `@gsap/react` and `ScrollTrigger`
- Netlify for hosting + Netlify Forms for the contact form
- Calendly for bookings (popup modal integration)
- GA4 for analytics

## Commands (once scaffolded)

- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build locally

## Conventions

- **Use the `useGSAP` hook** from `@gsap/react` for all animation code — never raw `useEffect` with GSAP. This ensures cleanup on unmount.
- **Design tokens in CSS custom properties** (`src/styles/tokens.css`), not hardcoded values. See design system spec for the token names.
- **Gear sections are components.** Each of the seven sections is its own component under `src/components/sections/`. The `GearSection` wrapper handles pinning and position.
- **Respect `prefers-reduced-motion`.** Every GSAP animation must have a fallback. This is in the design spec.

## Architecture

Single-page app where scroll position drives a gear-shift metaphor. Seven sections map to gear positions on an H-pattern shifter:

```
src/
├── App.jsx              # Orchestrates gear transitions
├── components/
│   ├── Nav.jsx          # Sticky nav with gear indicator
│   ├── GearSection.jsx  # Wrapper: handles pinning + viewport-position alignment
│   ├── GearIndicator.jsx
│   ├── sections/        # One component per gear
│   │   ├── Home.jsx         # 1st gear
│   │   ├── About.jsx        # 2nd gear
│   │   ├── HowItWorks.jsx   # 3rd gear
│   │   ├── Packages.jsx     # 4th gear
│   │   ├── Reviews.jsx      # 5th gear
│   │   ├── Faq.jsx          # 6th gear (maps to neutral in H-pattern)
│   │   └── Reverse.jsx      # Reverse — contact form + booking CTAs
│   └── Footer.jsx
├── hooks/
│   └── useShiftTransition.js  # GSAP logic per transition type
└── styles/
    └── tokens.css       # CSS custom properties (colors, type scale)
```

Key animation concepts (detailed in `docs/spec/06-design-system.md`):
- **Three transition types:** same-column shifts, H-crossing shifts (2→3, 4→5), and the signature Reverse shift
- **ScrollTrigger** pins each `GearSection` and triggers transitions between them
- **`useShiftTransition`** hook encapsulates per-transition GSAP timelines
- **Calendly popup** opens after the Reverse shift animation completes (for the nav "Book Now" button); other CTAs open it immediately

## Pending assets

Many brand assets (logo, instructor photo, final colors) are not yet delivered. When you encounter a missing asset, use an HTML comment placeholder: `<!-- PENDING: [item name] -->`. Never invent content that conflicts with the client's brand — see `docs/spec/05-pending-items.md` for the full list and rules.

## Workflow

- Follow the build order in `docs/spec/04-technical-spec.md` (section "Build Order Recommendation").
- After completing each numbered step, pause and report progress. The developer will review before continuing.
- Track `<!-- PENDING: -->` comments as you add them. At any checkpoint, output a running list.
- If the spec conflicts with itself or with what the developer is asking, flag it — don't silently pick a side.

## Non-negotiable constraints

- **May 1, 2026 launch.** Scope back features before slipping the date.
- **No online payment.** Calendly confirms appointments; payment happens in person.
- **Two pricing tiers, not three.** $90 single lesson, $240 for a 3-pack.
- **Gear-shift metaphor is core, not decoration.** Don't simplify away layout positions or animation choreography without explicit approval.