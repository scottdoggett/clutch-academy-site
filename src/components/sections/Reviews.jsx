import { useEffect, useRef } from 'react'
import GearSection from '../GearSection'
import './Reviews.css'

const PLACEHOLDERS = [
  {
    quote:
      'Great experience learning manual here. Clear instruction, patient teaching, and I felt confident behind the wheel way faster than expected',
    name: 'Ethan B.',
  },
  {
    quote:
      'Used to think driving manual was super stressful, pure anxiety, lots of stalling, but one lesson with Sam and no more stalling, looking forward to learning smooth downshifts and hill starts in lessons 2 and 3',
    name: 'Obiora E.',
  },
  {
    quote:
      'Best decision I made before my Europe trip. Sam walked me through everything I needed to know in just a couple sessions and by the end I felt completely comfortable renting a manual car abroad without a hint of stress.',
    name: 'Scott D.',
  },
  {
    quote:
      'Honestly did not think I would pick this up so quickly. I had tried teaching myself in a parking lot a few times and it was rough, but Sam broke down the clutch work in a way that finally clicked. By lesson three I was doing hill starts in midtown traffic without panicking, which felt impossible a month ago.',
    name: 'Jamie S.',
  },
]

// Two copies of the list back-to-back. The auto-scroll teleports back to 0
// once it crosses the halfway point, so the loop is invisible — card 1 of
// copy B sits exactly where card 1 of copy A used to be.
const MARQUEE_SEQUENCE = [...PLACEHOLDERS, ...PLACEHOLDERS]

// Pixels per frame at ~60fps. Roughly doubles the previous CSS-keyframe pace.
const SCROLL_SPEED = 1.2
// How long to pause auto-advance after the user touches/swipes/scrolls.
const RESUME_DELAY_MS = 2500

export default function Reviews() {
  const marqueeRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const marquee = marqueeRef.current
    const track = trackRef.current
    if (!marquee || !track) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    let raf
    let paused = false
    let resumeTimer

    const tick = () => {
      if (!paused) {
        marquee.scrollLeft += SCROLL_SPEED
        // Track holds 2 identical copies; scrollWidth/2 is the loop point.
        const loopAt = track.scrollWidth / 2
        if (marquee.scrollLeft >= loopAt) {
          marquee.scrollLeft -= loopAt
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const pause = () => {
      paused = true
      clearTimeout(resumeTimer)
      resumeTimer = setTimeout(() => {
        paused = false
      }, RESUME_DELAY_MS)
    }

    marquee.addEventListener('pointerdown', pause)
    marquee.addEventListener('wheel', pause, { passive: true })
    marquee.addEventListener('touchstart', pause, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resumeTimer)
      marquee.removeEventListener('pointerdown', pause)
      marquee.removeEventListener('wheel', pause)
      marquee.removeEventListener('touchstart', pause)
    }
  }, [])

  return (
    <GearSection gear={5} id="reviews">
      <header className="section-header">
        <p className="section-header__eyebrow">Student Stories</p>
        <h2>What Students Are Saying</h2>
        <p className="section-header__lead">
          Real reviews from drivers who got behind the stick with Clutch
          Academy.
        </p>
      </header>

      <div
        ref={marqueeRef}
        className="reviews__marquee"
        aria-label="Student testimonials"
        role="region"
      >
        <ul ref={trackRef} className="reviews__track">
          {MARQUEE_SEQUENCE.map((r, i) => (
            <li
              key={i}
              className="reviews__slide"
              aria-hidden={i >= PLACEHOLDERS.length ? 'true' : undefined}
            >
              <article className="review-card">
                <p className="review-card__quote">{r.quote}</p>
                <footer className="review-card__meta">
                  <span className="review-card__name">— {r.name}</span>
                  {r.package && (
                    <span className="review-card__package">{r.package}</span>
                  )}
                </footer>
              </article>
            </li>
          ))}
        </ul>
      </div>

      <div className="reviews__footer">
        <div className="reviews__badge">
          <span className="reviews__badge-label">Google reviews</span>
          {/* PENDING: FINAL STAR RATING ONCE REVIEWS PUBLISHED */}
          <span className="reviews__badge-stars" aria-hidden="true">
            ★★★★★
          </span>
          <span className="reviews__badge-count">pending</span>
        </div>
        {/* PENDING: GOOGLE BUSINESS PROFILE URL */}
        <a href="#" className="btn btn--secondary" rel="noopener">
          Read more reviews on Google
        </a>
      </div>
    </GearSection>
  )
}
