import Link from 'next/link'
import BookButton from '../../../components/BookButton'
import Breadcrumbs from '../../../components/Breadcrumbs'
import LessonFaq from '../../../components/lessons/LessonFaq'
import { faqSubset } from '../../../lib/faqs'

export const metadata = {
  title: 'Group Manual Driving Lessons in Toronto | Clutch Academy',
  description:
    'Learn to drive manual alongside a friend — fun, supportive group stick shift lessons on real Toronto roads. 2.5 hours, $219 + HST. Book online.',
  alternates: { canonical: '/lessons/group' },
}

// Keyword target (08 §4): "group manual driving lessons Toronto" /
// learn-with-a-friend.
//
// ❓ BLOCKED (Phase 0, still open): the post-August-1 group format —
//    the brief mentioned both 1-hour and 2.5-hour options, but the new pricing
//    lists ONLY a 2.5-hour group at $219 + HST, and that is what the live site
//    shipped on August 1 (308317c). This page now matches the live offering.
//    If Sam wants a shorter option back, it is an addition, not a revert.
// ❓ BLOCKED: whether group pricing is per person or per pair — copy below
//    deliberately avoids claiming either. Confirm with Sam before launch.
//
// The source tag stays `packages_group_2hr` even though the option is now
// 2.5 hours: it is the same card in the same slot, and keeping the tag keeps
// the GA4 series continuous across the switch (matches the live site).
const OPTIONS = [
  {
    title: '2.5-Hour Group Lesson',
    desc: 'Bring a friend and split the experience — plenty of seat time each, at a fun, low-pressure pace.',
    price: '$219',
    unit: '/ 2.5 hours + HST',
    source: 'packages_group_2hr',
    cta: 'Book 2.5-Hour Group',
  },
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
          <p className="lesson-hero__lead">
            Most students arrive nervous — and leave wondering what they were
            nervous about. Bringing a friend makes that even easier.
          </p>
          <p className="lesson-hero__price">
            $219
            <span className="lesson-hero__price-unit">/ 2.5 hours + HST</span>
          </p>
          <BookButton source="packages_group" className="btn btn--primary">
            Book a Group Lesson
          </BookButton>
        </div>
      </section>

      {/* ---------- The current group option ---------- */}
      <section className="section" aria-labelledby="options-heading">
        <div className="section__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">How it works</p>
            <h2 id="options-heading">The group session</h2>
          </header>
          <div className="lesson-options">
            {OPTIONS.map((o) => (
              <article key={o.source} className="lesson-option">
                <h3 className="lesson-option__title">{o.title}</h3>
                <p className="lesson-option__desc">{o.desc}</p>
                <p className="lesson-option__price">
                  {o.price}
                  <span className="lesson-option__unit">{o.unit}</span>
                </p>
                <BookButton source={o.source} className="btn btn--secondary">
                  {o.cta}
                </BookButton>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- What to expect ---------- */}
      <section className="section" aria-labelledby="expect-heading">
        <div className="section__inner lesson-block__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">What to expect</p>
            <h2 id="expect-heading">Supportive, social, low-pressure</h2>
          </header>
          {/* PENDING: GROUP-LESSON INCLUSIONS — final 3–5 bullets from Sam
              (08 §7). The list below carries over the placeholder bullets
              already shown on the live site's group cards. */}
          <ul className="lesson-block__list">
            <li>Learn with a friend in a supportive, low-pressure setting</li>
            <li>Take turns at the wheel — watching is learning too</li>
            <li>Great for first-timers who want the moral support</li>
          </ul>
          <p className="lesson-block__note">
            Taught in a manual 2015 Volkswagen Golf on real Toronto roads.
            Every driver needs a valid G2 or G licence.
          </p>
        </div>
      </section>

      {/* ---------- Trust ---------- */}
      {/* ---------- Real reviews ---------- */}
      <section className="section" aria-labelledby="quotes-heading">
        <div className="section__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">From the Google reviews</p>
            <h2 id="quotes-heading">The experience, in students’ words</h2>
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
            <p className="section-header__eyebrow">Bring a friend</p>
            <h2 id="next-heading">Book your group lesson</h2>
          </header>
          <BookButton
            source="packages_group"
            className="btn btn--primary btn--xl"
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
