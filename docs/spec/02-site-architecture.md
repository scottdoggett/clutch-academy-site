# 02 — Site Architecture

## Approach

✅ **Single-page React application with a gear-shift navigation metaphor.**

All primary content lives on one page. Section transitions are not traditional scroll-through-sections — they are **gear shifts**, animated to mimic the physical motion of a manual transmission H-pattern.

- Stack: React + GSAP (see `04-technical-spec.md`)
- Layout grammar and animation specifics: see `06-design-system.md`
- This file covers structure, navigation, and section flow

### Why this structure

- The metaphor ties directly to the business (manual driving school) — brand-and-structure alignment
- Scope still fits a single-page brochure — no multi-page routing needed
- Scroll still works as the primary navigation input, but each scroll advances a gear shift rather than revealing new vertical content

---

## The Seven Sections (Mapped to Gears)

Each of the site's seven primary sections corresponds to one position on the H-pattern gearbox. Six forward gears plus reverse.

| Gear | Section | Anchor ID | Screen Position | Nav Label |
|---|---|---|---|---|
| **1** | Home / Hero | `#home` | Top-left | Home |
| **2** | About | `#about` | Bottom-left | About |
| **3** | How It Works | `#how-it-works` | Top-center | (not in nav) |
| **4** | Packages & Pricing | `#packages` | Bottom-center | Packages |
| **5** | Reviews | `#reviews` | Top-right | Reviews |
| **6** | FAQ | `#faq` | Bottom-right | FAQ |
| **R** | Book Now + Contact | `#book` | Center, full-width | Contact / Book Now |

See `06-design-system.md` for visual H-pattern diagram and content alignment rules per gear.

### Changes from earlier drafts

- ❌ **Quick Value Props strip** — removed (per client)
- ❌ **MTO-certification FAQ entry** — removed (per client)
- 🔀 **Final CTA Band + Contact merged into Reverse gear** — these are now one dramatic center-screen section (the "Book Now" destination)
- 🔀 **How It Works** gets its own anchor (`#how-it-works`) but is not promoted in the top nav. It's discovered via scroll between About and Packages.

---

## Primary Navigation

A sticky nav bar remains visible across all gears. It's the "instrument cluster" of the site — always on, showing controls.

| # | Label | Action |
|---|---|---|
| 1 | Home | Quick-shift to Gear 1 |
| 2 | About | Quick-shift to Gear 2 |
| 3 | Packages | Quick-shift to Gear 4 |
| 4 | Reviews | Quick-shift to Gear 5 |
| 5 | FAQ | Quick-shift to Gear 6 |
| 6 | Contact | Quick-shift to Reverse |
| 7 | **Book Now** (button) | Direct Reverse shift from any current gear |

### Behavior

- Nav remains fixed to the top of the viewport as the user moves through gears.
- On mobile, the nav collapses to a hamburger, but the **Book Now** button stays visible outside the collapse.
- Clicking a nav link does NOT teleport — it triggers a quick-shift animation through any intermediate gears at accelerated pace. See the design file for quick-shift specifics.
- Clicking **Book Now** triggers the full signature Reverse animation regardless of starting gear. This is a shortcut route, not a sequential upshift.
- An active-state indicator shows which gear the user is currently on (e.g., highlight the corresponding nav item).

### Why How It Works isn't in the top nav

The nav focuses on high-intent destinations (pricing, reviews, booking). How It Works is educational content discovered in-flow during a full scroll-through. Including it in the nav would clutter the interface without aiding conversion.

---

## Section Position & Alignment Rules

Each gear section's content is anchored to its corresponding corner/edge of the viewport. The surrounding space is intentionally empty red field.

| Gear | Content anchor | Rough area used |
|---|---|---|
| 1 | Top-left quadrant | ~25% of viewport |
| 2 | Bottom-left quadrant | ~25% |
| 3 | Top-center band | ~25% (horizontally centered) |
| 4 | Bottom-center band | ~25% (horizontally centered) |
| 5 | Top-right quadrant | ~25% |
| 6 | Bottom-right quadrant | ~25% |
| R | Full-width center | ~70–80% — this is the dramatic finale |

