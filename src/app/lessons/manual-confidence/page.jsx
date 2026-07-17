import Link from 'next/link'
import BookButton from '../../../components/BookButton'
import TrustBlock from '../../../components/lessons/TrustBlock'
import LessonFaq from '../../../components/lessons/LessonFaq'
import { faqSubset } from '../../../lib/faqs'

export const metadata = {
  title: 'Complete Manual Confidence Package — 5 Lessons | Clutch Academy',
  description:
    'Highway and city manual lessons in Toronto: five one-on-one sessions covering downtown driving, highway merging, rush-hour traffic, advanced hill starts, and parking. $400 + HST.',
  alternates: { canonical: '/lessons/manual-confidence' },
}

// Keyword target (08 §4): "highway + city manual lessons Toronto"
// (supporting: highway lessons, hill starts, city driving).
// Price is the CURRENT (pre-August-1) offering — PENDING: Phase 10 flips to
// $469 + HST with 75-minute lessons.

// The six skills, verbatim from the brief. Descriptions add only light,
// generic framing — no invented curriculum detail or route specifics.
const SKILLS = [
  {
    title: 'Downtown driving',
    desc: 'City traffic at its densest — tight streets, constant stops, and shifting that has to happen without thinking about it.',
  },
  {
    title: 'Highway merging',
    desc: 'Confident acceleration through the gears, timing the merge, and holding highway speed comfortably.',
  },
  {
    title: 'Rush-hour traffic',
    desc: 'Stop-and-go without the clutch anxiety: creeping, holding position, and staying smooth when traffic isn’t.',
  },
  {
    title: 'Advanced hill starts',
    desc: 'Steeper grades, tighter spots, cars close behind — hill starts that hold up under real pressure.',
  },
  {
    title: 'Parking',
    desc: 'Low-speed clutch finesse where it’s hardest: parallel spots, ramps, and tight lots.',
  },
  {
    title: 'Personalized coaching',
    desc: 'Five sessions shaped around how you learn — extra reps where you need them, faster progression where you don’t.',
  },
]

// Real quotes from the Google-review set — both speak to built confidence.
const QUOTES = [
  {
    text: "Sam is a fantastic driving instructor! Incredibly patient and calm under stress, he can boost up a driving student's confidence behind the wheel in just a few hours. Manual driving was an intimidating skill for me to learn, so it was great to have trusted support for my first time trying!",
    name: 'Ryan Bergman',
  },
  {
    text: 'Great experience learning manual here. Clear instruction, patient teaching, and I felt confident behind the wheel way faster than expected.',
    name: 'Ethan Black',
  },
]

const FAQ_IDS = ['synonyms', 'location', 'pay', 'cancellation', 'gift']

export default function ManualConfidencePage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section
        className="section section--first"
        aria-labelledby="lesson-heading"
      >
        <div className="section__inner lesson-hero__inner">
          {/* PENDING: real lesson photo for this page (08 §7 pending assets). */}
          <p className="section-header__eyebrow">
            Private · 5 Lessons · The Flagship
          </p>
          <h1 id="lesson-heading" className="lesson-hero__headline">
            Complete Manual Confidence Package
          </h1>
          <p className="lesson-hero__lead">
            The premium version of learning manual: five one-on-one sessions
            of highway and city manual lessons in Toronto, covering everything
            the city can throw at a clutch — downtown, merging, rush hour,
            hills, and parking — with coaching tailored to you the whole way.
          </p>
          {/* PENDING: "confidence guarantee" — terms still to come from Sam
              (08 §7); the live site's card mentions it, so it stays until
              the wording is finalized or the client drops it. */}
          <p className="lesson-hero__lead">
            This is the package for finishing the job: not just moving the
            car, but genuine confidence anywhere — backed by the confidence
            guarantee.
          </p>
          <p className="lesson-hero__price">
            $400
            <span className="lesson-hero__price-unit">
              / 5 lessons + HST · save $50 vs. five singles
            </span>
          </p>
          <BookButton
            source="packages_confidence_5pack"
            className="btn btn--primary"
          >
            Book This Package
          </BookButton>
        </div>
      </section>

      {/* ---------- What you'll master ---------- */}
      <section className="section" aria-labelledby="skills-heading">
        <div className="section__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">The full scope</p>
            <h2 id="skills-heading">What you’ll master</h2>
          </header>
          <ul className="lesson-skills">
            {SKILLS.map((s) => (
              <li key={s.title} className="lesson-skills__item">
                <h3 className="lesson-skills__title">{s.title}</h3>
                <p className="lesson-skills__desc">{s.desc}</p>
              </li>
            ))}
          </ul>
          <p className="lesson-block__note">
            Every session is one-on-one in a manual 2015 Volkswagen Golf, on
            real Toronto roads. A valid G2 or G licence is required.
          </p>
        </div>
      </section>

      {/* ---------- Who it's for ---------- */}
      <section className="section" aria-labelledby="who-heading">
        <div className="section__inner lesson-block__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">Who it’s for</p>
            <h2 id="who-heading">For drivers who want the whole skill</h2>
          </header>
          <ul className="lesson-block__list">
            <li>
              You don’t just want to get the car moving — you want to be
              comfortable downtown, on the highway, and in rush hour.
            </li>
            <li>
              You’re planning to own or drive a manual regularly, and want it
              second nature before it has to be.
            </li>
            <li>
              You’d rather master it once, with one coach across five
              sessions, than patch gaps later.
            </li>
          </ul>
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
            <h2 id="quotes-heading">Confidence, in students’ words</h2>
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
            <p className="section-header__eyebrow">The premium path</p>
            <h2 id="next-heading">Book the flagship</h2>
          </header>
          <BookButton
            source="packages_confidence_5pack"
            className="btn btn--primary btn--xl"
          >
            Book This Package
          </BookButton>
          <p className="lesson-next__links">
            Not sure you need all five?{' '}
            <Link href="/lessons/manual-foundations">Manual Foundations</Link>{' '}
            is the three-lesson beginner progression, and a{' '}
            <Link href="/lessons/individual">single lesson</Link> works as a
            taster — or{' '}
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
