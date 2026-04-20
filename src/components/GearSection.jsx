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

// Desktop pin distances. H-crossing and Reverse are longer than same-column
// so their multi-beat motion has room to read clearly.
const SHIFT_DISTANCE_SAME_COLUMN = '+=100%'
const SHIFT_DISTANCE_H_CROSSING = '+=150%'
const SHIFT_DISTANCE_REVERSE = '+=175%'

// Mobile keeps every transition short and snappy — per spec, "fast upward slide."
const SHIFT_DISTANCE_MOBILE = '+=50%'
const SHIFT_DISTANCE_MOBILE_REVERSE = '+=75%'

const DESKTOP_QUERY = '(min-width: 768px) and (prefers-reduced-motion: no-preference)'
const MOBILE_QUERY = '(max-width: 767px) and (prefers-reduced-motion: no-preference)'

export default function GearSection({ gear, id, isLast = false, children }) {
  const sectionRef = useRef()
  const contentRef = useRef()
  const indicatorRef = useRef()
  const position = POSITION_MAP[gear] || 'center'
  const isHCrossing = H_CROSSING_EXITS.has(gear)
  const isReverseShift = gear === 6

  useGSAP(
    () => {
      if (isLast) return

      const mm = gsap.matchMedia()

      // --- Desktop / tablet (≥768px): full H-pattern choreography ---
      mm.add(DESKTOP_QUERY, () => {
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
          const nextContent = document.querySelector(
            `[data-gear-content="${gear + 1}"]`
          )
          const nextIndicator = document.querySelector(
            `[data-gear-indicator="${gear + 1}"]`
          )

          if (nextContent) gsap.set(nextContent, { yPercent: 100, xPercent: -100 })
          if (nextIndicator) gsap.set(nextIndicator, { yPercent: 100, xPercent: -100, opacity: 0 })

          const tl = gsap.timeline({ scrollTrigger })

          tl.to(contentRef.current, { yPercent: 50, ease: 'power2.out', duration: 0.33 }, 0)
            .to(indicatorRef.current, { yPercent: 50, ease: 'power2.out', duration: 0.33 }, 0)
          if (nextContent) tl.to(nextContent, { yPercent: 50, ease: 'power2.out', duration: 0.33 }, 0)
          if (nextIndicator) tl.to(nextIndicator, { yPercent: 50, opacity: 1, ease: 'power2.out', duration: 0.33 }, 0)

          tl.to({}, { duration: 0.02 })

          tl.to(contentRef.current, { xPercent: -100, ease: 'power2.out', duration: 0.33 }, 0.35)
            .to(indicatorRef.current, { xPercent: -100, ease: 'power2.out', duration: 0.33 }, 0.35)
          if (nextContent) tl.to(nextContent, { xPercent: 0, ease: 'power2.out', duration: 0.33 }, 0.35)
          if (nextIndicator) tl.to(nextIndicator, { xPercent: 0, ease: 'power2.out', duration: 0.33 }, 0.35)

          tl.to({}, { duration: 0.02 })

          tl.to(contentRef.current, { yPercent: 150, opacity: 0, ease: 'power2.out', duration: 0.3 }, 0.7)
            .to(indicatorRef.current, { yPercent: 150, opacity: 0, ease: 'power2.out', duration: 0.3 }, 0.7)
          if (nextContent) tl.to(nextContent, { yPercent: 0, ease: 'power2.out', duration: 0.3 }, 0.7)
          if (nextIndicator) tl.to(nextIndicator, { yPercent: 0, ease: 'power2.out', duration: 0.3 }, 0.7)

          return
        }

        if (isReverseShift) {
          // Type C — signature Reverse shift: push in, then right-and-down.
          const nextContent = document.querySelector('[data-gear-content="R"]')
          const nextIndicator = document.querySelector('[data-gear-indicator="R"]')

          if (nextContent) gsap.set(nextContent, { xPercent: -60, yPercent: -60, opacity: 0 })
          if (nextIndicator) gsap.set(nextIndicator, { xPercent: -60, yPercent: -60, opacity: 0 })

          const tl = gsap.timeline({ scrollTrigger })

          tl.to(contentRef.current, { scale: 1.3, opacity: 0, ease: 'expo.in', duration: 0.43 }, 0)
            .to(indicatorRef.current, { scale: 1.3, opacity: 0, ease: 'expo.in', duration: 0.43 }, 0)

          if (nextContent) {
            tl.to(nextContent, { xPercent: 0, yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.57 }, 0.43)
          }
          if (nextIndicator) {
            tl.to(nextIndicator, { xPercent: 0, yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.57 }, 0.43)
          }

          return
        }

        // Type A — same-column shift: straight vertical slide.
        gsap
          .timeline({ scrollTrigger })
          .to(contentRef.current, { yPercent: -100, ease: 'power2.inOut' }, 0)
          .to(indicatorRef.current, { yPercent: -100, opacity: 0, ease: 'power2.inOut' }, 0)
      })

      // --- Mobile (<768px): simplified shift mode ---
      // All three transition types collapse into a fast upward slide. The
      // Reverse shift keeps its "into the screen" beat (zoom + fade) but drops
      // the lateral sweep — incoming Reverse content simply settles.
      mm.add(MOBILE_QUERY, () => {
        const scrollTrigger = {
          trigger: sectionRef.current,
          start: 'top top',
          end: isReverseShift ? SHIFT_DISTANCE_MOBILE_REVERSE : SHIFT_DISTANCE_MOBILE,
          scrub: true,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        }

        if (isReverseShift) {
          const nextContent = document.querySelector('[data-gear-content="R"]')
          const nextIndicator = document.querySelector('[data-gear-indicator="R"]')

          if (nextContent) gsap.set(nextContent, { opacity: 0 })
          if (nextIndicator) gsap.set(nextIndicator, { opacity: 0 })

          const tl = gsap.timeline({ scrollTrigger })

          tl.to(contentRef.current, { scale: 1.2, opacity: 0, ease: 'expo.in', duration: 0.5 }, 0)
            .to(indicatorRef.current, { scale: 1.2, opacity: 0, ease: 'expo.in', duration: 0.5 }, 0)

          if (nextContent) tl.to(nextContent, { opacity: 1, ease: 'power2.out', duration: 0.5 }, 0.5)
          if (nextIndicator) tl.to(nextIndicator, { opacity: 1, ease: 'power2.out', duration: 0.5 }, 0.5)

          return
        }

        // Every upshift — including H-crossings — is a fast upward slide.
        gsap
          .timeline({ scrollTrigger })
          .to(contentRef.current, { yPercent: -100, ease: 'power2.inOut' }, 0)
          .to(indicatorRef.current, { yPercent: -100, opacity: 0, ease: 'power2.inOut' }, 0)
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
