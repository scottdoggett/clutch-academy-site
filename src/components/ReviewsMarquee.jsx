'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { REVIEWS } from '@/lib/reviews'
import { beltSpeed, treadmill } from '@/lib/treadmill'
import './ReviewCard.css'
import './ReviewsMarquee.css'

// Cards travelled per second, as an average card's width. Speed is relative
// to the strip's own length, so a loop takes the same time on a phone as on a
// desktop instead of crawling on the narrow one, and per card, so the pace
// holds whatever the number of reviews. This is the pace fifteen cards had
// at 0.85% of the strip a second (~60px/s at the desktop card width), kept
// when the strip took all 43 in October 2026.
const SPEED = 0.1275

// Sizes every card in the strip to its quote (October 2026). All the cards
// share one number of lines, the fewest the longest quote needs at the
// widest a card may be (--card-max in ReviewsMarquee.css); each card is then
// as narrow as its own quote allows at that many lines, and no narrower
// than --card-min, or than its top row needs for the whole name beside the
// stars. So the cards are all a few lines high, and a long review gets a
// wide card rather than a tall one. Measured rather than worked out
// from the length, which misjudged by a quarter: letters and word breaks
// vary too much. The result goes in each card's --fit.
function fitCards(root) {
  const slides = [...root.querySelectorAll('.reviews__slide')]
  if (!slides.length) return
  const slide = getComputedStyle(slides[0])
  const max = parseFloat(slide.maxWidth)
  const min = parseFloat(slide.minWidth)
  const card = getComputedStyle(slides[0].querySelector('.review-card'))
  const pad = parseFloat(card.paddingLeft) + parseFloat(card.paddingRight)
  const quote = getComputedStyle(slides[0].querySelector('.review-card__quote'))
  const line = parseFloat(quote.lineHeight)
  if (!(max > 0) || !(line > 0)) return

  // One hidden paragraph in the quote's type, to wrap each quote in.
  const probe = document.createElement('p')
  probe.setAttribute('aria-hidden', 'true')
  Object.assign(probe.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    visibility: 'hidden',
    margin: '0',
    padding: '0',
    fontFamily: quote.fontFamily,
    fontSize: quote.fontSize,
    fontWeight: quote.fontWeight,
    fontStyle: quote.fontStyle,
    letterSpacing: quote.letterSpacing,
    lineHeight: quote.lineHeight,
    textWrap: quote.textWrap,
  })
  // No transition: under reduced motion globals.css gives every property
  // one, which left the probe at its old width when it was read.
  probe.style.setProperty('transition', 'none', 'important')
  document.body.appendChild(probe)
  const lines = (text, width) => {
    probe.style.width = `${width}px`
    probe.textContent = text
    return Math.round(probe.offsetHeight / line)
  }

  const room = Math.floor(max - pad)
  const quotes = [...new Set(slides.map((s) => s.querySelector('.review-card__quote').textContent))]
  const target = Math.max(...quotes.map((q) => lines(q, room)))
  const need = new Map()
  for (const q of quotes) {
    // The narrowest whole-px width that keeps it to `target` lines.
    let lo = 0
    let hi = room
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (lines(q, mid) <= target) hi = mid
      else lo = mid
    }
    need.set(q, hi)
  }
  probe.remove()

  const gap = parseFloat(card.columnGap) || 0
  for (const s of slides) {
    // The top row: the avatar, the whole name and the stars.
    const meta = s.querySelector('.review-card__meta')
    const head =
      s.querySelector('.review-card__avatar').getBoundingClientRect().width +
      (parseFloat(getComputedStyle(meta).columnGap) || 0) +
      s.querySelector('.review-card__name').scrollWidth +
      gap +
      s.querySelector('.review-card__stars').getBoundingClientRect().width +
      pad
    // A pixel spare, so rounding can't push a quote onto another line.
    const w = Math.max(need.get(s.querySelector('.review-card__quote').textContent) + pad, head) + 1
    s.style.setProperty('--fit', `${Math.ceil(Math.min(max, Math.max(min, w)))}px`)
  }
}

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

  // Fit the cards to their quotes, again whenever the strip changes width
  // (a breakpoint changes the type and the widest a card may be) and once
  // the fonts have loaded.
  useEffect(() => {
    const root = viewportRef.current
    if (!root) return
    let live = true
    let width = -1
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (Math.abs(w - width) < 1) return
      width = w
      fitCards(root)
    })
    ro.observe(root)
    document.fonts?.ready.then(() => live && fitCards(root))
    return () => {
      live = false
      ro.disconnect()
    }
  }, [reduced])

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
      const rest = () => -(width / REVIEWS.length) * SPEED
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
        <li key={`${r.name}-${i}`} className="reviews__slide" style={{ '--chars': r.quote.length }}>
          <article className="review-card">
            {/* Each review's own rating, five unless it says otherwise
                (src/lib/reviews.js), with the rest of the five as empty
                stars. Decorative: the section badge speaks the rating
                once. */}
            <p className="review-card__stars" aria-hidden="true">
              {'★'.repeat(r.stars ?? 5) + '☆'.repeat(5 - (r.stars ?? 5))}
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
        ref={viewportRef}
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
