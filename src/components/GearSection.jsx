import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GearIndicator from './GearIndicator'
import './GearSection.css'

/**
 * Alignment positions mapped to gear numbers.
 * Each gear's content anchors to its H-pattern position.
 */
const POSITION_MAP = {
  1: 'top-left',
  2: 'bottom-left',
  3: 'top-center',
  4: 'bottom-center',
  5: 'top-right',
  6: 'bottom-right',
  R: 'center',
}

const SHIFT_DISTANCE = '+=100%'

export default function GearSection({ gear, id, isLast = false, children }) {
  const sectionRef = useRef()
  const contentRef = useRef()
  const indicatorRef = useRef()
  const position = POSITION_MAP[gear] || 'center'

  useGSAP(
    () => {
      const prefersReduced = window
        .matchMedia('(prefers-reduced-motion: reduce)')
        .matches

      if (prefersReduced) return

      if (isLast) {
        // Reverse section doesn't slide its content out — it releases to the footer.
        return
      }

      // Same-column shift (Type A) — default for all gears until steps 8/9
      // override 2→3, 4→5, and 6→R with specialized timelines.
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: SHIFT_DISTANCE,
          scrub: true,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      })
        .to(contentRef.current, { yPercent: -100, ease: 'power2.inOut' }, 0)
        .to(indicatorRef.current, { yPercent: -100, opacity: 0, ease: 'power2.inOut' }, 0)
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
      <div ref={indicatorRef} className="gear-section__indicator-wrap">
        <GearIndicator gear={gear} position={position} />
      </div>
      <div ref={contentRef} className="gear-section__content">
        {children}
      </div>
    </section>
  )
}
