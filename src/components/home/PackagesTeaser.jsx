import Link from 'next/link'
import './PackagesTeaser.css'

// Homepage teasers: name, one-liner, price, link — the detail (inclusions,
// FAQs, reviews) lives on each dedicated page per the brief ("route visitors
// to the package pages; don't explain every service inline").
//
// Names are the overhaul-target package names so they match the pages they
// link to; prices are the post-August-1 offering (08 §3), matching the switch
// already shipped on the live site in 308317c.
const TEASERS = [
  {
    tag: 'Private · Single',
    title: 'Individual Manual Lesson',
    desc: 'Best for refreshers or a first introduction to stick.',
    price: '$109',
    unit: '/ 75 min + HST',
    href: '/lessons/individual',
    tier: 1,
  },
  {
    tag: 'Private · 3 Lessons',
    title: 'Manual Foundations',
    desc: 'Full progression from clutch control to road-confident.',
    price: '$299',
    unit: '/ 3 lessons + HST',
    href: '/lessons/manual-foundations',
    tier: 2,
    featured: true,
  },
  {
    tag: 'Group · With a Friend',
    title: 'Group Manual Lessons',
    desc: 'Bring a friend and split the experience.',
    price: '$219',
    unit: '/ 2.5 hours + HST',
    href: '/lessons/group',
    tier: 3,
  },
  {
    tag: 'Private · 5 Lessons',
    title: 'Complete Manual Confidence',
    desc: 'City, highway, and rush-hour mastery — the flagship.',
    price: '$469',
    unit: '/ 5 lessons + HST',
    href: '/lessons/manual-confidence',
    tier: 4,
    badge: 'Best Value',
  },
]

export default function PackagesTeaser() {
  return (
    <section className="section" id="packages" aria-labelledby="packages-heading">
      <div className="section__inner">
        <header className="section-header section-header--center">
          <p className="section-header__eyebrow">Packages & Pricing</p>
          <h2 id="packages-heading">Simple, straightforward pricing</h2>
          <p className="section-header__lead">
            Solo or with a friend. Pay securely at booking.
          </p>
        </header>

        <div className="teasers">
          {TEASERS.map((t) => (
            <article
              key={t.href}
              className={`teaser-card teaser-card--tier-${t.tier} ${
                t.featured ? 'teaser-card--featured' : ''
              }`}
            >
              {t.badge && <span className="teaser-card__badge">{t.badge}</span>}
              <p className="teaser-card__tag">{t.tag}</p>
              <h3 className="teaser-card__title">{t.title}</h3>
              <p className="teaser-card__desc">{t.desc}</p>
              {/* See hub.css — price and CTA share a row on phones. */}
              <div className="teaser-card__foot">
                <p className="teaser-card__price">
                  {t.price}
                  <span className="teaser-card__unit">{t.unit}</span>
                </p>
                <Link
                  href={t.href}
                  className={`btn ${t.featured ? 'btn--primary' : 'btn--secondary'} teaser-card__cta`}
                >
                  See details &amp; book
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="teasers__hub-link">
          <Link href="/manual-driving-lessons">
            Compare all lesson options →
          </Link>
        </p>
      </div>
    </section>
  )
}
