import { useEffect, useRef } from 'react'
import GearSection from '../GearSection'
import './Reviews.css'

const REVIEWS = [
  {
    quote:
      'Had such a positive experience! Very professional, calm, and efficient. Would definitely recommend!',
    name: 'Hannah Bance',
  },
  {
    quote:
      "Honestly one of the best driving instructors out there if you want to learn manual. Super patient, explains everything in a way that actually makes sense, and makes you feel comfortable even if you're nervous or completely new to stick.",
    name: 'Anthony Mannella',
  },
  {
    quote:
      'I had the best time learning how to drive manual with Sam. He has great customer service and wonderful tips for driving with a stick. Thank you Clutch team!!!',
    name: 'Dakota Abell',
  },
  {
    quote:
      "Sam is an incredible and clear instructor. I just moved to the city and learning manual in Toronto was an intimidating task but he made it simple. I couldn't be more grateful!",
    name: 'Michael C.',
  },
  {
    quote:
      "Sam was super patient and a great teacher throughout the lessons. I highly recommend Clutch Academy if you're wanting to learn how to drive a manual!",
    name: 'Mollie MacDonald',
  },
  {
    quote: 'Such a kind, informational and educated young man!',
    name: 'Bailey Mabey',
  },
  {
    quote:
      'Sam is an excellent teacher who showed patience and encouragement throughout every lesson. He is the best teacher I could have had to learn to drive a standard.',
    name: 'Kait',
  },
  {
    quote:
      'Best experience with Sam! Incredibly knowledgeable, personable, and easy to learn from. Highly recommend.',
    name: 'Ven Djukic',
  },
  {
    quote:
      'Used to think driving manual was super stressful, pure anxiety, lots of stalling, but one lesson with Sam and no more stalling, looking forward to learning smooth downshifts and hill starts in lessons 2 and 3!',
    name: 'Obiora Ejiofor',
  },
  {
    quote:
      'Great experience learning manual here. Clear instruction, patient teaching, and I felt confident behind the wheel way faster than expected.',
    name: 'Ethan Black',
  },
  {
    quote:
      'Learning to drive a standard with Sam was a low stress experience with a patient and knowledgable instructor. I highly recommend Clutch Academy for anyone wanting to master the stick.',
    name: 'Tahnee Anthony',
  },
  {
    quote:
      "Sam is a fantastic driving instructor! Incredibly patient and calm under stress, he can boost up a driving student's confidence behind the wheel in just a few hours. Manual driving was an intimidating skill for me to learn, so it was great to have trusted support for my first time trying!",
    name: 'Ryan Bergman',
  },
  {
    quote:
      "Sam was fantastic throughout the whole process. He was patient with me on my first lesson and by the third, I feel ready to navigate in Europe driving standard. Can't recommend Clutch enough to anyone looking to learn standard.",
    name: 'Erica Carnicelli',
  },
  {
    quote:
      "Did my first lesson last week with Sam, he was calm and patient around my nerves. Stalled twice on a hill and he didn't flinch. Finally feel like I actually get the clutch. Worth every dollar.",
    name: 'Sol',
  },
  {
    quote:
      'I have never driven a manual car before taking a lesson with Sam. Even after 1 session, Sam quickly was able to teach me the basics and I was comfortable enough to go driving on my own without him. I would definitely recommend Sam teaching you to drive manual!',
    name: 'Cole Janostin',
  },
]

// Two copies of the list back-to-back. The auto-scroll teleports back to 0
// once it crosses the halfway point, so the loop is invisible — card 1 of
// copy B sits exactly where card 1 of copy A used to be.
const MARQUEE_SEQUENCE = [...REVIEWS, ...REVIEWS]

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

    // Skip the auto-scroll loop in prerender so the snapshot doesn't capture
    // a mid-frame scrollLeft offset.
    if (window.__PRERENDER__) return

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
    <GearSection gear={2} id="reviews">
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
            // Composite key: the marquee is REVIEWS duplicated back-to-back, so
            // name alone would collide between the two copies.
            <li
              key={`${r.name}-${i}`}
              className="reviews__slide"
              aria-hidden={i >= REVIEWS.length ? 'true' : undefined}
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
          <span className="reviews__badge-stars" aria-hidden="true">
            ★★★★★
          </span>
        </div>
        <a
          href="https://maps.app.goo.gl/5Mi1EeB3jRs35Ezr5"
          className="btn btn--secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read more reviews on Google
        </a>
      </div>
    </GearSection>
  )
}
