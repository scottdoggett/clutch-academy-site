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

export default function GearSection({ gear, id, children }) {
  const sectionRef = useRef()
  const position = POSITION_MAP[gear] || 'center'

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) return

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom top',
      pin: true,
      pinSpacing: true,
    })
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`gear-section gear-section--${position}`}
      data-gear={gear}
    >
      <GearIndicator gear={gear} position={position} />
      <div className="gear-section__content">
        {children}
      </div>
    </section>
  )
}
