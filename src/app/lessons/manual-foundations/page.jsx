import Link from 'next/link'
import BookButton from '../../../components/BookButton'
import WasPrice from '../../../components/WasPrice'
import Breadcrumbs from '../../../components/Breadcrumbs'
import '../../../components/lessons/lessons.css'

export const metadata = {
  title: 'Manual Foundations Package — 3 Lessons | Clutch Academy',
  description:
    'Learn to drive manual in Toronto from zero. Three lessons take you from clutch control to traffic, hill starts, and independent driving. $240 + HST.',
  alternates: { canonical: '/lessons/manual-foundations' },
}

// Keyword target (04-seo.md §Per-route targets): "learn to drive manual
// Toronto" (beginners).
// Pricing is the October 2026 winter offering: $240 + HST, three one-hour lessons.

// The three-lesson progression, from the brief. Descriptions elaborate only
// with language already established on the site (HowItWorks first-lesson
// copy) — no invented curriculum detail.
const CURRICULUM = [
  {
    n: 1,
    title: 'Clutch control, bite point, starts & stops',
    desc: 'You start somewhere quiet with what the clutch does and how to find the bite point. Then smooth takeoffs and controlled stops, repeated until they feel natural.',
  },
  {
    n: 2,
    title: 'Traffic, intersections, hill starts',
    desc: 'You move onto real Toronto roads to read traffic and handle stops and starts at intersections. Then hill starts without rolling back, the part everyone worries about.',
  },
  {
    n: 3,
    title: 'Independent driving, smoother shifting',
    desc: 'You drive, we coach. Longer stretches of independent driving and smoother, quicker shifts, so you finish ready to drive on your own.',
  },
]

export default function ManualFoundationsPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Lessons', href: '/manual-driving-lessons' },
          { label: 'Manual Foundations Package' },
        ]}
      />

      {/* ---------- Hero ---------- */}
      <section
        className="section section--first"
        aria-labelledby="lesson-heading"
      >
        <div className="section__inner lesson-hero__inner">
          <p className="section-header__eyebrow">Private · 3 Lessons</p>
          <h1 id="lesson-heading" className="lesson-hero__headline">
            Manual Foundations Package
          </h1>
          <p className="lesson-hero__lead">
            The structured way to learn to drive manual in Toronto, built for
            complete beginners. Three one-on-one lessons take you from your
            first touch of the clutch to driving real roads on your own. Each
            one picks up where the last left off.
          </p>
          {/* PENDING: real lesson photo for this page (07-status.md §Pending assets). */}
          <p className="lesson-hero__pull">
            Most students arrive nervous. We expect that and go at your pace.
          </p>
          <p className="lesson-hero__price">
            $240
            <WasPrice pkg="foundations" />
            <span className="lesson-hero__price-unit">
              / 3 lessons + HST · $80 a lesson
            </span>
          </p>
          <BookButton source="packages_3pack" className="btn btn--primary">
            Book This Package
          </BookButton>
        </div>
      </section>

      {/* ---------- What's included: the progression ---------- */}
      <section
        className="section section--light"
        aria-labelledby="curriculum-heading"
      >
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
            Every lesson is one-on-one in a manual hatchback, on
            real Toronto roads. You need a valid G2 or G licence.
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
              You’ve never driven a stick shift. This package assumes you’re
              starting from zero.
            </li>
            <li>
              You want a planned progression instead of piecing together
              one-off lessons.
            </li>
            <li>
              You want to come out confident on the road. Most beginners feel
              that way after three lessons.
            </li>
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
            <p className="section-header__eyebrow">Start from zero</p>
            <h2 id="next-heading">Book your three lessons</h2>
          </header>
          <BookButton
            source="packages_3pack"
            className="btn btn--primary btn--xl btn--on-light"
          >
            Book This Package
          </BookButton>
          <p className="lesson-next__links">
            Want to feel at home behind the wheel of a manual? Choose the{' '}
            <Link href="/lessons/manual-confidence">
              Complete Manual Confidence Package
            </Link>{' '}
            for two extra hours to smooth out your downshifts, learn
            rev-matching, and make driving stick feel second nature.
          </p>
        </div>
      </section>
    </>
  )
}
