'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { REVIEWS } from '@/lib/reviews'
import { beltSpeed, treadmill } from '@/lib/treadmill'
import './ReviewCard.css'
import './ReviewsMarquee.css'

// Percent of one copy's width travelled per second. Speed is relative to the
// strip's own length, so a loop takes the same time on a phone as on a desktop
// instead of crawling on the narrow one. One copy is ~7,100px at the desktop
// card width, which puts this at ~60px/s.
const SPEED = 0.85

// The strip of review cards under the home "What Students Are Saying" heading.
// It drifts left at one constant speed, and a drag, a touch swipe, or a
// sideways trackpad swipe moves it by hand; the drift stands aside for the
// length of a drag and resumes on release. It's the site's one sanctioned
// loop (docs/spec/08-motion.md rule 7), so it's linear, not eased.
//
// It's also a treadmill for the hero's black car (src/lib/treadmill.js):
// while someone drives the car across it, the car's wheels push it, and it
// eases back to its drift when the car is off.
//
// It moves a transform, not a scroll position: two copies of the list sit
// side by side and the offset wraps at one copy's width, so the loop has no
// seam. The viewport is touch-action: pan-y (ReviewsMarquee.css), which hands
// vertical swipes to the browser — a swipe that starts on the strip still
// scrolls the page — and horizontal ones to the pointer handlers here.
//
// Server-rendered HTML contains every review. Reduced motion gets a static,
// swipeable strip instead: with nothing moving and no side-scrolling, the
// reviews past the first two would otherwise be unreachable.
export default function ReviewsMarquee() {
  // Rendered on the server as the animated strip and swapped after mount, so
  // the markup the server sent always matches what React hydrates.
  const [reduced, setReduced] = useState(false)
  const viewportRef = useRef(null)
  const beltRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useGSAP(
    () => {
      const viewport = viewportRef.current
      const belt = beltRef.current
      if (reduced || !viewport || !belt) return

      const copy = belt.firstElementChild
      const setX = gsap.quickSetter(belt, 'x', 'px')
      let width = copy.offsetWidth
      let offset = 0
      let dragging = false
      let inView = true
      let pointerId = null
      let lastX = 0

      // Keep the offset inside (-width, 0], so the second copy is always
      // there to cover the gap the first one leaves.
      const render = () => {
        if (width > 0) offset = gsap.utils.wrap(-width, 0, offset)
        setX(offset)
      }

      // The strip's drift, px/s, + right.
      const rest = () => -(width * SPEED) / 100
      treadmill.el = viewport
      treadmill.speed = rest()

      const tick = (_time, deltaMs) => {
        if (dragging || !inView || width <= 0) return
        const dt = deltaMs / 1000
        treadmill.speed = beltSpeed(treadmill.speed, rest(), treadmill.car, dt)
        offset += treadmill.speed * dt
        treadmill.travel += treadmill.speed * dt
        render()
      }
      gsap.ticker.add(tick)

      const ro = new ResizeObserver(() => {
        width = copy.offsetWidth
        render()
      })
      ro.observe(copy)

      // Off screen, nothing needs to move. (A hidden tab already stops the
      // ticker on its own.)
      const io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting
      })
      io.observe(viewport)

      const onPointerDown = (e) => {
        // Left button only; other buttons are for the browser's menus.
        if (e.pointerType === 'mouse' && e.button !== 0) return
        dragging = true
        pointerId = e.pointerId
        lastX = e.clientX
        viewport.setPointerCapture?.(e.pointerId)
      }
      const onPointerMove = (e) => {
        if (!dragging || e.pointerId !== pointerId) return
        // Drag right, content follows right.
        offset += e.clientX - lastX
        treadmill.travel += e.clientX - lastX
        lastX = e.clientX
        render()
      }
      // pointercancel is how a touch that turns out to be a vertical scroll
      // arrives: the browser takes the gesture, and the drift resumes.
      const endDrag = () => {
        if (!dragging) return
        dragging = false
        if (pointerId !== null) viewport.releasePointerCapture?.(pointerId)
        pointerId = null
      }
      // Trackpads and horizontal wheels. Vertical intent is left alone so it
      // reaches the page.
      const onWheel = (e) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
        e.preventDefault()
        offset -= e.deltaX
        treadmill.travel -= e.deltaX
        render()
      }

      viewport.addEventListener('pointerdown', onPointerDown)
      viewport.addEventListener('pointermove', onPointerMove)
      viewport.addEventListener('pointerup', endDrag)
      viewport.addEventListener('pointercancel', endDrag)
      viewport.addEventListener('wheel', onWheel, { passive: false })

      return () => {
        if (treadmill.el === viewport) treadmill.el = null
        gsap.ticker.remove(tick)
        ro.disconnect()
        io.disconnect()
        viewport.removeEventListener('pointerdown', onPointerDown)
        viewport.removeEventListener('pointermove', onPointerMove)
        viewport.removeEventListener('pointerup', endDrag)
        viewport.removeEventListener('pointercancel', endDrag)
        viewport.removeEventListener('wheel', onWheel)
      }
    },
    { dependencies: [reduced], revertOnUpdate: true },
  )

  // The belt renders this twice; the second copy is aria-hidden, so the list
  // is spoken once.
  const cards = (hidden) => (
    <ul className="reviews__track" aria-hidden={hidden || undefined}>
      {REVIEWS.map((r, i) => (
        <li key={`${r.name}-${i}`} className="reviews__slide">
          <article className="review-card">
            {/* Every review on the profile is five stars (googleReviews.js
                holds the 5.0 rating), so the row is fixed rather than
                per-review data. Decorative: the section badge speaks the
                rating once. */}
            <p className="review-card__stars" aria-hidden="true">
              ★★★★★
            </p>
            <p className="review-card__quote">{r.quote}</p>
            <footer className="review-card__meta">
              <span className="review-card__avatar" aria-hidden="true">
                {r.name.charAt(0)}
              </span>
              <span className="review-card__name">{r.name}</span>
            </footer>
          </article>
        </li>
      ))}
    </ul>
  )

  if (reduced) {
    return (
      <div
        className="reviews__marquee reviews__marquee--static"
        aria-label="Student testimonials"
        role="region"
      >
        {cards(false)}
      </div>
    )
  }

  return (
    <div
      ref={viewportRef}
      className="reviews__marquee reviews__marquee--moving"
      aria-label="Student testimonials"
      role="region"
    >
      <div ref={beltRef} className="reviews__belt">
        {cards(false)}
        {cards(true)}
      </div>
    </div>
  )
}
