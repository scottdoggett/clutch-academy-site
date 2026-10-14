import Link from 'next/link'
import BookButton from '../../../components/BookButton'
import WasPrice from '../../../components/WasPrice'
import Breadcrumbs from '../../../components/Breadcrumbs'
import LessonFaq from '../../../components/lessons/LessonFaq'
import LessonQuotes from '../../../components/lessons/LessonQuotes'
import { faqSubset } from '../../../lib/faqs'

export const metadata = {
  title: 'Complete Manual Confidence Package — 5 Lessons | Clutch Academy',
  description:
    'Highway and city manual lessons in Toronto. Five one-on-one sessions: downtown, highway merging, rush hour, advanced hill starts, and parking. $400 + HST.',
  alternates: { canonical: '/lessons/manual-confidence' },
}

// Keyword target (04-seo.md §Per-route targets): "highway + city manual
// lessons Toronto" (supporting: highway lessons, hill starts, city driving).
// Pricing is the October 2026 winter offering: $400 + HST, five one-hour lessons.

// The six skills, verbatim from the brief. Descriptions add only light,
// generic framing — no invented curriculum detail or route specifics.
const SKILLS = [
  {
    title: 'Downtown driving',
    desc: 'The city at its busiest: tight streets, constant stops, and shifts you make without thinking.',
  },
  {
    title: 'Highway merging',
    desc: 'Accelerating through the gears, timing the merge, and settling in at highway speed.',
  },
  {
    title: 'Rush-hour traffic',
    desc: 'Stop-and-go without the clutch anxiety: creeping, holding position, and staying smooth when traffic isn’t.',
  },
  {
    title: 'Advanced hill starts',
    desc: 'Hill starts on steeper grades, in tighter spots, with a car close behind you.',
  },
  {
    title: 'Parking',
    desc: 'Low-speed clutch finesse where it’s hardest: parallel spots, ramps, and tight lots.',
  },
  {
    title: 'Personalized coaching',
    desc: 'Five sessions built around how you learn, with extra reps where you need them and less time where you don’t.',
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
            Private · 5 Lessons · Starts From Zero
          </p>
          <h1 id="lesson-heading" className="lesson-hero__headline">
            Complete Manual Confidence Package
          </h1>
          <p className="lesson-hero__lead">
            Five one-on-one highway and city manual lessons in Toronto. They
            start from zero, so you don’t need to have driven stick before,
            and finish with everything the city can throw at a clutch:
            downtown, merging, rush hour, hills and parking.
          </p>
          {/* PENDING: real lesson photo for this page (07-status.md §Pending assets). */}
          <p className="lesson-hero__pull">
            The package to take if you want to be confident wherever you
            drive.
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
              You want to be comfortable downtown, on the highway, and in rush
              hour.
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

      {/* ---------- Real reviews ---------- */}
      <section
        className="section section--light"
        aria-labelledby="quotes-heading"
      >
        <div className="section__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">From the Google reviews</p>
            <h2 id="quotes-heading">Confidence, in students’ words</h2>
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
            <p className="section-header__eyebrow">From zero to the highway</p>
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
