import Link from 'next/link'
import BookButton from '../../../components/BookButton'
import WasPrice from '../../../components/WasPrice'
import Breadcrumbs from '../../../components/Breadcrumbs'
import '../../../components/lessons/lessons.css'

export const metadata = {
  title: 'Complete Manual Confidence Package — 5 Lessons | Clutch Academy',
  description:
    'Five one-on-one manual lessons in Toronto. Start from zero, then refine your technique: smoother downshifts, rev-matching and clutch control. $400 + HST.',
  alternates: { canonical: '/lessons/manual-confidence' },
}

// Keyword target (04-seo.md §Per-route targets): "highway + city manual
// lessons Toronto" (supporting: highway lessons, hill starts, city driving).
// Since November 5, 2026 the page no longer pitches highway, downtown or
// rush-hour driving (Sam repositioned the package), so that target needs
// revisiting.
// Pricing is the October 2026 winter offering: $400 + HST, five one-hour lessons.

// The six skills, verbatim from Sam's November 5, 2026 feedback, his
// Canadian "Practise" kept. They replaced the brief's downtown, highway,
// rush-hour, hill-start, parking and coaching six.
const SKILLS = [
  {
    title: 'More time behind the wheel',
    desc: 'Get two extra hours of coached practice to make starts, stops and shifts feel more natural.',
  },
  {
    title: 'Smoother downshifts',
    desc: 'Practise shifting into a lower gear smoothly and learn when it makes sense to downshift.',
  },
  {
    title: 'Rev-matching',
    desc: 'Learn how to match engine speed to the next gear for smoother downshifts.',
  },
  {
    title: 'Choosing the right gear',
    desc: 'Get a feel for when to shift and which gear suits your speed and what you’re about to do.',
  },
  {
    title: 'Low-speed clutch control',
    desc: 'Fine-tune your clutch control when reversing, parking and pulling away on hills.',
  },
  {
    title: 'Coaching tailored to you',
    desc: 'Spend more time on the skills you find tricky and get feedback on your timing and technique.',
  },
]

export default function ManualConfidencePage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Lessons', href: '/manual-driving-lessons' },
          { label: 'Complete Manual Confidence Package' },
        ]}
      />

      {/* ---------- Hero ---------- */}
      <section
        className="section section--first"
        aria-labelledby="lesson-heading"
      >
        <div className="section__inner lesson-hero__inner">
          <p className="section-header__eyebrow">
            Private · 5 Lessons · Recommended
          </p>
          <h1 id="lesson-heading" className="lesson-hero__headline">
            Complete Manual Confidence Package
          </h1>
          <p className="lesson-hero__lead">
            Five one-on-one manual lessons in Toronto to build your skills and
            refine your technique. They start from zero, so you don’t need to
            have driven stick before. Once you have the basics, two extra hours
            of coached practice smooth out your downshifts, show you when to
            rev-match, and improve your gear selection, shift timing and
            clutch control.
          </p>
          {/* PENDING: real lesson photo for this page (07-status.md §Pending assets). */}
          <p className="lesson-hero__pull">
            The package to take if you want to feel at home behind the wheel
            of a manual.
          </p>
          <p className="lesson-hero__price">
            $400
            <WasPrice pkg="confidence" />
            <span className="lesson-hero__price-unit">
              / 5 lessons + HST · $80 a lesson
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

      {/* ---------- What's included: what you'll master ---------- */}
      <section
        className="section section--light"
        aria-labelledby="skills-heading"
      >
        <div className="section__inner lesson-block__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">The full scope</p>
            <h2 id="skills-heading">What you’ll master</h2>
          </header>
          <ul className="lesson-included">
            {SKILLS.map((s) => (
              <li key={s.title} className="lesson-included__item">
                <h3 className="lesson-included__title">{s.title}</h3>
                <p className="lesson-included__desc">{s.desc}</p>
              </li>
            ))}
          </ul>
          <p className="lesson-block__note">
            New to manual? The first lessons cover clutch control, the bite
            point, and starts and stops before any of this. Every session is
            one-on-one in a manual hatchback, on real Toronto roads. You need a
            valid G2 or G licence.
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
              You want to go beyond the basics, to smoother downshifts,
              rev-matching and better shift timing.
            </li>
            <li>
              You’re planning to own or drive a manual regularly, and want it
              second nature before it has to be.
            </li>
            <li>
              You’d rather learn it properly once, with one coach across five
              sessions, than patch gaps later.
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
            <p className="section-header__eyebrow">From zero to second nature</p>
            <h2 id="next-heading">Book your five lessons</h2>
          </header>
          <BookButton
            source="packages_confidence_5pack"
            className="btn btn--primary btn--xl btn--on-light"
          >
            Book This Package
          </BookButton>
          <p className="lesson-next__links">
            Not sure you need all five? The{' '}
            <Link href="/lessons/manual-foundations">
              Manual Foundations Package
            </Link>{' '}
            is three lessons for beginners, and a{' '}
            <Link href="/lessons/individual">single lesson</Link> works as a
            taster. Or{' '}
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
