import Link from 'next/link'
import './hub.css'

export const metadata = {
  title: 'Stick Shift & Manual Driving Lessons in Toronto | Clutch Academy',
  description:
    'Learn manual in Toronto: one-on-one stick shift lessons, three- and five-lesson packages, and group lessons with a friend. Compare every option and book online.',
  alternates: { canonical: '/manual-driving-lessons' },
}

// Summary cards for the four dedicated pages. Who-it's-for and lesson-content
// lines come from the July 2026 brief; names are the overhaul-target package
// names. Prices are the post-August-1 offering (08 §3), matching the switch
// already shipped on the live site in 308317c.
const PACKAGES = [
  {
    tag: 'Private · Single Lesson',
    title: 'Individual Manual Lesson',
    who: 'Best as a refresher, or a first introduction to driving stick.',
    points: [
      'One-on-one instruction on real Toronto roads',
      'Tailored to your starting level — zero experience is fine',
    ],
    price: '$109',
    unit: '/ 75 min + HST',
    href: '/lessons/individual',
    tier: 1,
  },
  {
    tag: 'Private · 3 Lessons',
    title: 'Manual Foundations Package',
    who: 'Ideal for complete beginners — a structured progression.',
    points: [
      'Lesson 1: clutch control, bite point, starts & stops',
      'Lesson 2: traffic, intersections, hill starts',
      'Lesson 3: independent driving, smoother shifting',
    ],
    price: '$299',
    unit: '/ 3 lessons + HST',
    href: '/lessons/manual-foundations',
    tier: 2,
    featured: true,
    badge: 'Most Popular',
  },
  {
    tag: 'Group · With a Friend',
    title: 'Group Manual Lessons',
    who: 'Learn alongside a friend in a fun, supportive environment.',
    points: [
      'Share the experience and split the nerves',
      'Great low-pressure first exposure to the clutch',
    ],
    price: '$219',
    unit: '/ 2.5 hours + HST',
    href: '/lessons/group',
    tier: 3,
  },
  {
    tag: 'Private · 5 Lessons',
    title: 'Complete Manual Confidence Package',
    who: 'The premium flagship — full mastery of real-world driving.',
    points: [
      'Downtown driving, highway merging, rush-hour traffic',
      'Advanced hill starts and parking',
      'Personalized coaching throughout',
    ],
    price: '$469',
    unit: '/ 5 lessons + HST',
    href: '/lessons/manual-confidence',
    tier: 4,
    badge: 'Best Value',
  },
]

// "Help me choose" one-liners — the hub's second internal-linking pass.
const CHOOSER = [
  {
    if: 'You’ve never touched a stick shift',
    then: 'start with the Manual Foundations Package',
    href: '/lessons/manual-foundations',
  },
  {
    if: 'You’ve driven manual before and need a refresher',
    then: 'book an Individual Manual Lesson',
    href: '/lessons/individual',
  },
  {
    if: 'You want downtown, highway, and rush-hour mastery',
    then: 'go for Complete Manual Confidence',
    href: '/lessons/manual-confidence',
  },
  {
    if: 'You’d rather learn with a friend',
    then: 'try a Group Manual Lesson',
    href: '/lessons/group',
  },
]

export default function LessonsOverviewPage() {
  return (
    <>
      {/* ---------- The four packages ---------- */}
      <section
        className="section section--first hub-packages"
        aria-labelledby="hub-packages-heading"
      >
        <div className="section__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">
              Manual · Stick Shift · Standard — same lessons
            </p>
            {/* This is the page's h1: the intro hero that used to carry it was
                removed in August 2026 so the page opens straight on the
                packages. */}
            <h1 id="hub-packages-heading">Four ways to learn</h1>
            <p className="section-header__lead">
              Each package has its own page with full details, pricing, and
              booking.
            </p>
          </header>

          <div className="hub-cards">
            {PACKAGES.map((p) => (
              <article
                key={p.href}
                className={`hub-card hub-card--tier-${p.tier} ${
                  p.featured ? 'hub-card--featured' : ''
                }`}
              >
                {p.badge && <span className="hub-card__badge">{p.badge}</span>}
                <div className="hub-card__top">
                  {/* Chip number = the card's position on the hero shift
                      gate, so the two indexes read as one system. */}
                  <span className="hub-card__gear" aria-hidden="true">
                    {p.tier}
                  </span>
                  <p className="hub-card__tag">{p.tag}</p>
                </div>
                <h3 className="hub-card__title">{p.title}</h3>
                <p className="hub-card__who">{p.who}</p>
                <ul className="hub-card__list">
                  {p.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <p className="hub-card__price">
                  {p.price}
                  <span className="hub-card__unit">{p.unit}</span>
                </p>
                <Link
                  href={p.href}
                  className={`btn ${
                    p.featured ? 'btn--primary' : 'btn--secondary'
                  } hub-card__cta`}
                >
                  See full details
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Trust ---------- */}
      {/* ---------- Help me choose ---------- */}
      <section
        className="section hub-choose"
        aria-labelledby="hub-choose-heading"
      >
        <div className="section__inner hub-choose__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">Not sure where to start?</p>
            <h2 id="hub-choose-heading">Pick by where you are today</h2>
          </header>
          <ul className="hub-choose__list">
            {CHOOSER.map((c) => (
              <li key={c.href} className="hub-choose__item">
                {c.if} — <Link href={c.href}>{c.then}</Link>.
              </li>
            ))}
          </ul>
          <p className="hub-choose__aside">
            Still weighing it up? The <Link href="/faq">FAQ</Link> covers
            licensing, what to wear, cancellation, and more — or{' '}
            <Link href="/about">read how Sam teaches</Link> first.
          </p>
        </div>
      </section>

    </>
  )
}
