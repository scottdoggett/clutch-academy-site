# 08 — Motion

How things move on the Clutch Academy site: the rules, the small set of
animation types every page draws from, and the values behind them.

✅ **DECIDED**, September 23, 2026. The rules, types and values were reviewed
on a throwaway motion lab page (since deleted) and approved as they stand. The
homepage is the first page built on them (§Homepage map); the other routes
adopt the same system when they get their motion pass.

GSAP is set up in `src/lib/gsap.js`. The API reference is the GSAP skills
(`gsap-core`, `gsap-scrolltrigger`, `gsap-react`, `gsap-plugins`); this file
decides *which* of those things the site uses and how.

## The idea

The site talks the way a good instructor talks to a nervous student (01 §Brand
voice). Motion has to say the same thing. A student's first lesson is about
smooth: easing the clutch out, no jerk, no stall. So the site moves like a
clean gear change. It starts gently, travels, and settles. It never bounces,
snaps or overshoots, because in a car those are the mistakes.

The About page's shift gate (`src/components/about/ShiftGate.jsx`) already
moves this way. Its lever takes a cubic ease-in-out: "slow at both ends and
quick through the middle is what a hand does on a gear lever". The rest of the
site takes its cue from that.

## Rules

1. **Content never waits on motion.** Every word and button is in the
   server-rendered HTML and fully usable before any script runs. Animations
   hide things only from JavaScript, only when motion is allowed, and only
   once they are about to play. The one exception is the hero, which has its
   own guarded mechanism (below).
2. **Reveal once.** Scroll reveals play the first time something enters the
   viewport and never again. Scrolling back up shows a page that is already
   there. Replaying on every pass is a show, and the site isn't one.
3. **One thing moving at a time.** In any one viewport, one group animates. A
   section's header finishes (or is well under way) before its cards start.
   Nothing new animates next to the reviews marquee, which is already moving.
4. **Short and small.** Reveals travel 24px or less and take 0.6s. Nothing on
   scroll takes longer than 0.9s. The whole hero entrance is done in 1.2s.
5. **Transform and opacity only.** Animate `x`, `y`, `scale`, `autoAlpha`,
   `clipPath`, never `width`, `height`, `top`, `margin` or `padding`. Layout
   properties cause jank and they cause layout shift (CLS).
6. **No scroll-jacking.** No pinning, no scrubbed content, no ScrollSmoother,
   no custom scroll. The page scrolls the way the device's own scrolling
   does. iOS Safari is a first-class target and this is where it breaks
   first. The one exception is driving the hero's black car
   (`hero-drive.md` §Driving the whole page): while a visitor drives, the
   page follows the car near the top and bottom of the window. It happens
   only during a drive the visitor started, which only desktop-class screens
   with a keyboard offer, so never on iOS Safari, and the visitor's own
   scroll always wins. Scott asked for it on September 24, 2026, knowing
   this rule.
7. **No new loops.** The reviews marquee, the shift gate's idle cycle and
   the homepage hero's traffic are the site's only ambient motion. The
   traffic (`hero-drive.md`) was signed off with the hero brief on September
   24, 2026. Anything else that repeats on its own needs sign-off first.
   The marquee also answers the hero's black car while someone drives it
   over the strip (`hero-drive.md` §The treadmill): it speeds up, slows or
   turns round under the car, then eases back to its drift. Scott asked for
   it on September 25, 2026.
8. **Reduced motion means none.** Everything goes inside
   `gsap.matchMedia().add(MOTION_OK, …)`. With `prefers-reduced-motion:
   reduce`, the handler never runs and the page is simply there. No
   fade-instead-of-slide fallbacks. Motion that starts itself never runs, so
   the hero's traffic is drawn parked. Motion a visitor starts on purpose
   still works: the hero's Drive button (`hero-drive.md`, from Phase 4), like
   the About page's shift gate following a pointer.
9. **Never animate a number's value.** Prices, step numbers and stats don't
   count up. A price flickering through other prices reads as uncertain, and
   the brand promises transparent pricing (01 §Positioning).
10. **Calls to action are clickable immediately.** A Book button can reveal,
    but it never blocks input, and it's never the last thing in a sequence.
