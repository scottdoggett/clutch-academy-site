import Link from 'next/link'
import BookButton from '../../../components/BookButton'
import Breadcrumbs from '../../../components/Breadcrumbs'
import LessonFaq from '../../../components/lessons/LessonFaq'
import LessonQuotes from '../../../components/lessons/LessonQuotes'
import { faqSubset } from '../../../lib/faqs'

export const metadata = {
  title: 'Individual Manual Driving Lesson in Toronto | Clutch Academy',
  description:
    'One-on-one manual driving refresher in Toronto, or a first introduction to stick shift. Real roads, patient instruction, $110 + HST. Book online.',
  alternates: { canonical: '/lessons/individual' },
}

// Keyword target (08 §4): "manual driving refresher Toronto".
// Pricing is the post-August-1 offering: 75 min · $110 + HST.
const FAQ_IDS = ['license', 'how-many', 'car', 'wear', 'pay']

// PENDING: SINGLE-LESSON INCLUSIONS — final 3–5 bullets from Sam. These carry
// over the placeholder bullets already shown on the live site's pricing card;
// confirm before launch.
const INCLUDED = [
  'One-on-one instruction, tailored to your starting level',
  'Clutch control basics and finding the bite point',
  'First-gear starts, stops, and real-road practice',
  'Personalized feedback on exactly what to practice next',
]

// Four situations a visitor can recognise themselves in. They were named,
// iconned cards until September 2026, when the four package pages took one
// shape and this section became the bullet list the other three use.
const WHO = [
  'You learned manual years ago and want the muscle memory back before it matters.',
  'You’re renting a car in Europe this summer — where manual is often the default — and want to arrive ready.',
  'You’ve never driven stick and want a real first introduction before committing to a package.',
  'You have a specific skill to iron out — hill starts, smoother shifting, downshifting — and one focused session will do it.',
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
            Seventy-five minutes, one-on-one, on real Toronto roads. The individual
            lesson is the manual driving refresher Toronto drivers book when the
            skill has gone rusty — and the easiest first introduction if
            you’ve never touched a stick shift.
          </p>
          {/* PENDING: real lesson photo for this page (08 §7 pending assets). */}
          <p className="lesson-hero__pull">
            Most students arrive nervous — and leave wondering what they were
            nervous about.
          </p>
          <p className="lesson-hero__price">
            $110
            <span className="lesson-hero__price-unit">/ 75 min + HST</span>
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
            <h2 id="included-heading">Your 75 minutes behind the wheel</h2>
          </header>
          <ul className="lesson-included">
            {INCLUDED.map((item) => (
              <li key={item} className="lesson-included__item">
                <p className="lesson-included__line">{item}</p>
              </li>
            ))}
          </ul>
          <p className="lesson-block__note">
            Taught in a manual hatchback. A valid G2 or G licence
            is required.
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

      {/* ---------- Real reviews ---------- */}
      <section
        className="section section--light"
        aria-labelledby="quotes-heading"
      >
        <div className="section__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">From the Google reviews</p>
            <h2 id="quotes-heading">After one lesson</h2>
          </header>
          <LessonQuotes quotes={QUOTES} />
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
            walks you from clutch control to independent driving — or{' '}
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
