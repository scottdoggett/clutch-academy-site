'use client'

import { gsap, ScrollTrigger, SplitText } from './gsap'

// The motion system from docs/spec/08-motion.md: the values every animation
// uses, and one builder per animation type. Markup opts in with
// data-anim="<type>"; SiteMotion finds those elements and calls
// applyMotion(). Nothing outside this file should pick its own duration,
// ease or distance.
//
// Every tween, trigger and split is created inside SiteMotion's
// gsap.matchMedia() context, so its revert (route change, or the reduced-
// motion setting flipping on) puts every element back as the server rendered
// it. The builders don't need cleanup of their own.

// ---------- Values (08 §Values) ----------------------------------------
export const EASE_IN = 'power3.out' // every entrance: letting the clutch out
export const EASE_SHIFT = 'power2.inOut' // between two resting states: the shift gate's cubic
export const DUR_QUICK = 0.3
export const DUR_BASE = 0.6
export const DUR_SLOW = 0.9
export const STAGGER_TIGHT = 0.06
export const STAGGER_BASE = 0.1
export const STAGGER_CAP = 0.5
export const RISE = 24
export const RISE_SMALL = 16 // below 768px
// As soon as an element's top is 5% into the viewport. Any later and a fast
// scroll (or a short phone screen) outruns it: the reader is already looking
// at the space where the content will be.
export const START = 'top 95%'
export const DRIFT = 40 // total px of travel, split either side of rest

// The breakpoint conditions every run of the system is built under. SiteMotion
// hands these to gsap.matchMedia(); a type reads them to size itself.
export const CONDITIONS = {
  motion: '(prefers-reduced-motion: no-preference)',
  small: '(max-width: 767px)',
  desktop: '(hover: hover) and (min-width: 1024px)',
}

const CLEAR = 'opacity,visibility,transform'

const delayOf = (el) => Number(el.dataset.animDelay) || 0

// When each section's first animation fired, in ticker seconds.
const sectionStart = new WeakMap()

// data-anim-delay is measured from the moment the element's *section* started
// animating, not from when the element itself reached the line. So when a
// whole section enters together (a tall desktop viewport, a jump to an
// anchor) its pieces still come in in order, but an element scrolled to
// later (every element on a phone, where they arrive one at a time) starts
// the moment it's seen instead of waiting out a delay it no longer needs.
function waitFor(el) {
  const section = el.closest('section') || el
  const now = gsap.ticker.time
  if (!sectionStart.has(section)) sectionStart.set(section, now)
  return Math.max(0, sectionStart.get(section) + delayOf(el) - now)
}

// Plays `play(wait)` once, the first time el reaches START (rule 2: reveal
// once). Returns the trigger.
const whenSeen = (el, play) =>
  ScrollTrigger.create({
    trigger: el,
    start: START,
    once: true,
    onEnter: () => play(waitFor(el)),
  })

// A from() tween waiting for its trigger. immediateRender is explicit because
// a paused from() otherwise leaves the element in its finished state until it
// plays, so content would show, vanish when seen, then animate back in.
const HELD = { paused: true, immediateRender: true }

// Start a HELD tween when its element is seen. restart(true) honours the
// delay just set.
const revealOnSee = (el, tween) =>
  whenSeen(el, (wait) => tween.delay(wait).restart(true))

// Per-item stagger, shrunk so a long group never takes longer than the cap.
const staggerFor = (count, each) =>
  count > 1 ? Math.min(each, STAGGER_CAP / (count - 1)) : 0

// ---------- Types (08 §Animation types) ---------------------------------

function rise(el, { small }) {
  const tween = gsap.from(el, {
    autoAlpha: 0,
    y: small ? RISE_SMALL : RISE,
    duration: DUR_BASE,
    ease: EASE_IN,
    clearProps: CLEAR,
    ...HELD,
  })
  revealOnSee(el, tween)
}

function stagger(el, { small }) {
  const items = Array.from(el.children)
  if (!items.length) return
  const each = staggerFor(
    items.length,
    el.dataset.animStagger === 'tight' ? STAGGER_TIGHT : STAGGER_BASE,
  )
  const hidden = { autoAlpha: 0, y: small ? RISE_SMALL : RISE }
  const shown = {
    autoAlpha: 1,
    y: 0,
    duration: DUR_BASE,
    ease: EASE_IN,
    stagger: each,
    clearProps: CLEAR,
    overwrite: true,
  }
  gsap.set(items, hidden)

  // batch(): items that cross the line together animate together, so a long
  // list reveals row by row instead of every item waiting on the first.
  ScrollTrigger.batch(items, {
    start: START,
    once: true,
    onEnter: (batch) => gsap.to(batch, { ...shown, delay: waitFor(el) }),
  })
}

