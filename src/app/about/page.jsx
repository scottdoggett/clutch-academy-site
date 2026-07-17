import Image from 'next/image'
import Link from 'next/link'
import BookButton from '../../components/BookButton'
import TrustBlock from '../../components/lessons/TrustBlock'
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

            {/* PENDING: origin-story wording below is drafted from the brand
                positioning — have Sam confirm or personalize it in the
                content review pass. */}
            <p className="about-story__para">
              Hey — I’m Sam. Clutch Academy exists because most people who
              want to learn manual have nowhere good to learn it: no stick
              shift in the family, no friend patient enough to lend you their
              clutch. Just the curiosity, and no calm place to put it. So I
              made teaching it my job.
            </p>
            <p className="about-story__para">
              If the idea of driving stick makes you nervous, you’re in good
              company — most students arrive nervous. Stalling in traffic,
              rolling back on a hill, grinding a gear: everyone worries about
              the same things. That’s why every lesson here is calm, patient,
              and judgment-free. Stalls aren’t failures — they’re the
              curriculum.
            </p>
            <p className="about-story__para">
              You’ll learn on real Toronto roads — quiet streets first, busier
              ones when you’re ready — and every lesson moves at your pace,
              not a fixed script. The goal was never to get you through a
              lesson. It’s to make you the person who doesn’t think twice
              about driving a manual.
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
      {/* Full-bleed band — renders its own <section>, no inner wrapper. */}
      <TrustBlock />

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
