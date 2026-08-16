# Archive — superseded specs

Nothing in this folder describes the site as it is today. It is kept for
provenance: these files record what was decided and why, across two distinct
builds. **Do not work from them.** The current spec is the numbered set in
`docs/spec/`.

Archived August 16, 2026.

## What's here

| File | What it described | Why it's archived |
|---|---|---|
| `01-project-brief.md` | Business context, audience, positioning, brand voice | Durable intent survives in the current `01-brief.md`; the launch dates and single-page framing are dead |
| `02-site-architecture.md` | The seven gear-shift "sections" of the single-page site | The gear metaphor, the H-pattern shifter, and the whole one-page architecture were removed in the July 2026 rebuild |
| `03-content-spec.md` | Per-section copy for the single-page build | Content now lives per-route; see `03-content-and-pricing.md` |
| `04-technical-spec.md` | React 19 + Vite + GSAP/ScrollTrigger, Puppeteer prerender | Stack replaced by Next.js App Router with static generation |
| `05-pending-items.md` | Open decisions and a May 1, 2026 launch schedule | Both the schedule and most items are resolved; live open items are in `07-status.md` |
| `06-design-system.md` | Colour, type, layout, and the animation choreography | Visual language carried forward into `02-architecture.md`; the animation system is gone |
| `07-overhaul-build-plan.md` | The 13-phase plan for the Vite → Next.js rebuild | Every phase has now run; outcomes recorded in `07-status.md` |
| `08-overhaul-reference.md` | Sitemap, per-page content, pricing table, SEO targets, migration map | Absorbed into the current `02`/`03`/`04` |
| `09-handoff-status.md` | Build state as of July 2026 | Superseded by `07-status.md`; its Aug-1 checklist has since been executed |

## Two things worth knowing before you read any of it

- **The gear-shift metaphor was real, and it's gone.** `02` and `06` describe an
  elaborate scroll-driven H-pattern shifter with three transition types. That
  entire layer was deleted in the rebuild. If you find a document enthusing
  about `useShiftTransition`, `ScrollTrigger`, or `window.__PRERENDER__`, you
  are reading history.
- **Prices in these files are wrong.** They describe the pre-August-1 offering
  ($90 / $240 / $400, group $90–$180). Current pricing is in
  `03-content-and-pricing.md`.

The client brief that drove the rebuild
(`../Clutch_Academy_Website_Revamp_Brief_July2026.pdf`) is a source document,
not a spec, and stays in the parent folder.
