import { useEffect, useRef } from 'react'
import { gsap, MOTION_OK } from '@/lib/gsap'
import { EASE_SHIFT } from '@/lib/motion'
import { BOTTOM, PLANE, TOP, X, Y, along, route } from './gate.js'

// The gear shifter's H-pattern, in the dash at the bottom right of the
// window (docs/spec/hero-drive.md §HUD): six forward
// gates and reverse, a fourth slot top left, so it reads R 1 2 3 4 5 6 left
// to right. A knob sits in the current gear and travels there the way a hand
// moves a lever, by the same rule as the About page's shift gate
// (ShiftGate.jsx): back onto the neutral plane, across it, into the slot,
// slow at both ends and quick through the middle. A change that comes while
// the knob is still travelling sets off from wherever it's got to. Under
// reduced motion the knob just arrives.
//
// All of it is decoration for sighted drivers; the dash is aria-hidden.

const SPEED = 180 // units a second along the gate
const MIN = 0.16 // s: the shortest change, so a one-slot flick still reads

const LABELS = ['R', '1', '2', '3', '4', '5', '6']

export default function GearGate({ gear }) {
  const knob = useRef(null)
  const at = useRef({ x: X.N, y: PLANE })

  useEffect(() => {
    const el = knob.current
    const place = (p) => {
      at.current = p
      el?.setAttribute('transform', `translate(${p.x} ${p.y})`)
    }
    // From wherever the knob is: a change mid-travel sets off from there.
    const path = route(at.current, gear)
    const { total, to } = path

    let moved = false
    // Reverting a tween renders it back at its start with its callbacks on,
    // so without this the knob would jump back to where this route began
    // (N, for a drive's first) every time the gear changed.
    let live = true
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      if (!total) return
      moved = true
      const travel = { d: 0 }
      gsap.to(travel, {
        d: total,
        duration: Math.max(MIN, total / SPEED),
        ease: EASE_SHIFT,
        onUpdate: () => live && place(along(path, travel.d)),
      })
      // Reduced motion switched on mid-travel: straight into the gear.
      return () => live && place(to)
    })
    if (!moved) place(to)
    // A new gear, landed or not: stop the knob where it is, and the next
    // run sets off from there.
    return () => {
      live = false
      mm.revert()
    }
  }, [gear])

  return (
    <svg className="gate" viewBox="0 0 90 62" aria-hidden="true" focusable="false">
      <g className="gate__lines">
        <path d={`M${X.R} ${PLANE}H${X[5]}`} />
        <path d={`M${X.R} ${TOP}V${PLANE}`} />
        {[1, 3, 5].map((g) => (
          <path key={g} d={`M${X[g]} ${TOP}V${BOTTOM}`} />
        ))}
      </g>
      {LABELS.map((g) => (
        <text
          key={g}
          className={`gate__label${g === gear ? ' gate__label--on' : ''}`}
          x={X[g]}
          y={Y[g] === TOP ? TOP - 5 : BOTTOM + 11}
        >
          {g}
        </text>
      ))}
      <circle ref={knob} className="gate__knob" r="5" transform={`translate(${X.N} ${PLANE})`} />
    </svg>
  )
}
