'use client'

import { useEffect, useRef } from 'react'

// The About page's shift gate. Every visual is in src/app/about/about.css
// alongside the rest of the .about-why block; what lives here is the pointer
// tracking and the lever's travel, neither of which CSS can express:
//
//   - A gear change has to travel down its slot, along the neutral plane, and
//     up the next slot. :has() interpolates a straight line between two
//     states, so 1 → 3 cut across the plate.
//   - Hovering the six <li> left dead ground between them — the gaps, and the
//     plate band itself. The six regions below tile the whole gate instead, so
//     the lever is always in whichever gear the pointer is in.
//
// With no pointer in the gate the lever drives itself, taking the next gear
// every few seconds down the same routes and on the same curve, so the section
// demonstrates what it does before anyone touches it.
//
// Motion-gated like the reviews marquee: with prefers-reduced-motion the lever
// still follows the pointer, it just arrives instead of travelling, and it
// never cycles on its own — an unprompted animation on a loop is the exact
// thing that setting asks for less of.

// Average travel speed along the plate, px/s — this sets the duration, and the
// easing redistributes it inside that. Long shifts take longer than short
// ones, which is what keeps a flick from 1 to 2 from feeling sluggish.
// Was 1500, then 1200; eased down so the travel between gears is legible as
// travel rather than a jump.
const SPEED = 1000

// Floor on a shift, ms. Without it the shortest move — one slot, no crossing —
// is over before the eye registers a direction.
const MIN_MS = 230

// Distance in px under which two positions count as the same point.
const EPS = 0.5

// How long the lever rests in a gear before taking the next one, unattended.
const IDLE_MS = 3000