function headline(el) {
  let seen
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    onSplit(self) {
      // Masks clip at the line box, and these headings run line-height ~1,
      // so descenders (the g in "Saying") would be cut off mid-animation.
      // The padding makes room; the negative margin gives the space back.
      gsap.set(self.masks, { paddingBottom: '0.14em', marginBottom: '-0.14em' })
      const tween = gsap.from(self.lines, {
        yPercent: 110,
        duration: DUR_SLOW,
        ease: EASE_IN,
        stagger: STAGGER_TIGHT,
        ...HELD,
        // Hand back the original markup once the heading has landed.
        onComplete: () => self.revert(),
      })
      // autoSplit re-runs this on resize; one trigger per split, not a pile.
      seen?.kill()
      seen = revealOnSee(el, tween)
      return tween
    },
  })
}

function draw(el) {
  // Grows from the left edge (the origin is set in motion.css). GSAP writes
  // the computed transform-origin inline whenever it transforms, and
  // clearProps: 'transform' leaves that behind, so this clears everything.
  // Safe because a drawn line is a bare decorative element with no inline
  // styles of its own.
  const tween = gsap.from(el, {
    scaleX: 0,
    duration: DUR_SLOW,
    ease: EASE_SHIFT,
    clearProps: 'all',
    ...HELD,
  })
  revealOnSee(el, tween)
}

function settle(el) {
  const img = el.querySelector('img') || el
  // data-anim-lcp: the page's Largest Contentful Paint never starts
  // invisible (08 §The hero), so it gets the scale without the fade.
  const lcp = el.dataset.animLcp !== undefined
  const tween = gsap.from(img, {
    scale: 1.06,
    ...(lcp ? {} : { autoAlpha: 0 }),
    duration: DUR_SLOW,
    ease: EASE_IN,
    clearProps: CLEAR,
    ...HELD,
  })
  revealOnSee(el, tween)
}

function drift(el, { desktop }) {
  // Desktop only (08 §Drift).
  if (!desktop) return
  const img = el.querySelector('img') || el
  // Scaled up just enough that the travel never shows the frame's edge.
  gsap.set(img, { scale: 1.1 })
  gsap.fromTo(
    img,
    { y: -DRIFT / 2 },
    {
      y: DRIFT / 2,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    },
  )
}

const TYPES = { rise, stagger, headline, draw, settle, drift }

// Set up every [data-anim] inside root.
export function applyMotion(root, { small = false, desktop = false } = {}) {
  root.querySelectorAll('[data-anim]').forEach((el) => {
    TYPES[el.dataset.anim]?.(el, { small, desktop })
  })
}

// ---------- The hero (08 §The hero) -------------------------------------
// Above the fold, so it plays on load, not on scroll. On a first page load
// src/styles/motion.css has already put the pieces in their starting states
// before first paint (html[data-motion="ok"], set by MOTION_PREPAINT in
// src/lib/motionPrepaint.js); this
// takes over from exactly those states, so there's no flash.
//
// Markup: [data-hero-root] around the hero, and data-hero="eyebrow" |
// "headline" | "sub" | "ctas" | "photo" | "caption" on its pieces.
//
// The headline and photo are the LCP candidates, so neither ever goes
// transparent: the headline only travels, the photo only scales. The CTAs
// fade on opacity alone (not autoAlpha), so they stay clickable the whole
// time (rule 10).
//
// When it finishes, the hero is marked settled (settleHero below).
export function playHero(root, { small = false } = {}) {
  const q = (name) => root.querySelector(`[data-hero="${name}"]`)
  const rise = small ? RISE_SMALL : RISE
  const eyebrow = q('eyebrow')
  const headline = q('headline')
  const sub = q('sub')
  const ctas = q('ctas')
  const photo = q('photo')?.querySelector('img')
  const caption = q('caption')

  const tl = gsap.timeline({
    defaults: { ease: EASE_IN, duration: DUR_BASE },
    onComplete: () => settleHero(root),
  })
  if (eyebrow)
    tl.fromTo(eyebrow, { autoAlpha: 0, y: rise }, { autoAlpha: 1, y: 0, duration: DUR_QUICK }, 0)
  if (headline) tl.fromTo(headline, { y: rise }, { y: 0, duration: DUR_SLOW }, 0.1)
  if (photo) tl.fromTo(photo, { scale: 1.06 }, { scale: 1, duration: DUR_SLOW }, 0.1)
  if (sub) tl.fromTo(sub, { autoAlpha: 0, y: rise }, { autoAlpha: 1, y: 0 }, 0.35)
  if (ctas)
    tl.fromTo(
      ctas.children,
      { opacity: 0, y: rise },
      { opacity: 1, y: 0, stagger: 0.08 },
      0.35,
    )
  if (caption) tl.fromTo(caption, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.55)
  return tl
}

// The hero's entrance is over, or was never going to play. The hero's
// traffic (src/components/hero/HeroStage.jsx) waits for this before it
// fades in, so only one thing moves at a time (rule 3). The attribute is
// for a listener that arrives after the event.
export const HERO_SETTLED = 'hero:settled'

export function settleHero(root) {
  root.setAttribute('data-hero-settled', '')
  root.dispatchEvent(new Event(HERO_SETTLED))
}
