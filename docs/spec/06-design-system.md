# 06 — Design System

This file is the authoritative reference for visual language: color, typography, layout grammar, the gear-shift animation system, and responsive/accessibility rules. Architecture decisions live in `02-site-architecture.md`; this file is about how the site *feels* and *moves*.

---

## Core Concept

The site is built around a **manual transmission metaphor**. The seven primary sections correspond to the six forward gears plus reverse on a standard H-pattern gearbox. Navigating the site is analogous to shifting through gears — the content and visual camera move along the physical paths a gearshift knob takes between positions.

**This is not a skin.** The metaphor drives layout positioning, animation direction, color palette, and typography choices. Everything reinforces the feeling of sitting in the driver's seat of the instructor's car.

---

## The H-Pattern Grid

The screen acts as a virtual gearbox. Each section's content is anchored to the viewport position that mirrors its gear location.

```
┌────────────────────────────────────────────────────┐
│  ①                    ③                      ⑤    │  ← Top row
│  HOME          HOW IT WORKS              REVIEWS   │     (odd gears)
│                                                    │
│                                                    │
│                                                    │
│                                                    │
│  ②                    ④                      ⑥    │  ← Bottom row
│  ABOUT           PACKAGES                   FAQ    │     (even gears)
└────────────────────────────────────────────────────┘

                    ┌───────────┐
                    │     R     │
                    │  BOOK NOW │  ← Reverse: center, full-width, dramatic
                    └───────────┘
```

### Position Table

| Gear | Section | Screen Position | Content Alignment | Gear Indicator Position |
|---|---|---|---|---|
| **1** | Home | Top-left | Top-left of viewport | Top-left |
| **2** | About | Bottom-left | Bottom-left of viewport | Bottom-left |
| **3** | How It Works | Top-center | Top of viewport, horizontally centered | Top-center |
| **4** | Packages | Bottom-center | Bottom of viewport, horizontally centered | Bottom-center |
| **5** | Reviews | Top-right | Top-right of viewport | Top-right |
| **6** | FAQ | Bottom-right | Bottom-right of viewport | Bottom-right |
| **R** | Book Now + Contact | Center, full-width | Centered, visually dominant | Top-center (large "R") |

### Content Sizing Rules

- Gears 1–6: content fills most of the viewport but is aligned to its gear-position corner/edge. The alignment communicates location in the H-pattern while giving content generous room to breathe.
- Reverse: content expands to dominate the viewport with centered alignment. This is the climactic final section — largest visual weight, most prominent CTAs.

---

## Color Palette

✅ **Primary background: red.** ✅ **Primary text: white.**

### Exact values (recommendations)

| Token | Hex | Use |
|---|---|---|
| `--red-primary` | `#C8102E` | Main background. Deep racing red, saturated but grounded. |
| `--red-deep` | `#8A0A1F` | Accent red for depth (card backgrounds in Reverse, hover states, shadows) |
| `--red-dark` | `#4A0510` | Footer background — visually exits the gear-red field |
| `--white` | `#FFFFFF` | Primary text, gear numbers, borders |
| `--cream` | `#FDF8F2` | 🟡 Optional softer white for long body copy (pure white on red can feel harsh at small sizes) |
| `--chrome` | `#D9D9D9` | Sparingly used metallic accent — small detail lines, dividers |
| `--black` | `#0A0A0A` | Footer text, deep shadows |

🟡 The red hex is a recommendation, not a lock. The client's marketing package may specify a different red — if so, replace `--red-primary` and derive the other shades proportionally (deep = ~60% luminance of primary; dark = ~30%).

### Contrast notes

- White on `#C8102E` clears WCAG AA for normal text and AAA for large text. Verify with final palette.
- Avoid pure black text on red at any size — too harsh. Use white or cream.
- All red-on-red combinations must maintain at least a 3:1 ratio for non-text UI (borders, dividers).

---

## Typography

### Two-font system

🟡 **Display:** A bold, condensed sans-serif with strong geometric numerals — evokes dashboard instruments and racing signage.
🟡 **Body:** A clean humanist sans-serif — legible, warm, no decorative flourishes.

### Recommended pairings (Google Fonts, free)

| Role | Recommendation | Alternatives |
|---|---|---|
| Display / gear numerals / H1 | **Barlow Condensed** (weights 700, 800, 900) | Oswald, Anton, Bebas Neue |
| Body / paragraphs / forms | **Inter** (weights 400, 500, 600) | DM Sans, Work Sans |

### Type Scale

Fluid scale using `clamp()` so sizes adapt between mobile and desktop without discrete breakpoints. Values are suggestions; tune in build.

| Token | Size (desktop) | Use |
|---|---|---|
| `--text-gear` | `clamp(4rem, 12vw, 10rem)` | The circled gear number — hero-sized |
| `--text-display-xl` | `clamp(2.5rem, 6vw, 5rem)` | Section headlines |
| `--text-display-lg` | `clamp(2rem, 4vw, 3.5rem)` | Sub-headlines |
| `--text-body-lg` | `clamp(1.125rem, 1.5vw, 1.375rem)` | Lead paragraphs |
| `--text-body` | `1rem` | Standard body |
| `--text-small` | `0.875rem` | Labels, FAQ metadata, footer |