11. **Feedback is CSS, entrances are GSAP.** Hover, focus and press states
    stay as CSS transitions on `--transition-reduced` (150ms), as they are
    now. GSAP is for entrances and the few scripted moments, not for
    `:hover`.
12. **No page transitions.** Route changes are instant. Each page's own
    entrances do the work.

## Values

These are constants in `src/lib/motion.js`, so no component invents its own.

| Token | Value | Use |
|---|---|---|
| `EASE_IN` | `power3.out` | Every entrance. Fast start, long soft landing: letting the clutch out. |
| `EASE_SHIFT` | `power2.inOut` | Moving between two resting states (cubic, the shift gate's curve). |
| `DUR_QUICK` | `0.3` | Small elements: eyebrows, links, single lines. |
| `DUR_BASE` | `0.6` | Default reveal. |
| `DUR_SLOW` | `0.9` | Headlines and photos. |
| `STAGGER_TIGHT` | `0.06` | Lines of a headline, list bullets. |
| `STAGGER_BASE` | `0.1` | Cards, steps, stats. |
| `STAGGER_CAP` | `0.5` | Maximum total stagger for any group. With more items, the per-item stagger shrinks. |
| `RISE` | `24` (px) | Default travel. `16` below 768px. |
| `START` | `top 95%` | ScrollTrigger start: as soon as an element's top is 5% into view. `top 85%` was tried first and was too late: on a phone, readers scrolled into blank space before anything appeared. |

Banned eases: `back`, `elastic`, `bounce`, and anything with overshoot. Linear
is only for the marquee.

## Animation types

Markup declares the type with a `data-anim` attribute, and one runtime applies
it (see Implementation). Six types cover the site. If something doesn't fit one
of them, the answer is usually that it shouldn't move.

### 1. Rise — `data-anim="rise"`

The default. The element fades in and travels up `RISE` px, `DUR_BASE`,
`EASE_IN`, on `START`, once.

For section headers, lead paragraphs, standalone buttons and links, and
footers of sections. If you're unsure, it's this.

### 2. Stagger — `data-anim="stagger"`

On a parent. Its direct children Rise in order, `STAGGER_BASE` apart, capped
at `STAGGER_CAP`. Uses `ScrollTrigger.batch()` so children that enter together
animate together and a long list doesn't wait on its first row.

For package cards, How It Works steps, "What to Expect" bullets
(`STAGGER_TIGHT`), About stats, and FAQ items.

### 3. Headline — `data-anim="headline"`

For section `h2`s only. SplitText splits the heading into lines inside masks,
and each line slides up out of its mask (`yPercent: 110 → 0`, a little past
100 so descenders start fully hidden), `DUR_SLOW`, `EASE_IN`, `STAGGER_TIGHT`
apart. It reads like the heading dropping into gear. The masks get
`0.14em` of bottom padding (and the same negative margin back), because
these headings run at line-height ~1 and the mask would otherwise clip the
descenders.

- Split `type: "lines"` only, with `mask: "lines"` and `autoSplit: true`, so a
  resize re-splits cleanly. Never split into characters: letter-by-letter is
  showy, and it breaks screen readers and ligatures.
- Keep SplitText's default `aria: "auto"` so the heading is read as one
  string. Never put this on a heading that contains a link.
- `revert()` the split when the animation completes, so the finished page has
  its original markup.

✅ **DECIDED:** every section `h2` gets Headline. The hero `h1` doesn't: it's
an LCP candidate, so it takes the hero timeline's transform-only rise instead
(§The hero).

### 4. Draw — `data-anim="draw"`

For lines, not boxes. `scaleX: 0 → 1` from the left edge, `DUR_SLOW`,
`EASE_SHIFT`. For the rules between How It Works step
numbers, and dividers like the reviews footer's top border. It shows the path
from one thing to the next, the way the step rules already imply.

### 5. Settle — `data-anim="settle"`

For photos. The image fades in while scaling from `1.06 → 1` inside its own
frame (the frame gets `overflow: hidden`, so the box never changes size),
`DUR_SLOW`, `EASE_IN`. The photo arrives and comes to rest. Used for Sam's
headshot and lesson-page photos. The homepage hero had a photo with Settle
until September 24, 2026.

### 6. Drift — `data-anim="drift"`

The only scrubbed type, and optional. A photo moves up to 40px vertically
against its frame as its section scrolls past. It's desktop only, `(hover:
hover) and (min-width: 1024px)`, and applies at most once per page. Decorative
parallax, never on text.

🟡 **RECOMMENDED:** available, but not used on the homepage. It is the one type
that ties motion to scroll position, which rule 6 otherwise rules out, so it's
allowed only on a picture, and only where a page has a photo band that suits
it.

## The hero

The hero is above the fold, so it can't use the scroll rules. There's nothing
to scroll into, and hiding it after hydration makes a visible flash (it paints,
disappears, then animates in).

- **Starting states come from CSS, set before first paint.** A one-line inline
  script in `<head>` (beside the Consent Mode bootstrap in `layout.jsx`) adds
  `motion-ok` to `<html>` when `prefers-reduced-motion` is not `reduce`. CSS
  under `.motion-ok .hero` sets the hero's starting states, and GSAP animates
  from there once it loads.
- **A failsafe CSS animation forces the final state after 1.5s**, so if GSAP
  never loads (blocked script, slow network) the hero still appears. This and
  rule 1 are why nothing else on the site hides content in CSS.
- **The LCP element never starts invisible.** Since the September 24 hero
  rebuild there's no photo, so the `h1` is the Largest Contentful Paint at
  every width. It stays at full opacity and rises 24px, transform only, with
  no mask, since a mask clips it out of view. Check with Lighthouse before and
  after.
- **Order:** eyebrow, then `h1`, then the line under it, then the buttons.
  One `gsap.timeline()`, `DUR_BASE` pieces overlapping by about half. Done in
  1.2s. `playHero()` still handles a photo and caption if a hero ever has
  them again.
- **The city behind the copy** (`hero-drive.md`) doesn't take part. The roads
  are server-rendered and simply there at first paint. The traffic fades in
  once, over `DUR_BASE`, after this timeline has finished, so only one thing
  moves at a time (rule 3). The timeline's `onComplete` calls `settleHero()`
  in `motion.js`, which marks the hero root `data-hero-settled` and
  dispatches `hero:settled`. SiteMotion calls it too when it skips a late
  hero. `HeroStage.jsx` waits for either, with the same 1.5s failsafe the CSS
  uses. Under reduced motion the cars are there from the start, parked. The
  Drive pill fades in with them, in the same moment.
- **Driving the black car** (`hero-drive.md` §HUD, built in Phases 4 and 5)
  is motion a visitor starts, so it still works under reduced motion (rule
  8). Its GSAP moments are all under `MOTION_OK`:
  - When driving starts, the gear display rises 8px and fades in over
    `DUR_QUICK` on `EASE_IN`. It fades on opacity, not `autoAlpha`, because
    it already has focus. Under reduced motion it's simply there.
  - The controls hint fades out over `DUR_BASE` after 4s. Under reduced
    motion it goes at 4s without the fade.
  - The knob travels the gear display's H-pattern on `EASE_SHIFT` by the
    shift gate's rule: back to neutral, across, into the slot. Under reduced
    motion it's in the new gear at once.
  - A grind shakes the gear display sideways for 0.3s (keyframes, each on
    `power2.out`), and the numeral turns black for 0.4s. It's the site's one
    shake, and it's allowed because a grind is a mistake. §The idea keeps
    jolts out everywhere else for the same reason. Under reduced motion the
    black numeral does the job alone.
  - The rev bar and the takeover ring aren't GSAP. The engine draws them
    every frame. Under reduced motion the ring doesn't grow; it shows at
    full size for its second.
  - The page following the car (rule 6's exception) isn't GSAP either. It
    has momentum: it keeps going for a moment after the car slows. Under
    reduced motion there's none, and the page moves only as far as the car
    does.
  - Tyre marks fade out over 5 to 10s, in the shader. They do under
    reduced motion too: they come from the visitor's own driving, and a
    slow fade isn't movement.

## Homepage map

What each section gets on the first pass:

| Section | Motion |
|---|---|
| Hero | The hero timeline above |
| What Students Are Saying | Header: Headline + Rise. The strip Rises as one block, and the cards don't stagger (rule 3, the marquee is already moving). Footer: its top border (`.reviews__rule`) Draws, then the footer Rises. |
| How It Works | Header: Headline + Rise. "What to Expect" bullets: Stagger (tight). The steps' top border (`.steps__divider`) Draws, the steps Stagger, and each step's rule Draws as its number lands. |
| Straightforward pricing | Header: Headline + Rise. Cards: Stagger, after the header. "Compare every lesson option" link: Rise. |
| Meet Your Instructor | Headshot (both the desktop and phone copies): Settle. Heading, name, role and bio: Rise, in that order. Stats: Stagger. Buttons: Rise. |

Order within a section comes from `data-anim-delay` (seconds): the eyebrow and
heading start together, the lead follows at 0.3, and whatever comes after the
header starts at 0.35–0.4. Look at an existing section before picking new
numbers.

A delay counts from when the element's **section** started animating, not
from when the element itself was seen. When a section enters all at once (a
tall desktop screen, a jump to `#packages`), its pieces come in in order. When
an element is scrolled to later, which is how every element arrives on a
phone, its delay has already elapsed and it starts the moment it's seen. The
first version counted from the element, and on phones every delay became dead
time on top of a late trigger.

