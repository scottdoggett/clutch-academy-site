import Link from 'next/link'
import BookButton from '../../../components/BookButton'
import WasPrice from '../../../components/WasPrice'
import Breadcrumbs from '../../../components/Breadcrumbs'
import '../../../components/lessons/lessons.css'

export const metadata = {
  title: 'Individual Manual Driving Lesson in Toronto | Clutch Academy',
  description:
    'One-on-one manual driving refresher in Toronto, or a first introduction to stick shift. Real roads, patient instruction, $90 + HST. Book online.',
  alternates: { canonical: '/lessons/individual' },
}

// Keyword target (04-seo.md §Per-route targets): "manual driving refresher
// Toronto".
// Pricing is the October 2026 winter offering: 1 hour · $90 + HST.

// PENDING: SINGLE-LESSON INCLUSIONS — final 3–5 bullets from Sam. These are
// placeholders, expanded from the three on the live site's pricing card;
// confirm before launch. On November 5, 2026 Sam changed the third from
// "real-road practice" to "reversing": a complete beginner rarely gets onto
// real roads in a single session.
const INCLUDED = [
  'One-on-one instruction that starts at your level',
  'Clutch control basics and finding the bite point',
  'First-gear starts, stops, and reversing',
  'Personal feedback on what to practice next',
]

// Four situations a visitor can recognise themselves in. They were named,
// iconned cards until September 2026, when the four package pages took one
// shape and this section became the bullet list the other three use.
const WHO = [
  'You learned manual years ago and want the muscle memory back before it matters.',
  'You’re renting a car in Europe, where manual is often the default, and want to arrive ready.',
  'You’ve never driven stick and want to try it before committing to a package.',
  'You want to fix one thing, like hill starts, smoother shifting, or downshifting, in a single focused session.',
]

export default function IndividualLessonPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Lessons', href: '/manual-driving-lessons' },
          { label: 'Individual Manual Lesson' },
        ]}
      />

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
            is a great refresher if you’re a little rusty, or a first taste of
            driving stick if you’ve never tried it before.
          </p>
          {/* PENDING: real lesson photo for this page (07-status.md §Pending assets). */}
          <p className="lesson-hero__pull">
            Most students arrive nervous. We expect that and go at your pace.
          </p>
          <p className="lesson-hero__price">
            $90
            <WasPrice pkg="individual" />
            <span className="lesson-hero__price-unit">/ hour + HST</span>
          </p>
          <BookButton source="packages_single" className="btn btn--primary">
            Book This Lesson
          </BookButton>
        </div>
      </section>

      {/* ---------- What's included ---------- */}
      <section
        className="section section--light"
        aria-labelledby="included-heading"
      >
        <div className="section__inner lesson-block__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">What’s included</p>
            <h2 id="included-heading">Your hour behind the wheel</h2>
          </header>
          <ul className="lesson-included">
            {INCLUDED.map((item) => (
              <li key={item} className="lesson-included__item">
                <p className="lesson-included__line">{item}</p>
              </li>
            ))}
          </ul>
          <p className="lesson-block__note">
            Taught in a manual hatchback. You need a valid G2 or G
            licence.
          </p>
        </div>
      </section>

      {/* ---------- Who it's for ---------- */}
      <section className="section" aria-labelledby="who-heading">
        <div className="section__inner lesson-block__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">Who it’s for</p>
            <h2 id="who-heading">Best for refreshers and first tastes</h2>
          </header>
          <ul className="lesson-block__list">
            {WHO.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Final CTA + cross-links ---------- */}
      <section
        className="section section--light"
        aria-labelledby="next-heading"
      >
        <div className="section__inner lesson-next">
          <header className="section-header">
            <p className="section-header__eyebrow">Ready to drive?</p>
            <h2 id="next-heading">Book your lesson</h2>
          </header>
          <BookButton
            source="packages_single"
            className="btn btn--primary btn--xl btn--on-light"
          >
            Book This Lesson
          </BookButton>
          <p className="lesson-next__links">
            Starting from zero and want structure? The{' '}
            <Link href="/lessons/manual-foundations">
              Manual Foundations Package
            </Link>{' '}
            walks you from clutch control to independent driving. Or{' '}
            <Link href="/manual-driving-lessons">
              compare all lesson options
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
