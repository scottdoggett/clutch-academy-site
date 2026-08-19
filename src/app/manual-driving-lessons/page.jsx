import Link from 'next/link'
import BookButton from '../../components/BookButton'
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

// "Help me choose" — the hub's second internal-linking pass. Each row states a
// situation, names the package it points to, and offers both actions.
//
// The package name isn't stored here: it's looked up from PACKAGES by href, so
// a rename lands in one place instead of two. `source` tags the row's Book
// button for attribution (05-analytics.md) — per-row, so the reports can show
// which situation actually drives bookings.
const CHOOSER = [
  {
    if: 'You’ve never touched a stick shift',
    href: '/lessons/manual-foundations',
    source: 'lessons_overview_pick_3pack',
  },
  {
    if: 'You’ve driven manual before and need a refresher',
    href: '/lessons/individual',
    source: 'lessons_overview_pick_single',
  },
  {
    if: 'You want downtown, highway, and rush-hour mastery',
    href: '/lessons/manual-confidence',
    source: 'lessons_overview_pick_confidence_5pack',
  },
  {
    if: 'You’d rather learn with a friend',
    href: '/lessons/group',
    source: 'lessons_overview_pick_group',
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
                {/* The feature bullets are the bulk of the card's text and the
                    reason the four-up grid read as a wall on a phone. Behind a
                    native <details> the card leads with title and price, and
                    the detail is one tap away. No JS, same disclosure pattern
                    as the FAQ, and the copy stays in the HTML for crawlers. */}
                <details className="hub-card__more">
                  <summary className="hub-card__more-toggle">
                    What&apos;s included
                  </summary>
                  <ul className="hub-card__list">
                    {p.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </details>
                {/* Price and CTA share a row on phones, where a full-width
                    card is wide and short and stacking them wastes height.
                    `display: contents` at desktop leaves the column layout
                    untouched. */}
                <div className="hub-card__foot">
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
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

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
            {CHOOSER.map((c) => {
              const pkg = PACKAGES.find((p) => p.href === c.href)
              return (
                <li key={c.href} className="hub-choose__item">
                  <p className="hub-choose__if">{c.if}</p>
                  <p className="hub-choose__package">{pkg.title}</p>
                  <div className="hub-choose__actions">
                    <BookButton
                      source={c.source}
                      className="btn btn--primary hub-choose__btn"
                    >
                      Book Now
                    </BookButton>
                    <Link
                      href={c.href}
                      className="btn btn--secondary hub-choose__btn"
                    >
                      See More
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="hub-choose__aside">
            Still weighing it up? The <Link href="/faq">FAQ</Link> covers
            licensing, what to wear, cancellation, and more — or{' '}
            <Link href="/about">read how Sam teaches</Link> first.
          </p>
        </div>
      </section>

      {/* ---------- Closing CTA ---------- */}
      {/* The hub's only Book button. Its predecessor lived in the intro hero
          removed in August 2026, which left this page — a significant entry
          point — with no booking CTA at all, against 01-brief.md. Every CTA
          opens the same Calendly, so booking from the hub is not a shortcut
          past choosing a package. New `source` tag rather than the retired
          `lessons_overview`: that one labelled the intro-hero placement, and
          conflating the two would muddy the GA4 series (05-analytics.md). */}
      <section className="section" aria-labelledby="hub-next-heading">
        <div className="section__inner lesson-next">
          <header className="section-header">
            <p className="section-header__eyebrow">Ready to drive?</p>
            <h2 id="hub-next-heading">Book your first lesson</h2>
          </header>
          <BookButton
            source="lessons_overview_close"
            className="btn btn--primary btn--xl"
          >
            Book a Lesson
          </BookButton>
          <p className="lesson-next__links">
            Prefer to talk it through first?{' '}
            <Link href="/contact">Get in touch</Link>, or{' '}
            <Link href="/faq">read the FAQ</Link>.
          </p>
        </div>
      </section>
    </>
  )
}
