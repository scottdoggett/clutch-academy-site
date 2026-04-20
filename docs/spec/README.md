# Clutch Academy — Website Build Spec

This folder contains the full specification for the Clutch Academy website. It is written for AI coding agents tasked with building the site.

## Quick Facts

| Field | Value |
|---|---|
| Business | Clutch Academy |
| Type | Manual transmission driving school |
| Location | Toronto, Ontario |
| Target launch | **May 1, 2026** (hard deadline) |
| Site type | Single-page brochure site with anchor navigation |
| Primary conversion | Book a lesson via Calendly |
| Design/styling | **Out of scope for this spec** — brand assets, colors, fonts, and animations will be provided separately |

## How to Use This Spec

Load the file(s) relevant to your current task. The files are independent but cross-reference each other where useful.

| File | Contains | Load when you need… |
|---|---|---|
| `01-project-brief.md` | Business context, audience, positioning, goals | Understanding who the site is for and what it must achieve |
| `02-site-architecture.md` | Sitemap, gear-to-section mapping, navigation, section flow | Laying out page structure, nav links, React component skeleton |
| `03-content-spec.md` | Per-section content specs (copy direction, CTAs, FAQ, pricing) | Writing markup for each section, filling in copy |
| `04-technical-spec.md` | Stack (React + GSAP), integrations, forms, analytics, deployment | Setting up Calendly, contact form, hosting, domain/email |
| `05-pending-items.md` | Open decisions + assets still needed from client | Knowing what NOT to hardcode and what to leave as placeholders |
| `06-design-system.md` | Colors, typography, gear-shift animation system, responsive/a11y rules | Styling, implementing GSAP transitions, layout positions per gear |

## Decision State Legend

Throughout these files, each item is tagged:

- ✅ **DECIDED** — locked in at the client meeting
- 🟡 **RECOMMENDED** — default to this unless client overrides
- ❓ **OPEN** — still needs a client decision; use a placeholder / leave TODO
- 📎 **PENDING ASSET** — waiting on client to deliver content

## Scope Boundaries

**In scope:**
- Single-page React application with GSAP-powered gear-shift animations
- H-pattern layout with seven sections mapped to gears
- Calendly booking integration
- Contact form
- Responsive and reduced-motion fallbacks

**Out of scope (for now):**
- Online payment processing (payment is handled in-person)
- Content management system / admin panel
- Blog or driving-tips content section
- Multi-page routing
- Sound effects / audio

**Pending (delivered separately by client):**
- Final brand assets (logo, exact color hex, specific fonts, photography)
- Instructor bio and photo
- Final testimonials, cancellation policy wording, etc. (see `05-pending-items.md`)

## Critical Constraints

1. **Launch date is non-negotiable: May 1, 2026.** Scope back features before slipping the date.
2. **Payment is NOT collected online at booking.** Calendly confirms the appointment; money changes hands in person.
3. **The instructor is the product.** Trust in the About section is the primary conversion lever — build that section with care.
4. **Two pricing tiers, not three.** Do not invent a third tier.
5. **The gear-shift metaphor is core, not decoration.** Layout positions, animations, and typography all reinforce it. Do not simplify the concept away "for usability" without checking with the client — it's a deliberate differentiator.
6. **Reduced motion must work.** A significant portion of users enable it. The site must be fully functional without the gear animations.

## Cross-Reference Notes

When an agent needs information across concerns (e.g., "what form backend should I use and what fields does it need?"), check:
- Field specs → `03-content-spec.md` (Contact section)
- Backend/integration → `04-technical-spec.md` (Forms)
