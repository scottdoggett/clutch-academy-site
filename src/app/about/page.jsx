import Image from 'next/image'
import Link from 'next/link'
import BookButton from '../../components/BookButton'
import headshot from '../../../public/headshot.jpeg'
import './about.css'

export const metadata = {
  title: 'About Clutch Academy | Manual Driving School in Toronto',
  description:
    'Why Sam Anthony started Clutch Academy — calm, patient, judgment-free manual driving lessons on real Toronto roads, tailored to your pace.',
  alternates: { canonical: '/about' },
}

// Icon grid items — verbatim from the July 2026 brief ("Why Students Choose
// Clutch Academy", simple icon grid with checkmarks).
const WHY_ITEMS = [
  'Calm, patient instruction',
  'One-on-one lessons',
  'Real Toronto roads',
  'Learn at your own pace',
  'Online booking & secure payment',
  'Hundreds of successful lessons taught',
]

// Common student fears and how they're overcome (brief: "What Lessons Are
// Really Like"). Each fear is grounded in what real students say in the
// Google reviews — nerves, stalling, hills, fear of judgment.
const FEARS = [
  {
    fear: '“What if I stall in the middle of an intersection?”',
    answer:
      'You will stall — everyone does, and it’s part of the plan. We practice the calm reset early: clutch in, restart, breathe, go. After a few repetitions it stops being scary and starts being routine.',
  },
  {
    fear: '“I’ve literally never touched a stick shift.”',
    answer:
      'Perfect — that’s exactly who the first lesson is built for. We start somewhere quiet with what the clutch actually does, find the bite point, and get you moving within minutes. No lecture, no assumptions.',
  },
  {
    fear: '“Hills terrify me.”',
    answer:
      'They terrify everyone at first, so we build up to them deliberately. By the time you meet a real Toronto hill, you’ll have a step-by-step technique to hold, start, and go — no rolling back, no panic.',
  },
  {
    fear: '“Will you get frustrated with me?”',
    answer:
      'No. Patience isn’t a slogan here — it’s the teaching style. Every stall, missed shift, and do-over is expected. You get one-on-one coaching and as many repetitions as you need, without the judgment.',
  },
]

// Verbatim copy supplied in the brief ("Why Learn Manual Driving").
const WHY_MANUAL = [
  'In many parts of the world, learning to drive stick — also known as stick shift or manual — is actually just learning to drive.',
  'While manual transmissions have become an increasingly uncommon part of Canadian culture, they’re still very prominent in most other parts of the world. Knowing how to drive one could save your life one day.',
  'Plus, it’s a much more engaging driving experience, opens you up to a lot more choices for your next car, and actually makes you a better driver as a whole, even with an automatic.',
  'Most importantly: You’ll look cool doing it.',
]

