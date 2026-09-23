'use client'

import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'

import { cn } from '@/lib/utils'

// Magic UI — scroll-based velocity.
// https://magicui.design/docs/components/scroll-based-velocity
//
// Installed from the registry (`shadcn add @magicui/scroll-based-velocity`)
// and converted from TSX to JSX, since this project is plain JavaScript. The
// behaviour is the upstream component's, unchanged: a row scrolls at a base
// velocity, and page-scroll velocity speeds it up and flips its direction.
//
// One thing worth knowing before reusing it: upstream, prefers-reduced-motion
// only pins the speed multiplier at 1 — the row still scrolls. This site
// treats reduced motion as "no motion at all", so ReviewsMarquee.jsx renders a
// static strip instead of this component rather than the component trying to
// stop itself. See CLAUDE.md.
//
// As of September 2026 the reviews strip runs with scrollReactivity={false}:
// a constant drift, no page-scroll boost. The tuning below only matters to a
// row that leaves reactivity on — the drag/wheel handling still applies.

// --- Local tuning, the only change from the registry source --------------
// Upstream: the boost tops out at 5 (so 6x the base speed) and only gets there
// at 1000px/s of page scroll. Against a base velocity this slow that read as
// barely anything. Reaching the cap at 400px/s — an ordinary scroll, not a
// flick — and letting it climb to 11 makes the strip visibly react.
//
// Both numbers feed one formula, (|v| / REFERENCE) * CAP, so REFERENCE is how
// hard you have to scroll to max it out and CAP is how much faster it then
// runs. Peak speed is (1 + CAP) x baseVelocity. Neither touches the at-rest
// speed, which is baseVelocity alone, set where the row is used.
const VELOCITY_CAP = 11
const VELOCITY_REFERENCE = 400

export const wrap = (min, max, v) => {
  const rangeSize = max - min
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

const ScrollVelocityContext = React.createContext(null)

export function ScrollVelocityContainer({ children, className, ...props }) {
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  })
  const velocityFactor = useTransform(smoothVelocity, (v) => {
    const sign = v < 0 ? -1 : 1
    const magnitude = Math.min(
      VELOCITY_CAP,
      (Math.abs(v) / VELOCITY_REFERENCE) * VELOCITY_CAP,
    )
    return sign * magnitude
  })

  return (
    <ScrollVelocityContext.Provider value={velocityFactor}>
      <div className={cn('relative w-full', className)} {...props}>
        {children}
      </div>
    </ScrollVelocityContext.Provider>
  )
}

export function ScrollVelocityRow(props) {
  const sharedVelocityFactor = useContext(ScrollVelocityContext)
  if (sharedVelocityFactor) {
    return (
      <ScrollVelocityRowImpl {...props} velocityFactor={sharedVelocityFactor} />
    )
  }
  return <ScrollVelocityRowLocal {...props} />
}