### Typographic principles

- **Display type is TIGHT.** Use `letter-spacing: -0.02em` on headlines and gear numerals. This feels modern and automotive.
- **Body type is AIRY.** Use `line-height: 1.6` for paragraphs. White on red is intense; generous leading keeps it readable.
- **All caps on short labels only** — nav items, badges, CTA button text can be caps with `letter-spacing: 0.08em` for a dashboard feel. Never caps in paragraphs.

---

## The Gear Indicator

The circled gear number is the single most important visual element outside of content. It tells the user where they are in the drive.

### Anatomy

- **Shape:** perfect circle, white stroke, no fill (or very low-opacity white fill for slight emphasis)
- **Stroke width:** `3–4px` on desktop, `2–3px` on mobile
- **Numeral:** centered, Barlow Condensed 900 weight (or chosen display font's heaviest weight)
- **Color:** white numeral on transparent circle (red shows through)
- **Size:** approximately `clamp(80px, 10vw, 160px)` diameter

### Placement

The indicator always appears **at the corresponding corner/edge of the viewport** — the same position as the content it labels.

- Gear 1 (top-left): indicator pinned to top-left, content directly beneath it
- Gear 2 (bottom-left): indicator pinned to bottom-left, content above it
- Gear 3 (top-center): indicator pinned top-center, content beneath
- Gear 4 (bottom-center): indicator pinned bottom-center, content above
- Gear 5 (top-right): indicator pinned top-right, content beneath
- Gear 6 (bottom-right): indicator pinned bottom-right, content above
- Reverse: the letter **R** (not a number), rendered at gear-size, pinned top-center above the dramatic content

Use ~24–40px of padding between the indicator and the viewport edge, scaling with viewport size.

### Optional detail treatments (🟡, pick one during design pass)

- Subtle dashboard glow: soft white drop-shadow around the circle (faint, `0 0 20px rgba(255,255,255,0.2)`)
- Concentric outer ring in `--chrome` at ~50% opacity — tachometer feel
- Small serif tick marks at top/bottom of the circle — instrument cluster reference

Default: clean white circle, no extras. Add flourishes only if the overall site feels too sparse.

---

## Animation System

### Library choices

✅ **React + GSAP.** Use the following GSAP pieces:

- `gsap` (core)
- `@gsap/react` (provides `useGSAP` hook for React lifecycle integration)
- `ScrollTrigger` plugin (for scroll-driven timelines)
- 🟡 `ScrollSmoother` plugin (optional but recommended for silky scroll feel — requires GSAP Club membership for Club-only features; the free ScrollTrigger alone is sufficient)

### Core animation principle

**The viewer's camera travels the H-pattern.** As the user scrolls, the virtual camera translates between gear positions along the physical paths a shift knob would take. Content moves *opposite* to the camera — if the camera pans up, the outgoing content slides down off-screen.

This principle drives every transition.

### The Three Transition Types

#### Type A: Same-column shift (1→2, 3→4, 5→6)

Straight vertical motion — like pushing the shifter straight down through a gate.

- **Camera motion:** translates down
- **Outgoing content:** slides up and out (off the top of the viewport)
- **Incoming content:** slides up into view from below
- **Duration:** ~0.8s
- **Easing:** `power2.inOut` — smooth acceleration and deceleration, mechanical but not robotic

#### Type B: H-crossing shift (2→3 and 4→5)

Three-segment motion mimicking the path through the neutral gate.

- **Camera motion:** up → right → up (in two explicit steps with a brief seam at the neutral midpoint)
- **Outgoing content:** slides down, then left, then down (three segments, timed sequentially)
- **Incoming content:** slides up, then right, then up (mirror of outgoing)
- **Duration:** ~1.2s total. Split roughly: 0.4s / 0.4s / 0.4s
- **Easing:** `power2.out` on each segment with a ~50ms dwell at the joints — imitates the "click into neutral, click into gear" tactile feedback

#### Type C: Reverse shift (6→R)

The signature move. Two beats: push in, then shift.

- **Beat 1 — "into the screen":** Section 6 content scales up and fades (or recedes in z-space as if the camera pushes forward into the dashboard). This represents the real-car motion of pushing down on the shifter to release the reverse lock. Duration ~0.6s.
- **Beat 2 — "right and down":** The Reverse section enters; content shifts in from left-and-up such that from the viewer's POV, we see content translate right and down into its final center position. Duration ~0.8s.
- **Full transition:** ~1.4s
- **Easing:** `expo.in` on Beat 1 (accelerating push), `power3.out` on Beat 2 (decisive arrival)

The Reverse transition should feel distinctly different from the upshift transitions — weightier, more deliberate. It's the final reveal.

### Scroll mechanics

- Each gear section is **pinned** via `ScrollTrigger` while its transition to the next gear plays out.
- Transitions are **scrubbed** — tied to scroll position, not triggered once. User can scroll backward to reverse the animation.
- Standard downward scroll = upshift (1→2→3→4→5→6→R).
- Standard upward scroll = downshift (reverse direction).
- Reaching Reverse plays the full signature animation. Scrolling past Reverse reveals the static footer.

### Nav-triggered jumps

Clicking a nav link should animate through the intervening gears rather than teleport. Use a "quick-shift" mode where each intermediate transition runs at ~30% of normal duration, producing a rapid but legible sequence. Clicking "Book Now" from any gear triggers a direct Reverse animation skipping intermediate gears.

### Performance targets

- Animations must hit 60fps on mid-range mobile devices (iPhone 12-era, mid-tier Android).
- Use `transform` and `opacity` only — no animating `width`, `height`, `top`, `left`.
- Apply `will-change: transform` sparingly and remove after transitions complete.
- Lazy-load heavy images; ensure ScrollTrigger `refresh()` is called after dynamic content loads.

---

## Responsive Behavior

The H-pattern is a desktop-first concept. It breaks down physically on narrow screens.

### Desktop (≥1024px)

Full H-pattern layout. All animations as described. Gear indicators at their mapped corners. This is the primary experience.

### Tablet (768–1023px)

Full H-pattern, scaled proportionally. All animations run but consider reducing H-crossing duration to ~1.0s. Gear indicators shrink to ~120px.

### Mobile (<768px) — Simplified Shift Mode

The H-pattern is abandoned in favor of linear vertical scroll. The gear metaphor is preserved visually but not spatially.

- Content stacks top-to-bottom in standard scroll order (1 → 2 → 3 → 4 → 5 → 6 → R).
- Each section fills the viewport vertically; content is center-aligned horizontally.
- The gear indicator remains prominently displayed (top-center of each section on mobile).
- Transitions simplify to a single vertical slide — all three transition types collapse into a fast upward slide on scroll.
- The Reverse "into the screen then right-and-down" becomes a "into the screen then settle" — zoom-in fade without the lateral shift.
- Nav collapses to hamburger; "Book Now" stays visible outside the collapse.

This tradeoff is deliberate. Mobile users get a polished linear experience with the visual identity intact; desktop users get the full gear-shift showcase.

---

## Accessibility

### Reduced motion

All gear-shift animations must respect `prefers-reduced-motion: reduce`. Implementation:

- On detection, disable all GSAP transitions.
- Replace with instant crossfades (150ms opacity only).
- Scroll behavior becomes standard vertical scroll with anchor navigation — no pinning, no scrub.
- The gear indicators still render (they're static visual elements, not motion).

Build this as a first-class mode, not an afterthought. A significant portion of users enable reduced motion and the site must work well for them.

### Keyboard navigation

- All interactive elements (nav links, CTAs, form fields, FAQ accordions) must be keyboard-reachable and operable.
- `Tab` order follows visual order within each gear section.
- Clicking a nav link with keyboard triggers the same quick-shift animation as a mouse click.
- Focus states are clearly visible — use a 2px white outline with 2px offset.

### Screen readers

- All sections must render in the DOM at page load, regardless of whether their animation has played.
- Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<footer>`). Each section should have an accessible heading.
- The gear numbers are decorative. Wrap them with `aria-hidden="true"` and provide the section name via the heading.
- Skip-to-content link at the top of the page jumps past the nav.

### Focus management

- When a nav link triggers a transition, move focus to the target section's heading after the animation completes.
- When the Book Now button triggers the Reverse animation, move focus to the primary CTA in that section.

---

## Footer Treatment

The footer sits below the Reverse section as standard static content. It **does not participate in the gear metaphor** — no gear number, no fancy animation. It's the "engine off" moment.

- Background: `--red-dark` (`#4A0510`) or near-black (`#0A0A0A`) — visually distinct from the gear-red field
- Text: `--cream` for warmth against the darker background
- Compact, multi-column on desktop, stacked on mobile
- No hover animations beyond standard link underlines

See `02-site-architecture.md` for footer content structure.

---

## Misc Details

### Cursor treatment (optional, 🟡)

Consider a custom cursor during transitions — e.g., a small "H-pattern" diagram showing current gear position, or a subtle trail effect. Low priority; add only if time permits.

### Sound (explicitly NO)

Do not add engine or gear-shift sound effects. Auto-playing audio on websites is hostile; the metaphor stands on its own visually.

### Loading state

A brief pre-load animation is appropriate — suggested: the circled "1" materializes (fade in + slight scale from 0.9 to 1.0) before the Home section's content appears. Total load intro: under 800ms.

### Scroll hint

On the Home section, include a subtle downward arrow or "Shift to 2nd" microcopy to signal that scrolling advances the gear. Fade out after the first scroll event is detected.