## Implementation

- **One runtime, declared in markup.** A single client component
  (`src/components/motion/SiteMotion.jsx`, mounted once in `layout.jsx`) finds
  every `[data-anim]` in `<main>` and applies its type from
  `src/lib/motion.js`. Options go in attributes too: `data-anim-delay`
  (seconds), `data-anim-stagger="tight"`, `data-anim-lcp` (Settle without the
  fade). Sections stay server components, and they opt in with an
  attribute rather than each becoming a `'use client'` file with its own GSAP
  code. The hero and anything else genuinely one-off gets its own small client
  component, and still uses the tokens.
- **Re-run per route.** `useGSAP` keyed on `usePathname()` with
  `revertOnUpdate: true`, so each navigation tears down the last page's
  triggers and sets up the new one's.
- **Everything inside `gsap.matchMedia()`**, with `MOTION_OK` and the
  breakpoint conditions (`RISE` is 16px below 768px). `mm.revert()` on
  cleanup.
- **`gsap.from()` with `immediateRender`** for scroll reveals, so the hidden
  starting state is applied only to elements the runtime has claimed.
  `clearProps` on complete leaves no inline styles behind.
- **Refresh once fonts are in.** `next/font` can shift line heights after the
  first measurement, so call `ScrollTrigger.refresh()` after
  `document.fonts.ready`.