function ScrollVelocityRowImpl({
  children,
  baseVelocity = 5,
  direction = 1,
  className,
  velocityFactor,
  scrollReactivity = true,
  draggable = false,
  ...props
}) {
  const containerRef = useRef(null)
  const blockRef = useRef(null)
  const [numCopies, setNumCopies] = useState(1)

  const baseX = useMotionValue(0)
  const baseDirectionRef = useRef(direction >= 0 ? 1 : -1)
  const currentDirectionRef = useRef(direction >= 0 ? 1 : -1)
  const unitWidth = useMotionValue(0)

  const isInViewRef = useRef(true)
  const isPageVisibleRef = useRef(true)
  const prefersReducedMotionRef = useRef(false)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    const block = blockRef.current
    let ro = null
    let io = null
    let mq = null
    const handleVisibility = () => {
      isPageVisibleRef.current = document.visibilityState === 'visible'
    }
    const handlePRM = () => {
      if (mq) {
        prefersReducedMotionRef.current = mq.matches
      }
    }

    if (container && block) {
      const updateSizes = () => {
        const cw = container.offsetWidth || 0
        const bw = block.scrollWidth || 0
        unitWidth.set(bw)
        const nextCopies = bw > 0 ? Math.max(3, Math.ceil(cw / bw) + 2) : 1
        setNumCopies((prev) => (prev === nextCopies ? prev : nextCopies))
      }

      updateSizes()

      ro = new ResizeObserver(updateSizes)
      ro.observe(container)
      ro.observe(block)

      io = new IntersectionObserver(([entry]) => {
        isInViewRef.current = entry.isIntersecting
      })
      io.observe(container)

      document.addEventListener('visibilitychange', handleVisibility, {
        passive: true,
      })
      handleVisibility()

      mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      mq.addEventListener('change', handlePRM)
      handlePRM()
    }

    return () => {
      if (ro) {
        ro.disconnect()
      }
      if (io) {
        io.disconnect()
      }
      document.removeEventListener('visibilitychange', handleVisibility)
      if (mq) {
        mq.removeEventListener('change', handlePRM)
      }
    }
  }, [children, unitWidth])

  // Local addition: hand control back to the pointer.
  //
  // The row is a transform, not a scroll container, so there is nothing for a
  // browser to scroll — but baseX is just a number, and a drag can move it the
  // same way the animation frame does. Everything downstream (the wrap, the
  // copies) already works for any value, so the strip loops under a drag in
  // either direction for free.
  //
  // The drift is suspended for the length of a drag and picks straight back up
  // on release, so letting go hands over to a strip that is already moving
  // rather than stopping dead.
  useEffect(() => {
    if (!draggable) return
    const container = containerRef.current
    if (!container) return

    let dragging = false
    let activePointer = null
    let lastX = 0

    const onPointerDown = (e) => {
      // Left button only; other buttons are for the browser's menus.
      if (e.pointerType === 'mouse' && e.button !== 0) return
      dragging = true
      isDraggingRef.current = true
      activePointer = e.pointerId
      lastX = e.clientX
      container.setPointerCapture?.(e.pointerId)
    }

    const onPointerMove = (e) => {
      if (!dragging || e.pointerId !== activePointer) return
      // Drag right, content follows right: baseX runs the other way, since the
      // transform below is its negation.
      baseX.set(baseX.get() - (e.clientX - lastX))
      lastX = e.clientX
    }

    const endDrag = () => {
      if (!dragging) return
      dragging = false
      isDraggingRef.current = false
      if (activePointer !== null) {
        container.releasePointerCapture?.(activePointer)
        activePointer = null
      }
    }

    // Trackpads and horizontal wheels. Vertical intent is left alone — it has
    // to reach the page, both to scroll it and to drive the velocity boost.
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      baseX.set(baseX.get() + e.deltaX)
    }

    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', endDrag)
    container.addEventListener('pointercancel', endDrag)
    container.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', endDrag)
      container.removeEventListener('pointercancel', endDrag)
      container.removeEventListener('wheel', onWheel)
    }
  }, [draggable, baseX])

  const x = useTransform([baseX, unitWidth], ([v, bw]) => {
    const width = Number(bw) || 1
    const offset = Number(v) || 0
    return `${-wrap(0, width, offset)}px`
  })

  useAnimationFrame((_, delta) => {
    if (!isInViewRef.current || !isPageVisibleRef.current) return
    // The pointer owns baseX for the length of a drag.
    if (isDraggingRef.current) return
    const dt = delta / 1000
    const vf = scrollReactivity ? velocityFactor.get() : 0
    const absVf = Math.min(VELOCITY_CAP, Math.abs(vf))
    const speedMultiplier = prefersReducedMotionRef.current ? 1 : 1 + absVf

    if (absVf > 0.1) {
      const scrollDirection = vf >= 0 ? 1 : -1
      currentDirectionRef.current = baseDirectionRef.current * scrollDirection
    }

    const bw = unitWidth.get() || 0
    if (bw <= 0) return
    const pixelsPerSecond = (bw * baseVelocity) / 100
    const moveBy =
      currentDirectionRef.current * pixelsPerSecond * speedMultiplier * dt
    baseX.set(baseX.get() + moveBy)
  })

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full overflow-hidden whitespace-nowrap',
        // touch-pan-y, not pan-x: it hands vertical panning to the browser and
        // keeps horizontal for us. pan-x would claim horizontal as the ONLY
        // gesture and swallow a vertical drag that began over the strip.
        draggable && 'cursor-grab touch-pan-y active:cursor-grabbing',
        className,
      )}
      {...props}
    >
      <motion.div
        className="inline-flex transform-gpu items-center will-change-transform select-none"
        style={{ x }}
      >
        {Array.from({ length: numCopies }).map((_, i) => (
          <div
            key={i}
            ref={i === 0 ? blockRef : null}
            aria-hidden={i !== 0}
            className="inline-flex shrink-0 items-center"
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

function ScrollVelocityRowLocal(props) {
  const { scrollY } = useScroll()
  const localVelocity = useVelocity(scrollY)
  const localSmoothVelocity = useSpring(localVelocity, {
    damping: 50,
    stiffness: 400,
  })
  const localVelocityFactor = useTransform(localSmoothVelocity, (v) => {
    const sign = v < 0 ? -1 : 1
    const magnitude = Math.min(
      VELOCITY_CAP,
      (Math.abs(v) / VELOCITY_REFERENCE) * VELOCITY_CAP,
    )
    return sign * magnitude
  })
  return (
    <ScrollVelocityRowImpl {...props} velocityFactor={localVelocityFactor} />
  )
}
