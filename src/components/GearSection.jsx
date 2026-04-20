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

// Gears whose exit traverses the neutral gate (H-crossing: 2→3, 4→5).
const H_CROSSING_EXITS = new Set([2, 4])

// Scroll distance the section is pinned for. H-crossing and Reverse are longer
// than same-column to give their multi-beat motion room to read clearly.
const SHIFT_DISTANCE_SAME_COLUMN = '+=100%'
const SHIFT_DISTANCE_H_CROSSING = '+=150%'
const SHIFT_DISTANCE_REVERSE = '+=175%'

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function GearSection({ gear, id, isLast = false, children }) {
  const sectionRef = useRef()
  const contentRef = useRef()
  const indicatorRef = useRef()
  const position = POSITION_MAP[gear] || 'center'
  const isHCrossing = H_CROSSING_EXITS.has(gear)
  const isReverseShift = gear === 6

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      if (isLast) return

      const endDistance = isReverseShift
        ? SHIFT_DISTANCE_REVERSE
        : isHCrossing
          ? SHIFT_DISTANCE_H_CROSSING
          : SHIFT_DISTANCE_SAME_COLUMN

      const scrollTrigger = {
        trigger: sectionRef.current,
        start: 'top top',
        end: endDistance,
        scrub: true,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      }

      if (isHCrossing) {
        // H-crossing (Type B): three-segment motion down → left → down.
        // Outgoing slides down, then left, then continues left-and-down off-frame.
        // Incoming (next section's content) mirrors: up, right, up into place.
        const nextContent = document.querySelector(
          `[data-gear-content="${gear + 1}"]`
        )
        const nextIndicator = document.querySelector(
          `[data-gear-indicator="${gear + 1}"]`
        )

        if (nextContent) {
          gsap.set(nextContent, { yPercent: 100, xPercent: -100 })
        }
        if (nextIndicator) {
          gsap.set(nextIndicator, { yPercent: 100, xPercent: -100, opacity: 0 })
        }

        const tl = gsap.timeline({ scrollTrigger })

        // Segment 1 (0–0.33): outgoing down, incoming up (both along y).
        tl.to(contentRef.current, { yPercent: 50, ease: 'power2.out', duration: 0.33 }, 0)
          .to(indicatorRef.current, { yPercent: 50, ease: 'power2.out', duration: 0.33 }, 0)

        if (nextContent) {
          tl.to(nextContent, { yPercent: 50, ease: 'power2.out', duration: 0.33 }, 0)
        }
        if (nextIndicator) {
          tl.to(nextIndicator, { yPercent: 50, opacity: 1, ease: 'power2.out', duration: 0.33 }, 0)
        }

        // Tiny dwell at the neutral seam.
        tl.to({}, { duration: 0.02 })

        // Segment 2 (0.35–0.67): lateral glide across the neutral gate.
        tl.to(contentRef.current, { xPercent: -100, ease: 'power2.out', duration: 0.33 }, 0.35)
          .to(indicatorRef.current, { xPercent: -100, ease: 'power2.out', duration: 0.33 }, 0.35)

        if (nextContent) {
          tl.to(nextContent, { xPercent: 0, ease: 'power2.out', duration: 0.33 }, 0.35)
        }
        if (nextIndicator) {
          tl.to(nextIndicator, { xPercent: 0, ease: 'power2.out', duration: 0.33 }, 0.35)
        }

        tl.to({}, { duration: 0.02 })

        // Segment 3 (0.70–1.0): click into the new gear — outgoing continues down,
        // incoming settles up into place.
        tl.to(contentRef.current, { yPercent: 150, opacity: 0, ease: 'power2.out', duration: 0.3 }, 0.7)
          .to(indicatorRef.current, { yPercent: 150, opacity: 0, ease: 'power2.out', duration: 0.3 }, 0.7)

        if (nextContent) {
          tl.to(nextContent, { yPercent: 0, ease: 'power2.out', duration: 0.3 }, 0.7)
        }
        if (nextIndicator) {
          tl.to(nextIndicator, { yPercent: 0, ease: 'power2.out', duration: 0.3 }, 0.7)
        }

        return
      }

      if (isReverseShift) {
        // Type C — signature Reverse shift (6→R). Two beats: "push in", then
        // "right-and-down into place." Distinctly weightier than the upshifts.
        const nextContent = document.querySelector('[data-gear-content="R"]')
        const nextIndicator = document.querySelector('[data-gear-indicator="R"]')

        // Incoming (R) pre-positioned top-left and hidden so it can translate
        // right-and-down into its final center position during Beat 2.
        if (nextContent) {
          gsap.set(nextContent, { xPercent: -60, yPercent: -60, opacity: 0 })
        }
        if (nextIndicator) {
          gsap.set(nextIndicator, { xPercent: -60, yPercent: -60, opacity: 0 })
        }

        const tl = gsap.timeline({ scrollTrigger })

        // Beat 1 (0 – 0.43): outgoing section 6 pushes "into the screen" —
        // scale up and fade, as if the camera lurches forward to unlock reverse.
        tl.to(
          contentRef.current,
          { scale: 1.3, opacity: 0, ease: 'expo.in', duration: 0.43 },
          0
        ).to(
          indicatorRef.current,
          { scale: 1.3, opacity: 0, ease: 'expo.in', duration: 0.43 },
          0
        )

        // Beat 2 (0.43 – 1.0): Reverse section sweeps in from up-left, landing
        // center-screen. From the viewer's POV this reads as right-and-down.
        if (nextContent) {
          tl.to(
            nextContent,
            {
              xPercent: 0,
              yPercent: 0,
              opacity: 1,
              ease: 'power3.out',
              duration: 0.57,
            },
            0.43
          )
        }
        if (nextIndicator) {
          tl.to(
            nextIndicator,
            {
              xPercent: 0,
              yPercent: 0,
              opacity: 1,
              ease: 'power3.out',
              duration: 0.57,
            },
            0.43
          )
        }

        return
      }

      // Type A — same-column shift: straight vertical slide.
      gsap
        .timeline({ scrollTrigger })
        .to(contentRef.current, { yPercent: -100, ease: 'power2.inOut' }, 0)
        .to(
          indicatorRef.current,
          { yPercent: -100, opacity: 0, ease: 'power2.inOut' },
          0
        )
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
        ref={indicatorRef}
        className="gear-section__indicator-wrap"
        data-gear-indicator={gear}
      >
        <GearIndicator gear={gear} position={position} />
      </div>
      <div
        ref={contentRef}
        className="gear-section__content"
        data-gear-content={gear}
      >
        {children}
      </div>
    </section>
  )
}