- **Borders that Draw become elements.** A CSS `border-top` can't scale on
  its own, so a border that should Draw is a 1px element with a background
  instead (`.reviews__rule`, `.steps__divider`).
- **Photos that Settle sit in a frame.** The frame owns the border and corners
  and has `overflow: hidden` (set in `src/styles/motion.css`), so the image
  scales inside it and the box never changes size.
- **Draw's origin is in CSS** (`src/styles/motion.css`). Setting it from GSAP
  left an inline `transform-origin` behind that `clearProps` wouldn't remove.
- **The hero's pre-paint script** is `MOTION_PREPAINT` in
  `src/lib/motionPrepaint.js`, inlined first in `<body>`. It sets
  `data-motion` on `<html>`, which is why `<html>` carries
  `suppressHydrationWarning`.
- **Don't animate the fixed nav**, the consent banner or the Calendly popup.
  The nav's height is a token every page reserves, and the other two belong to
  scripts that aren't ours.
- **One set of values.** The single-page layout's old transition tokens were
  deleted from `tokens.css` when `motion.js` landed. `--transition-reduced`
  (150ms) stays, for hover and focus feedback only.

## Checks before a motion change ships

- DevTools → Rendering → emulate `prefers-reduced-motion: reduce`: the page is
  complete and nothing moves (except the marquee's static fallback).
- Disable JavaScript: every section's content is visible.
- Jump to the bottom (End key) and to `#packages` from the hero button:
  everything passed over has finished, and nothing sits hidden.
- Resize across 768px and 1024px mid-page: no hidden or half-split headings.
- Lighthouse on `/`: LCP and CLS no worse than before the change.
- A real iPhone in Safari (already a pre-launch requirement in `07-status.md`).
