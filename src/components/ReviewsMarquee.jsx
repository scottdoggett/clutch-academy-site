'use client'

import { useEffect, useState } from 'react'
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from '@/components/ui/scroll-based-velocity'
import './ReviewsMarquee.css'

// Real quotes hand-copied from the Google reviews, manually maintained. When
// a new review lands, add it here; the site-wide rating/count numbers live in
// src/lib/googleReviews.js.
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

// Percent of one copy's width travelled per second. The Magic UI row measures
// its own content and derives px/s from that, so the loop takes the same time
// on a phone as on a desktop instead of crawling on the narrow one. One copy is
// ~7,100px at the desktop card width, which puts this at ~60px/s — a little
// slower than the 72px/s the old scrollLeft loop ran at.
const BASE_VELOCITY = 0.85

// The strip of review cards under the home "What Students Are Saying" heading.
// Motion comes from Magic UI's scroll-based velocity row: it drifts on its own
// and the page's own scroll speed drives it faster and flips its direction, so
// the strip reacts to the reader rather than ignoring them. It is a transform,
// not a scroll container — the strip can no longer be dragged sideways.
//
// Server-rendered HTML contains every review. Reduced motion gets a static,
// swipeable strip instead: with nothing moving and no side-scrolling, the
// reviews past the first two would otherwise be unreachable.
export default function ReviewsMarquee() {
  // Rendered on the server as the animated row and swapped after mount, so the
  // markup the server sent always matches what React hydrates.
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // The row renders this several times over to fill the viewport, marking every
  // copy after the first aria-hidden, so the list is spoken once.
  const cards = (
    <ul className="reviews__track">
      {REVIEWS.map((r, i) => (
        <li key={`${r.name}-${i}`} className="reviews__slide">
          <article className="review-card">
            <p className="review-card__quote">{r.quote}</p>
            <footer className="review-card__meta">
              <span className="review-card__name">— {r.name}</span>
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
        {cards}
      </div>
    )
  }

  return (
    <ScrollVelocityContainer
      className="reviews__marquee"
      aria-label="Student testimonials"
      role="region"
    >
      <ScrollVelocityRow baseVelocity={BASE_VELOCITY} direction={1}>
        {cards}
      </ScrollVelocityRow>
    </ScrollVelocityContainer>
  )
}