const PACKAGE_LINKS = [
  {
    href: '/lessons/individual',
    label: 'Individual Manual Lesson',
    desc: 'A refresher, or your first time on a clutch.',
  },
  {
    href: '/lessons/manual-foundations',
    label: 'Manual Foundations (3 lessons)',
    desc: 'Complete beginner to independent driving.',
  },
  {
    href: '/lessons/manual-confidence',
    label: 'Complete Manual Confidence (5 lessons)',
    desc: 'Downtown, highway, rush hour — the flagship.',
  },
  {
    href: '/lessons/group',
    label: 'Group Manual Lessons',
    desc: 'Learn alongside a friend.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* ---------- The personal story ---------- */}
      <section
        className="section section--first about-story"
        aria-labelledby="about-heading"
      >
        <div className="section__inner about-story__grid">
          <div className="about-story__visual">
            <Image
              className="tinted-photo about-story__photo"
              src={headshot}
              alt="Sam Anthony, founder and lead instructor of Clutch Academy"
              priority
              sizes="(max-width: 767px) 75vw, 380px"
            />
          </div>

          <div className="about-story__text">
            <p className="section-header__eyebrow">
              Sam Anthony · Founder &amp; Lead Instructor
            </p>
            <h1 id="about-heading" className="about-story__headline">
              The story behind Clutch Academy
            </h1>

            {/* Origin story supplied by Sam in the Site 2.0 review doc
                (August 2026) — this is his own wording, not drafted copy.
                Don't rewrite it without asking him. */}
            <p className="about-story__para">
              A few years ago, I made one of the biggest decisions of my life:
              I walked away from a career that looked great on paper but
              didn’t feel right.
            </p>
            <p className="about-story__para">
              I didn’t have all the answers. I tried different paths, moved
              cities, worked different jobs, and spent a lot of time figuring
              out what actually mattered to me. Through all of it, one thing
              became clear: I wanted to build something that genuinely helped
              people while letting me be myself every day.
            </p>
            <p className="about-story__para">That journey led to Clutch Academy.</p>
            <p className="about-story__para">
              I’ve always loved driving manual, but what surprised me even
              more was how much I loved teaching it. There’s something
              incredibly rewarding about watching someone go from nervous and
              overwhelmed to confidently shifting gears on their own. Seeing
              that moment when everything finally “clicks” is what makes this
              business so fulfilling.
            </p>
            <p className="about-story__para">
              At Clutch Academy, my goal isn’t just to teach you how to drive
              stick—it’s to create an environment where you feel comfortable
              asking questions, making mistakes, and learning at your own
              pace. Whether you’ve never touched a clutch before or just need
              to build confidence, every lesson is patient, practical, and
              completely judgment-free.
            </p>
            <p className="about-story__para">
              Starting Clutch Academy was a leap of faith, but it’s become one
              of the best decisions I’ve ever made. Every student I work with
              reminds me why I took that leap in the first place.
            </p>
            <p className="about-story__para">
              I look forward to helping you discover just how fun—and
              rewarding—driving manual can be.
            </p>

            <BookButton source="about_page" className="btn btn--primary">
              Book a Lesson with Sam
            </BookButton>
          </div>
        </div>
      </section>

      {/* ---------- Why Students Choose Clutch Academy ---------- */}
      <section
        className="section about-why"
        aria-labelledby="why-choose-heading"
      >
        <div className="section__inner">
          <header className="section-header section-header--center">
            <h2 id="why-choose-heading">Why Students Choose Clutch Academy</h2>
          </header>
          <ul className="about-why__grid">
            {WHY_ITEMS.map((item) => (
              <li key={item} className="about-why__item">
                <span className="about-why__check" aria-hidden="true">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- What Lessons Are Really Like ---------- */}
      <section
        className="section about-fears"
        aria-labelledby="fears-heading"
      >
        <div className="section__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">No judgment, ever</p>
            <h2 id="fears-heading">What Lessons Are Really Like</h2>
            <p className="section-header__lead">
              Most students arrive nervous and leave wondering what they were
              nervous about. Here’s what the worries actually look like from
              the driver’s seat.
            </p>
          </header>
          <div className="about-fears__grid">
            {FEARS.map((f) => (
              <article key={f.fear} className="about-fears__card">
                <h3 className="about-fears__fear">{f.fear}</h3>
                <p className="about-fears__answer">{f.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Why Learn Manual Driving (brief copy, verbatim) ------- */}
      <section
        className="section about-manual"
        aria-labelledby="why-manual-heading"
      >
        <div className="section__inner about-manual__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">Worth learning</p>
            <h2 id="why-manual-heading">Why Learn Manual Driving</h2>
          </header>
          <div className="about-manual__copy">
            {WHY_MANUAL.map((para) => (
              <p key={para.slice(0, 24)} className="about-manual__para">
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Trust ---------- */}
      {/* PENDING: dedicated student testimonials from Sam (08 §7 — real
          quotes only, no invented reviews). When they land, they slot in
          here as a quote strip alongside the rating block. */}
      {/* ---------- Route out to the package pages ---------- */}
      <section
        className="section about-next"
        aria-labelledby="about-next-heading"
      >
        <div className="section__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">Ready when you are</p>
            <h2 id="about-next-heading">Pick where to start</h2>
          </header>
          <ul className="about-next__list">
            {PACKAGE_LINKS.map((p) => (
              <li key={p.href} className="about-next__item">
                <Link href={p.href} className="about-next__link">
                  {p.label}
                </Link>
                <p className="about-next__desc">{p.desc}</p>
              </li>
            ))}
          </ul>
          <p className="about-next__hub">
            Not sure which fits?{' '}
            <Link href="/manual-driving-lessons">
              Compare all lesson options
            </Link>{' '}
            or <Link href="/faq">read the FAQ</Link>.
          </p>
        </div>
      </section>

    </>
  )
}