Gears 1–6 share a principle: **restrained, spacious, one-quadrant-dominant.** Reverse breaks the pattern intentionally — it's where the user is meant to take action, so it commands the full viewport.

---

## Scroll Flow

The default input for navigating the site is vertical scroll.

### Upshifting (default direction)

Scrolling downward advances through gears in sequence:
**1 → 2 → 3 → 4 → 5 → 6 → R → Footer**

Each gear shift is a pinned, scroll-scrubbed animation. The user can pause mid-shift and see the transition in progress.

### Downshifting

Scrolling upward runs the sequence in reverse. Animations play backward; the user returns smoothly to earlier gears.

### Ending on the footer

Scrolling past Reverse reveals the static footer. The footer doesn't participate in the gear metaphor — it's the "engine off" moment at the bottom of the page.

See `06-design-system.md` for detailed animation specs for each transition (same-column shift, H-crossing shift, and Reverse shift).

---

## Booking Flow

The booking flow is still the site's primary conversion goal. Integration details in `04-technical-spec.md`.

### Entry points (all open Calendly in a popup modal)

1. **Home hero CTA** — "Start your manual driving journey today"
2. **About section CTA** — "Book a Lesson with [Name]"
3. **Each package card CTA** — "Book This Lesson" / "Book This Package"
4. **Reverse section primary CTA** — dominant, center-screen booking button
5. **Nav bar "Book Now" button** — always visible, triggers the Reverse animation before opening Calendly

### The Reverse section as conversion destination

The entire Reverse gear is built around booking. It combines what were previously the "Final CTA Band" and "Contact" sections into one climactic scene:

- Primary booking CTA (dominant)
- Contact form (3-field: Name, Email, Message)
- Direct contact info (phone, email) as secondary options
- Clear payment reminder ("Payment collected in person")

Users arriving at Reverse by scrolling through all six gears have been primed with every piece of content. Users clicking "Book Now" from the nav bypass the journey and land here directly.

### Payment is NOT handled in the booking flow

✅ **Decided.** Calendly confirms the time slot. Payment (cash, e-transfer, or PayPal) is collected in person at the start of the lesson. No online payment UI anywhere on the site.

---

## Footer Structure

The footer sits below the Reverse section as static content. See `06-design-system.md` for its distinct visual treatment (it exits the gear-red field).

Footer content (multi-column on desktop, stacked on mobile):

**Column 1 — Brand**
- Logo (📎 pending asset)
- Tagline (📎 pending)
- Short description: "Manual transmission driving lessons in Toronto."

**Column 2 — Contact**
- Phone (clickable `tel:` link)
- Email (clickable `mailto:` link)
- Service area: "Serving Toronto and the GTA"

**Column 3 — Quick Links**
- Mirrors primary navigation

**Column 4 — Social**
- Instagram icon + link (📎 pending)
- Other social icons as needed

**Full-width bottom strip:**
- Copyright: "© 2026 Clutch Academy. All rights reserved."
- Cancellation policy link (❓ destination TBD — see `05-pending-items.md`)
- Privacy policy link (required if contact form is active — see tech spec)

---

## Responsive Breakpoints

The H-pattern is a desktop-first concept. On narrow screens it gracefully degrades to a linear scroll experience.

- **Desktop (≥1024px):** full H-pattern, all animations
- **Tablet (768–1023px):** full H-pattern, animations scaled proportionally
- **Mobile (<768px):** simplified vertical stack; gear indicators remain as visual identity; transitions collapse to fast vertical slides

Full responsive strategy is in `06-design-system.md` under "Responsive Behavior."

---

## Accessibility Baseline

- Semantic HTML (`<nav>`, `<main>`, `<section>`, `<footer>`)
- Skip-to-content link at top of page
- All interactive elements keyboard-accessible; focus order follows visual order
- Alt text on all images; gear numerals marked `aria-hidden="true"` (section name conveyed via heading)
- Sufficient color contrast (verified against final red hex)
- All sections rendered in DOM at page load regardless of animation state
- `prefers-reduced-motion` respected — animations replaced with instant crossfades, scroll becomes standard anchor navigation

Design file has full accessibility details including focus management during transitions.
