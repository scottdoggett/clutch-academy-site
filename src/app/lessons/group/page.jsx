import Link from 'next/link'
import BookButton from '../../../components/BookButton'
import WasPrice from '../../../components/WasPrice'
import Breadcrumbs from '../../../components/Breadcrumbs'
import LessonFaq from '../../../components/lessons/LessonFaq'
import LessonQuotes from '../../../components/lessons/LessonQuotes'
import { faqSubset } from '../../../lib/faqs'

export const metadata = {
  title: 'Group Manual Driving Lessons in Toronto | Clutch Academy',
  description:
    'Learn to drive manual alongside a friend — fun, supportive group stick shift lessons on real Toronto roads. 2 hours, $180 + HST. Book online.',
  alternates: { canonical: '/lessons/group' },
}

// Keyword target (08 §4): "group manual driving lessons Toronto" /
// learn-with-a-friend.
//
// Group format: one 2-hour group at $180 + HST, the October 2026 winter
//    offering (live on main in f8645c4). The brief mentioned 1-hour and
//    2.5-hour options; August 1 shipped a single 2.5-hour group at $220, and
//    winter pricing replaced it with this one. A 1-hour option would be an
//    addition.
// ❓ BLOCKED: whether group pricing is per person or per pair — copy below
//    deliberately avoids claiming either. Confirm with Sam before launch.
//
// Until September 28, 2026 the page had one more section, a card for the one
// 2.5-hour option with its own price and Book button (`packages_group_2hr`).
// It repeated the hero's price and booking, so it went when the four package
// pages took one shape, and its source tag was retired (05-analytics.md).

// PENDING: GROUP-LESSON INCLUSIONS — final 3–5 bullets from Sam (08 §7).
// These carry over the placeholder bullets already shown on the live site's
// group cards.
const INCLUDED = [
  'Learn with a friend in a supportive, low-pressure setting',
  'Take turns at the wheel — watching is learning too',
  'Great for first-timers who want the moral support',
]

// PENDING: Sam to approve. Written September 28, 2026, when this page gained
// the "Who it's for" section the other three have. Nothing here is a new
// claim: each line restates the hub's group card and chooser ("Learn
// alongside a friend", "Share the experience and split the nerves", "Great
// low-pressure first exposure to the clutch", "You'd rather learn with a
// friend").
const WHO = [
  'You’d rather learn with a friend than on your own.',
  'You want someone to share the experience with and split the nerves.',
  'You’re new to the clutch and want a low-pressure first go at it.',
]

// Real quotes from the Google-review set — chosen for the fun, supportive
// experience this page sells (no review names a group lesson specifically,
// so none is presented as one).
const QUOTES = [
  {
    text: 'I had the best time learning how to drive manual with Sam. He has great customer service and wonderful tips for driving with a stick. Thank you Clutch team!!!',
    name: 'Dakota Abell',
  },
  {
    text: 'Had such a positive experience! Very professional, calm, and efficient. Would definitely recommend!',
    name: 'Hannah Bance',
  },
]

const FAQ_IDS = ['license', 'never-driven', 'wear', 'pay', 'gift']

export default function GroupLessonsPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Lessons', href: '/manual-driving-lessons' },
          { label: 'Group Manual Lessons' },
        ]}
      />

      {/* ---------- Hero ---------- */}
      <section
        className="section section--first"
        aria-labelledby="lesson-heading"
      >
        <div className="section__inner lesson-hero__inner">
          <p className="section-header__eyebrow">Group · With a Friend</p>
          <h1 id="lesson-heading" className="lesson-hero__headline">
            Group Manual Lessons
          </h1>
          <p className="lesson-hero__lead">
            Group manual driving lessons in Toronto for people who’d rather
            not do it alone: grab a friend, share the nerves, and learn the
            clutch together in a fun, supportive environment — on real roads,
            with Sam coaching every turn at the wheel.
          </p>
          {/* PENDING: real lesson photo for this page (08 §7 pending assets). */}
          <p className="lesson-hero__pull">
            Most students arrive nervous — and leave wondering what they were
            nervous about. Bringing a friend makes that even easier.
          </p>
          <p className="lesson-hero__price">
            $180
            <WasPrice pkg="group" />
            <span className="lesson-hero__price-unit">/ 2 hours + HST</span>
          </p>
          <BookButton source="packages_group" className="btn btn--primary">
            Book a Group Lesson
          </BookButton>
        </div>
      </section>

      {/* ---------- What's included: what to expect ---------- */}
      <section
        className="section section--light"
        aria-labelledby="expect-heading"
      >
        <div className="section__inner lesson-block__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">What to expect</p>
            <h2 id="expect-heading">Supportive, social, low-pressure</h2>
          </header>
          <ul className="lesson-included">
            {INCLUDED.map((item) => (
              <li key={item} className="lesson-included__item">
                <p className="lesson-included__line">{item}</p>
              </li>
            ))}
          </ul>
          <p className="lesson-block__note">
            Taught in a manual hatchback on real Toronto roads.
            Every driver needs a valid G2 or G licence.
          </p>
        </div>
      </section>

      {/* ---------- Who it's for ---------- */}
      <section className="section" aria-labelledby="who-heading">
        <div className="section__inner lesson-block__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">Who it’s for</p>
            <h2 id="who-heading">For learning with a friend</h2>
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
            <h2 id="quotes-heading">The experience, in students’ words</h2>
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
            <p className="section-header__eyebrow">Bring a friend</p>
            <h2 id="next-heading">Book your group lesson</h2>
          </header>
          <BookButton
            source="packages_group"
            className="btn btn--primary btn--xl btn--on-light"
          >
            Book a Group Lesson
          </BookButton>
          <p className="lesson-next__links">
            Prefer the wheel to yourself? Start with an{' '}
            <Link href="/lessons/individual">individual lesson</Link> or the{' '}
            <Link href="/lessons/manual-foundations">
              Manual Foundations Package
            </Link>{' '}
            — or{' '}
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