// Out of the detent, across the plane, into the next detent. Slow at both ends
// and quick through the middle is what a hand does on a gear lever, and it is
// the whole difference between this and the constant-speed version.
const ease = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export default function ShiftGate({ gears }) {
  const gateRef = useRef(null)
  const plateRef = useRef(null)
  const knobRef = useRef(null)

  useEffect(() => {
    const gate = gateRef.current
    const plate = plateRef.current
    const knob = knobRef.current
    if (!gate || !plate || !knob) return

    // Touch has no hover to track; the lever stays parked in neutral there.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const items = Array.from(gate.querySelectorAll('.about-why__item'))
    const chip = gate.querySelector('.about-why__chip')

    // Plate-local coordinates, origin at the centre of the plate — which is
    // also neutral, so the resting position is {0, 0} and needs no measuring.
    const geom = { live: false, slotX: 0, gearY: 0 }
    const measure = () => {
      // Below the gate's breakpoint the plate is display:none and the list is
      // a plain stack. There is no lever to move and nothing to point at, so
      // the pointer stops being tracked at all — otherwise a narrow desktop
      // window gets chips growing and inverting under the cursor with no gate
      // to justify it.
      geom.live = plate.clientWidth > 0
      // Slots sit at 1/6, 3/6 and 5/6 of the plate, so the outer two are a
      // third of the width either side of centre.
      geom.slotX = plate.clientWidth / 3
      // All the way into the gear: the lever's resting place is the centre of
      // the chip, where the number hides it. The chips sit immediately outside
      // the band, so that is half the band plus half a chip.
      geom.gearY = plate.clientHeight / 2 + (chip?.offsetHeight ?? 44) / 2
    }

    // -1 is neutral; otherwise an index into `gears`, laid out column by
    // column: 0,1 in the first slot, 2,3 in the second, 4,5 in the third.
    let target = -1
    const targetPoint = () =>
      target < 0
        ? { x: 0, y: 0 }
        : {
            x: (Math.floor(target / 2) - 1) * geom.slotX,
            y: target % 2 === 0 ? -geom.gearY : geom.gearY,
          }

    const cur = { x: 0, y: 0 }

    const paint = () => {
      knob.style.setProperty('--knob-dx', `${cur.x}px`)
      knob.style.setProperty('--knob-dy', `${cur.y}px`)
    }

    // The lever seats when it arrives, not when the pointer does — that is the
    // beat the gear lights up on, so the two read as one action.
    const seat = () => {
      if (target >= 0) items[target]?.classList.add('about-why__item--seated')
    }

    // The route from wherever the lever is to wherever it's going. Off the
    // neutral plane the only legal move is back onto it, and only from there
    // can it cross to another slot — the whole H-pattern, in four lines.
    let legs = []
    let total = 0
    let startedAt = 0
    let duration = 0

    const plot = () => {
      const tgt = targetPoint()
      const pts = [{ x: cur.x, y: cur.y }]
      if (Math.abs(cur.x - tgt.x) > EPS) {
        if (Math.abs(cur.y) > EPS) pts.push({ x: cur.x, y: 0 })
        pts.push({ x: tgt.x, y: 0 })
      }
      pts.push(tgt)

      legs = []
      total = 0
      for (let i = 1; i < pts.length; i++) {
        const len = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
        if (len < EPS) continue
        legs.push({ from: pts[i - 1], to: pts[i], len })
        total += len
      }
      duration = Math.max(MIN_MS, (total / SPEED) * 1000)
    }

    const at = (travelled) => {
      let left = travelled
      for (const leg of legs) {
        if (left <= leg.len) {
          const f = leg.len ? left / leg.len : 1
          return {
            x: leg.from.x + (leg.to.x - leg.from.x) * f,
            y: leg.from.y + (leg.to.y - leg.from.y) * f,
          }
        }
        left -= leg.len
      }
      const last = legs[legs.length - 1]
      return last ? last.to : { x: cur.x, y: cur.y }
    }

    let raf = 0

    const tick = (now) => {
      raf = 0
      const t = duration ? Math.min((now - startedAt) / duration, 1) : 1
      const point = at(ease(t) * total)
      cur.x = point.x
      cur.y = point.y
      paint()
      if (t >= 1) {
        seat()
        return
      }
      raf = requestAnimationFrame(tick)
    }

    const run = () => {
      plot()
      if (!total) {
        seat()
        return
      }
      if (reduced.matches) {
        const tgt = targetPoint()
        cur.x = tgt.x
        cur.y = tgt.y
        paint()
        seat()
        return
      }
      if (raf) cancelAnimationFrame(raf)
      startedAt = performance.now()
      raf = requestAnimationFrame(tick)
    }

    const setTarget = (next) => {
      if (next === target) return
      items[target]?.classList.remove(
        'about-why__item--active',
        'about-why__item--seated',
      )
      items[next]?.classList.add('about-why__item--active')
      target = next
      run()
    }

    // Which of the six regions the pointer is in. Columns split at the
    // midpoints between slots, rows at the neutral plane, so the six tile the
    // gate edge to edge — there is nowhere inside it that selects nothing.
    const onMove = (e) => {
      if (!geom.live) return
      idle = false
      stopIdle()
      const rect = gate.getBoundingClientRect()
      if (!rect.width) return
      const col = Math.min(
        2,
        Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * 3)),
      )
      const plateRect = plate.getBoundingClientRect()
      const row = e.clientY < plateRect.top + plateRect.height / 2 ? 0 : 1
      setTarget(col * 2 + row)
    }

    // Unattended, the lever works its way up through the gate — 1, 2, 3, 4, 5,
    // R and round again — which is every route the pointer could ask for.
    // Held off while a pointer is in the gate, while the section is off
    // screen, and under reduced motion.
    let idleTimer = 0
    let idle = true
    let onScreen = false

    const stopIdle = () => {
      clearTimeout(idleTimer)
      idleTimer = 0
    }

    const scheduleIdle = () => {
      stopIdle()
      if (!idle || !onScreen || !geom.live || reduced.matches) return
      idleTimer = setTimeout(() => {
        setTarget(target < 0 ? 0 : (target + 1) % items.length)
        scheduleIdle()
      }, IDLE_MS)
    }

    const onEnter = () => {
      idle = false
      stopIdle()
    }

    // Leaving hands the lever back to the cycle rather than parking it in
    // neutral: it carries on from the gear it's in.
    const onLeave = () => {
      idle = true
      scheduleIdle()
    }

    measure()

    // Start in first, not neutral. The section then arrives already showing a
    // reason instead of sitting blank for three seconds, and the idle cycle
    // carries on from there — 1, 2, 3 and round. Snapped rather than driven,
    // so there's no entrance animation to sit through.
    if (geom.live) {
      target = 0
      items[0]?.classList.add(
        'about-why__item--active',
        'about-why__item--seated',
      )
      const first = targetPoint()
      cur.x = first.x
      cur.y = first.y
      paint()
    }

    gate.addEventListener('pointermove', onMove, { passive: true })
    gate.addEventListener('pointerenter', onEnter)
    gate.addEventListener('pointerleave', onLeave)

    // Nothing to demonstrate to someone who isn't looking at it.
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting)
        if (onScreen) scheduleIdle()
        else stopIdle()
      },
      { threshold: 0.25 },
    )
    io.observe(gate)

    // Observing the gate, not the plate: the plate is the thing that goes
    // display:none at the breakpoint, and a non-rendered element is exactly
    // what a ResizeObserver stops reporting on.
    const ro = new ResizeObserver(() => {
      measure()
      if (geom.live) run()
      else setTarget(-1)
      scheduleIdle()
    })
    ro.observe(gate)

    return () => {
      gate.removeEventListener('pointermove', onMove)
      gate.removeEventListener('pointerenter', onEnter)
      gate.removeEventListener('pointerleave', onLeave)
      stopIdle()
      io.disconnect()
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
      items.forEach((el) =>
        el.classList.remove(
          'about-why__item--active',
          'about-why__item--seated',
        ),
      )
    }
  }, [gears.length])

  return (
    <div className="about-why__gate" ref={gateRef}>
      {/* Decoration laid over the list: the neutral plane, the three slots,
          and the lever. Strip the CSS and the section is still six sentences
          in reading order. */}
      <div className="about-why__plate" aria-hidden="true" ref={plateRef}>
        <span className="about-why__slot about-why__slot--1" />
        <span className="about-why__slot about-why__slot--2" />
        <span className="about-why__slot about-why__slot--3" />
        <span className="about-why__knob" ref={knobRef} />
      </div>

      <ul className="about-why__gears">
        {gears.map((g) => (
          <li key={g.gear} className="about-why__item">
            <span className="about-why__chip" aria-hidden="true">
              {g.gear}
            </span>
            <p className="about-why__line">{g.line}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
