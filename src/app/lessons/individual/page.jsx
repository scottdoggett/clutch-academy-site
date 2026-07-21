import Link from 'next/link'
import BookButton from '../../../components/BookButton'
import TrustBlock from '../../../components/lessons/TrustBlock'
import LessonFaq from '../../../components/lessons/LessonFaq'
import { faqSubset } from '../../../lib/faqs'

export const metadata = {
  title: 'Individual Manual Driving Lesson in Toronto | Clutch Academy',
  description:
    'One-on-one manual driving refresher in Toronto, or a first introduction to stick shift. Real roads, patient instruction, $90 + HST. Book online.',
  alternates: { canonical: '/lessons/individual' },
}

// Keyword target (08 §4): "manual driving refresher Toronto".
// Price is the CURRENT (pre-August-1) offering — PENDING: Phase 10 flips to
// 75 min · $109 + HST.
const FAQ_IDS = ['license', 'how-many', 'car', 'wear', 'pay']

// "Who it's for" scenarios — the same four situations the old bullet list
// described, each with a name and a line icon a visitor can self-identify
// with at a glance. Icons inherit stroke styling from the svg wrapper.
const WHO = [
  {
    label: 'The returning driver',
    text: 'You learned manual years ago and want the muscle memory back before it matters.',
    icon: (
      // Loop arrow — the skill coming back around.
      <>
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </>
    ),
  },
  {
    label: 'The Europe trip',
    text: 'You’re renting a car in Europe this summer — where manual is often the default — and want to arrive ready.',
    icon: (
      // Paper plane.
      <>
        <path d="M22 2 11 13" />
        <path d="M22 2 15 22l-4-9-9-4Z" />
      </>
    ),
  },
  {
    label: 'The total beginner',
    text: 'You’ve never driven stick and want a real first introduction before committing to a package.',
    icon: (
      // Learner's L-plate.
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
        <path d="M10 8v8h5" />
      </>
    ),
  },
  {
    label: 'The one skill to fix',
    text: 'You have a specific skill to iron out — hill starts, smoother shifting, downshifting — and one focused hour will do it.',
    icon: (
      // Target.
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="0.75" fill="currentColor" />
      </>
    ),
  },
]

// Real quotes from the Google-review set, chosen because both describe a
// first/single lesson experience.
const QUOTES = [
  {
    text: 'I have never driven a manual car before taking a lesson with Sam. Even after 1 session, Sam quickly was able to teach me the basics and I was comfortable enough to go driving on my own without him.',
    name: 'Cole Janostin',
  },
  {
    text: "Did my first lesson last week with Sam, he was calm and patient around my nerves. Stalled twice on a hill and he didn't flinch. Finally feel like I actually get the clutch. Worth every dollar.",
    name: 'Sol',
  },
]

export default function IndividualLessonPage() {
  return (
    <div className="lesson-page">
      {/* ---------- Hero ---------- */}
      <section
        className="section section--first"
        aria-labelledby="lesson-heading"
      >
        <div className="section__inner lesson-hero__inner">
          <p className="section-header__eyebrow">Private · Single Lesson</p>
          <h1 id="lesson-heading" className="lesson-hero__headline">
            Individual Manual Lesson
          </h1>
          <p className="lesson-hero__lead">
            One hour, one-on-one, on real Toronto roads. The individual lesson
            is the manual driving refresher Toronto drivers book when the
            skill has gone rusty — and the easiest first introduction if
            you’ve never touched a stick shift.
          </p>
          {/* PENDING: real lesson photo for this page (08 §7 pending assets). */}
          <p className="lesson-hero__pull">
            Most students arrive nervous — and leave wondering what they were
            nervous about.
          </p>
          <p className="lesson-hero__price">
            $90
            <span className="lesson-hero__price-unit">/ hour + HST</span>
          </p>
          <BookButton source="packages_single" className="btn btn--primary">
            Book This Lesson
          </BookButton>
        </div>
      </section>

      {/* ---------- Who it's for ---------- */}
      <section className="section" aria-labelledby="who-heading">
        <div className="section__inner lesson-block__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">Who it’s for</p>
            <h2 id="who-heading">Best for refreshers and first tastes</h2>
          </header>
          <div className="lesson-who">
            {WHO.map((w) => (
              <article key={w.label} className="lesson-who__item">
                <svg
                  className="lesson-who__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  {w.icon}
                </svg>
                <h3 className="lesson-who__label">{w.label}</h3>
                <p className="lesson-who__text">{w.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- What's included ---------- */}
      <section className="section" aria-labelledby="included-heading">
        <div className="section__inner lesson-block__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">What’s included</p>
            <h2 id="included-heading">Your hour behind the wheel</h2>
          </header>
          {/* PENDING: SINGLE-LESSON INCLUSIONS — final 3–5 bullets from Sam.
              The list below carries over the placeholder bullets already
              shown on the live site's pricing card; confirm before launch. */}
          <ul className="lesson-block__list">
            <li>One-on-one instruction, tailored to your starting level</li>
            <li>Clutch control basics and finding the bite point</li>
            <li>First-gear starts, stops, and real-road practice</li>
            <li>Personalized feedback on exactly what to practice next</li>
          </ul>
          <p className="lesson-block__note">
            Taught in a manual 2015 Volkswagen Golf. A valid G2 or G licence
            is required.
          </p>
        </div>
      </section>

      {/* ---------- Trust ---------- */}
      {/* Full-bleed band — renders its own <section>, no inner wrapper. */}
      <TrustBlock />

      {/* ---------- Real reviews ---------- */}
      <section className="section" aria-labelledby="quotes-heading">
        <div className="section__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">From the Google reviews</p>
            <h2 id="quotes-heading">After one lesson</h2>
          </header>
          <div className="lesson-quotes">
            {QUOTES.map((q) => (
              <figure key={q.name} className="lesson-quote">
                <blockquote className="lesson-quote__text">
                  “{q.text}”
                </blockquote>
                <figcaption className="lesson-quote__name">
                  — {q.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ subset ---------- */}
      <section className="section" aria-labelledby="faq-heading">
        <div className="section__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">Good to know</p>
            <h2 id="faq-heading">Quick answers</h2>
          </header>
          <LessonFaq items={faqSubset(FAQ_IDS)} />
        </div>
      </section>

      {/* ---------- Final CTA + cross-links ---------- */}
      <section className="section" aria-labelledby="next-heading">
        <div className="section__inner lesson-next">
          <header className="section-header">
            <p className="section-header__eyebrow">Ready to drive?</p>
            <h2 id="next-heading">Book your hour</h2>
          </header>
          <BookButton
            source="packages_single"
            className="btn btn--primary btn--xl"
          >
            Book This Lesson
          </BookButton>
          <p className="lesson-next__links">
            Starting from zero and want structure? The{' '}
            <Link href="/lessons/manual-foundations">
              Manual Foundations Package
            </Link>{' '}
            walks you from clutch control to independent driving — or{' '}
            <Link href="/manual-driving-lessons">
              compare all lesson options
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
