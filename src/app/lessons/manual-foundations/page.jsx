import Link from 'next/link'
import BookButton from '../../../components/BookButton'
import Breadcrumbs from '../../../components/Breadcrumbs'
import LessonFaq from '../../../components/lessons/LessonFaq'
import { faqSubset } from '../../../lib/faqs'

export const metadata = {
  title: 'Manual Foundations Package — 3 Lessons | Clutch Academy',
  description:
    'Learn to drive manual in Toronto from zero: a three-lesson progression from clutch control to traffic, hill starts, and independent driving. $299 + HST.',
  alternates: { canonical: '/lessons/manual-foundations' },
}

// Keyword target (08 §4): "learn to drive manual Toronto" (beginners).
// Pricing is the post-August-1 offering: $299 + HST, three 75-minute lessons.

// The three-lesson progression, from the brief. Descriptions elaborate only
// with language already established on the site (HowItWorks first-lesson
// copy) — no invented curriculum detail.
const CURRICULUM = [
  {
    n: 1,
    title: 'Clutch control, bite point, starts & stops',
    desc: 'Somewhere quiet to begin: what the clutch actually does, finding the bite point, smooth takeoffs, and controlled stops — repeated until they feel natural.',
  },
  {
    n: 2,
    title: 'Traffic, intersections, hill starts',
    desc: 'Real Toronto roads: reading traffic, stopping and starting at intersections, and the skill everyone worries about — starting on a hill without rolling back.',
  },
  {
    n: 3,
    title: 'Independent driving, smoother shifting',
    desc: 'You drive, Sam coaches. Longer stretches of independent driving with smoother, quicker shifts — finishing road-confident, not just lesson-confident.',
  },
]

// Real quotes from the Google-review set — both describe the multi-lesson
// progression this package is built around.
const QUOTES = [
  {
    text: 'Used to think driving manual was super stressful, pure anxiety, lots of stalling, but one lesson with Sam and no more stalling, looking forward to learning smooth downshifts and hill starts in lessons 2 and 3!',
    name: 'Obiora Ejiofor',
  },
  {
    text: "Sam was fantastic throughout the whole process. He was patient with me on my first lesson and by the third, I feel ready to navigate in Europe driving standard. Can't recommend Clutch enough to anyone looking to learn standard.",
    name: 'Erica Carnicelli',
  },
]

const FAQ_IDS = ['never-driven', 'how-many', 'location', 'car', 'cancellation']

export default function ManualFoundationsPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Lessons', href: '/manual-driving-lessons' },
          { label: 'Manual Foundations' },
        ]}
      />

      {/* ---------- Hero ---------- */}
      <section
        className="section section--first"
        aria-labelledby="lesson-heading"
      >
        <div className="section__inner lesson-hero__inner">
          <p className="section-header__eyebrow">
            Private · 3 Lessons · Most Popular
          </p>
          <h1 id="lesson-heading" className="lesson-hero__headline">
            Manual Foundations Package
          </h1>
          <p className="lesson-hero__lead">
            The structured way to learn to drive manual in Toronto, built for
            complete beginners. Three one-on-one lessons take you from your
            first touch of the clutch to driving real roads independently —
            each one picking up exactly where the last left off.
          </p>
          {/* PENDING: real lesson photo for this page (08 §7 pending assets). */}
          <p className="lesson-hero__lead">
            Most students arrive nervous — and leave wondering what they were
            nervous about.
          </p>
          <p className="lesson-hero__price">
            $299
            <span className="lesson-hero__price-unit">
              / 3 lessons + HST · save $28 vs. three singles
            </span>
          </p>
          <BookButton source="packages_3pack" className="btn btn--primary">
            Book This Package
          </BookButton>
        </div>
      </section>

      {/* ---------- The progression ---------- */}
      <section className="section" aria-labelledby="curriculum-heading">
        <div className="section__inner lesson-block__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">The progression</p>
            <h2 id="curriculum-heading">Three lessons, one clear arc</h2>
          </header>
          <ol className="lesson-curriculum">
            {CURRICULUM.map((lesson) => (
              <li key={lesson.n} className="lesson-curriculum__item">
                <span className="lesson-curriculum__num" aria-hidden="true">
                  {String(lesson.n).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="lesson-curriculum__title">{lesson.title}</h3>
                  <p className="lesson-curriculum__desc">{lesson.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="lesson-block__note">
            Every lesson is one-on-one in a manual 2015 Volkswagen Golf, on
            real Toronto roads. A valid G2 or G licence is required.
          </p>
        </div>
      </section>

      {/* ---------- Who it's for ---------- */}
      <section className="section" aria-labelledby="who-heading">
        <div className="section__inner lesson-block__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">Who it’s for</p>
            <h2 id="who-heading">Ideal for complete beginners</h2>
          </header>
          <ul className="lesson-block__list">
            <li>
              You’ve never driven a stick shift — this package assumes zero
              experience and builds from the ground up.
            </li>
            <li>
              You want structure: a planned progression instead of piecing
              together one-off lessons.
            </li>
            <li>
              You want to finish genuinely road-confident — most beginners
              feel confident after three lessons.
            </li>
          </ul>
        </div>
      </section>

      {/* ---------- Trust ---------- */}
      {/* ---------- Real reviews ---------- */}
      <section className="section" aria-labelledby="quotes-heading">
        <div className="section__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">From the Google reviews</p>
            <h2 id="quotes-heading">The progression, in students’ words</h2>
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
            <p className="section-header__eyebrow">Start from zero</p>
            <h2 id="next-heading">Book your three lessons</h2>
          </header>
          <BookButton
            source="packages_3pack"
            className="btn btn--primary btn--xl"
          >
            Book This Package
          </BookButton>
          <p className="lesson-next__links">
            Want downtown, highway, and rush-hour mastery on top of the
            foundations? Step up to{' '}
            <Link href="/lessons/manual-confidence">
              Complete Manual Confidence
            </Link>
            . Already driven manual before? A{' '}
            <Link href="/lessons/individual">single lesson</Link> may be all
            you need — or{' '}
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
