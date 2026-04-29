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
const SHIFT_DISTANCE_SAME_COLUMN = '+=40%'
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
          // Outgoing exits 0→50→150 yPercent and 0→-100 xPercent.
          // Incoming mirrors the camera path from (xPercent:100, yPercent:-150)
          // back to (0, 0).
          //
          // The incoming section's <section> sits far down the document, so
          // its `position: absolute` content can't be animated in viewport
          // coordinates by default. We mirror the outgoing's pin by adding
          // a CSS class to the incoming content for the scroll range — that
          // class flips it to `position: fixed` so transforms read against
          // the viewport, just like the outgoing section's own pin.
          const nextContent = document.querySelector(
            `[data-gear-content="${gear + 1}"]`
          )

          if (nextContent) gsap.set(nextContent, { xPercent: 100, yPercent: -150 })

          const tl = gsap.timeline({
            scrollTrigger: {
              ...scrollTrigger,
              toggleClass: nextContent
                ? {
                    targets: nextContent,
                    className: 'gear-section__content--pinned',
                  }
                : undefined,
            },
          })

          // Beat 1 — down. Outgoing drops 50%; incoming drops from -150 to -100.
          tl.to(contentRef.current, { yPercent: 50, ease: 'power2.out', duration: 0.33 }, 0.2)
          if (nextContent) tl.to(nextContent, { yPercent: -150, ease: 'power2.out', duration: 0.33 }, 0.2)

          // Beat 2 — across. Outgoing slides off-left; incoming slides from right to center.
          tl.to(contentRef.current, { xPercent: -100, ease: 'power2.out', duration: 0.33 }, 0.55)
          if (nextContent) tl.to(nextContent, { xPercent: 0, ease: 'power2.out', duration: 0.33 }, 0.55)

          // Beat 3 — outgoing drops and fades; incoming drops from -100 to 0.
          tl.to(contentRef.current, { yPercent: 150, opacity: 0, ease: 'power2.out', duration: 0.3 }, 0.9)
          if (nextContent) tl.to(nextContent, { yPercent: 0, ease: 'power2.out', duration: 0.3 }, 0.9)

          return
        }

        if (isReverseShift) {
          // Type C — signature Reverse shift, three-beat motion:
          //   1. Section 6 grows + softly fades (stays visible).
          //   2. It slides off to the right.
          //   3. It drops down and out, completing the fade.
          // Reverse section eases in with a gentle scale while that happens.
          const nextContent = document.querySelector('[data-gear-content="R"]')

          if (nextContent) gsap.set(nextContent, { scale: 0.94, opacity: 0 })

          const tl = gsap.timeline({ scrollTrigger })

          // Beat 1 — grow + partial fade (not gone, just softened).
          tl.to(contentRef.current, { scale: 0.9, opacity: 0.55, ease: 'power2.out', duration: 0.3 }, 0)

          // Beat 2 — slide to the right, off the viewport.
          tl.to(contentRef.current, { xPercent: 50, ease: 'power2.inOut', duration: 0.28 }, 0.32)

          // Beat 3 — drop down and finish the fade.
          tl.to(contentRef.current, { yPercent: 120, opacity: 0, ease: 'power2.in', duration: 0.3 }, 0.62)

          // Reverse enters during beats 2-3, settling into place.
          if (nextContent) {
            tl.to(nextContent, { scale: 1, opacity: 1, ease: 'power2.out', duration: 0.55 }, 0.4)
          }

          return
        }

        // Type A — same-column shift. The pin reserves scroll budget for the
        // "shift moment" but the section sits still during the pin, then
        // scrolls out as one unit when the pin releases.
        gsap.timeline({ scrollTrigger })
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

          if (nextContent) gsap.set(nextContent, { opacity: 0 })

          const tl = gsap.timeline({ scrollTrigger })

          tl.to(contentRef.current, { scale: 1.2, opacity: 0, ease: 'expo.in', duration: 0.5 }, 0)

          if (nextContent) tl.to(nextContent, { opacity: 1, ease: 'power2.out', duration: 0.5 }, 0.5)

          return
        }

        // Every upshift — including H-crossings — is a fast upward slide.
        gsap
          .timeline({ scrollTrigger })
          .to(contentRef.current, { yPercent: -100, ease: 'power2.inOut' }, 0)
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
