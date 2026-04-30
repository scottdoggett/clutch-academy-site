import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GearIndicator from './GearIndicator'
import './GearSection.css'

const POSITION_MAP = {
  1: 'top-left',
  2: 'bottom-left',
  3: 'top-center',
  4: 'bottom-center',
  5: 'top-right',
  6: 'bottom-right',
  R: 'center',
}

// Each gear declares its animation roles. A gear can have multiple roles
// (gear 3 is both an H-crossing entry receiver AND a same-column exit on
// its way to gear 4). Each role gets its own self-contained ScrollTrigger
// in the setup functions below — no more branching `if` ladders inside a
// single ScrollTrigger.
const ANIMATION_ROLES = {
  1: ['sameColumnExit'],
  2: ['hCrossingExit'],
  3: ['hCrossingEntry', 'sameColumnExit'],
  4: ['hCrossingExit'],
  5: ['hCrossingEntry', 'sameColumnExit'],
  6: ['reverseExit'],
  R: [],
}

// THIS IS FOR DEVELOPMENT THIS IS THE LINE TO CHANGE IF THERE IS ANIMATION OR NOT, CHANGE THIS >> TO no-preference
const DESKTOP_QUERY = '(min-width: 768px) and (prefers-reduced-motion: none)'
const MOBILE_QUERY = '(max-width: 767px) and (prefers-reduced-motion: none)'

// Shared pin options. Every desktop transition uses native GSAP pinning so
// the section is held in place during its animation and during pauses.
const PINNED_OPTS = {
  scrub: true,
  pin: true,
  pinSpacing: true,
  anticipatePin: 1,
}

// ---------- Desktop setup functions --------------------------------------

// Type A — same-column shift (1→2, 3→4, 5→6). Pin reserves a beat of
// scroll so the section sits still through the "shift moment", then
// scrolls out as one unit when the pin releases. No content motion.
function setupSameColumnExit(section) {
  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=20%',
      ...PINNED_OPTS,
    },
  })
}

// Type B exit — H-crossing exit (gear 2, gear 4). Pinned at top top of
// THIS section. Content animates out: drop → slide off-left → drop & fade.
function setupHCrossingExit(section, content) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=60%',
      ...PINNED_OPTS,
    },
  })

  tl.to(content, { yPercent: 50, ease: 'power2.out', duration: 0.33 }, 0.2)
    .to(content, { xPercent: -70, ease: 'power2.out', duration: 0.33 }, 0.55)
    .to(content, { yPercent: 150, opacity: 0, ease: 'power2.out', duration: 0.3 }, 0.9)
}

// Type B entry — H-crossing entry (gear 3, gear 5). Pinned at top BOTTOM
// of THIS section, i.e. the moment the section first peeks into the
// viewport from below. Content starts off-screen (upper-right) and is
// animated into the viewport as the user scrolls through the pin range.
//
// The initial offset transform is applied INSIDE the timeline (via .set
// at time 0) rather than via a top-level gsap.set. That keeps gear 3's
// content at its identity transform (filling its own section, which is
// below the fold) before the pin engages — otherwise the offset would
// place content into the viewport coordinate space of an earlier section
// and visually overlap it.
function setupHCrossingEntry(section, content) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: '+=60%',
      ...PINNED_OPTS,
      onToggle: (self) => {
        // When scrolling backward past the trigger's start, snap content
        // back to identity so it doesn't render its offscreen-up offset
        // over the previous section in document flow.
        if (!self.isActive && self.direction === -1) {
          gsap.set(content, { xPercent: 0, yPercent: 0 })
        }
      },
    },
  })

  tl.set(content, { xPercent: 50, yPercent: -200 }, 0)
    .to(content, { yPercent: -150, ease: 'power2.out', duration: 0.33 }, 0.2)
    .to(content, { xPercent: 0, ease: 'power2.out', duration: 0.33 }, 0.55)
    .to(content, { yPercent: -100, ease: 'power2.out', duration: 0.3 }, 0.9)
}

// Type C — Reverse shift (gear 6). Three-beat motion: gear 6 grows + soft
// fade, slides off right, drops down. Reverse section eases in over the
// last two beats.
function setupReverseExit(section, content) {
  const nextContent = document.querySelector('[data-gear-content="R"]')
  if (nextContent) gsap.set(nextContent, { scale: 0.94, opacity: 0 })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=110%',
      ...PINNED_OPTS,
    },
  })

  tl.to(content, { scale: 0.9, opacity: 0.55, ease: 'power2.out', duration: 0.3 }, 0)
    .to(content, { xPercent: 50, ease: 'power2.inOut', duration: 0.28 }, 0.32)
    .to(content, { yPercent: 120, opacity: 0, ease: 'power2.in', duration: 0.3 }, 0.62)

  if (nextContent) {
    tl.to(nextContent, { scale: 1, opacity: 1, ease: 'power2.out', duration: 0.55 }, 0.4)
  }
}

const SETUPS = {
  sameColumnExit: setupSameColumnExit,
  hCrossingExit: setupHCrossingExit,
  hCrossingEntry: setupHCrossingEntry,
  reverseExit: setupReverseExit,
}

// ---------- Mobile setup -------------------------------------------------

// Mobile collapses every transition into a fast upward slide. Reverse keeps
// its zoom-out + fade because the lateral sweep doesn't read on a phone.
function setupMobile(section, content, gear) {
  const isReverse = gear === 6
  const scrollTrigger = {
    trigger: section,
    start: 'top top',
    end: isReverse ? '+=75%' : '+=50%',
    ...PINNED_OPTS,
  }

  if (isReverse) {
    const nextContent = document.querySelector('[data-gear-content="R"]')
    if (nextContent) gsap.set(nextContent, { opacity: 0 })

    const tl = gsap.timeline({ scrollTrigger })
    tl.to(content, { scale: 1.2, opacity: 0, ease: 'expo.in', duration: 0.5 }, 0)
    if (nextContent) tl.to(nextContent, { opacity: 1, ease: 'power2.out', duration: 0.5 }, 0.5)
    return
  }

  gsap.timeline({ scrollTrigger })
    .to(content, { yPercent: -100, ease: 'power2.inOut' }, 0)
}

// ---------- Component ----------------------------------------------------

export default function GearSection({ gear, id, isLast = false, children }) {
  const sectionRef = useRef()
  const contentRef = useRef()
  const position = POSITION_MAP[gear] || 'center'

  useGSAP(
    () => {
      if (isLast) return

      const mm = gsap.matchMedia()

      mm.add(DESKTOP_QUERY, () => {
        const roles = ANIMATION_ROLES[gear] || []
        roles.forEach((role) => {
          const setupFn = SETUPS[role]
          if (setupFn) setupFn(sectionRef.current, contentRef.current)
        })
      })

      mm.add(MOBILE_QUERY, () => {
        setupMobile(sectionRef.current, contentRef.current, gear)
      })
    },
    { scope: sectionRef, dependencies: [gear, isLast] }
  )

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`gear-section gear-section--${position}`}
      data-gear={gear}
    >
      <div
        ref={contentRef}
        className="gear-section__content"
        data-gear-content={gear}
      >
        <GearIndicator gear={gear} position={position} />
        <div className="gear-section__inner">{children}</div>
      </div>
    </section>
  )
}
