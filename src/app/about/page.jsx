import Image from 'next/image'
import Link from 'next/link'
import BookButton from '../../components/BookButton'
import WhySigns from '../../components/about/WhySigns'
import headshot from '../../../public/headshot.jpeg'
import './about.css'

export const metadata = {
  title: 'About Clutch Academy | Manual Driving School in Toronto',
  description:
    'How Clutch Academy started, and how we teach manual driving lessons on real Toronto roads, at your pace, with no judgment.',
  alternates: { canonical: '/about' },
}

// Common student fears and how they're overcome (brief: "What Lessons Are
// Really Like"). Each fear is grounded in what real students say in the
// Google reviews — nerves, stalling, hills, fear of judgment.
const FEARS = [
  {
    fear: '“What if I stall in the middle of an intersection?”',
    answer:
      'You will stall. Everyone does, and it’s part of the plan. We practice the reset early: clutch in, restart, breathe, go. After a few tries it’s routine.',
  },
  {
    fear: '“I’ve literally never touched a stick shift.”',
    answer:
      'That’s who the first lesson is for. We start somewhere quiet with what the clutch does, find the bite point, and get you moving within minutes. No lecture.',
  },
  {
    fear: '“Hills terrify me.”',
    answer:
      'They terrify everyone at first, so we work up to them slowly. By the time you meet a real Toronto hill, you’ll know how to hold, start, and go without rolling back.',
  },
  {
    fear: '“Will you get frustrated with me?”',
    answer:
      'No. We expect every stall, missed shift, and do-over. You get one-on-one coaching and as many tries as you need, and nobody judges you for needing them.',
  },
]

const PACKAGE_LINKS = [
  {
    href: '/lessons/individual',
    label: 'Individual Manual Lesson',
    desc: 'A refresher, or your first time on a clutch.',
  },
  {
    href: '/lessons/manual-foundations',
    label: 'Manual Foundations Package',
    desc: 'Three lessons, complete beginner to independent driving.',
  },
  {
    href: '/lessons/manual-confidence',
    label: 'Complete Manual Confidence Package',
    desc: 'Five lessons, from the basics to smoother downshifts and rev-matching.',
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
      {/* ---------- Why Students Choose Clutch Academy ----------
          The opening band since November 5, 2026, and the page's h1. Bands
          run red, beige, red, beige: WhySigns, What Lessons Are Really
          Like, the story, Pick where to start. */}
      <WhySigns />

      {/* ---------- What Lessons Are Really Like ---------- */}
      <section
        className="section section--light about-fears"
        aria-labelledby="fears-heading"
      >
        <div className="section__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">No judgment, ever</p>
            <h2 id="fears-heading">What Lessons Are Really Like</h2>
            <p className="section-header__lead">
              Most students arrive nervous. Here’s what the usual worries look
              like once you’re in the driver’s seat.
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

      {/* ---------- The personal story ----------
          Third since November 5, 2026, straight above Pick where to start.
          It stays on the red: the headshot multiplies onto it (.tinted-photo
          in globals.css). */}
      <section className="section about-story" aria-labelledby="story-heading">
        <div className="section__inner about-story__grid">
          <div className="about-story__visual">
            <Image
              className="tinted-photo about-story__photo"
              src={headshot}
              alt="Sam Anthony, founder and lead instructor of Clutch Academy"
              sizes="(max-width: 767px) 75vw, 380px"
            />
          </div>

          <div className="about-story__text">
            <p className="section-header__eyebrow">
              Sam Anthony · Founder &amp; Lead Instructor
            </p>
            <h2 id="story-heading" className="about-story__headline">
              The story behind Clutch Academy
            </h2>

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
              Book a Lesson
            </BookButton>
          </div>
        </div>
      </section>

      {/* ---------- Trust ---------- */}
      {/* PENDING: dedicated student testimonials from Sam (07-status.md
          item 7 — real quotes only, no invented reviews). When they land,
          they slot in here as a quote strip. */}
      {/* ---------- Route out to the package pages ---------- */}
      <section
        className="section section--light about-next"
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
