import Link from 'next/link'
import WasPrice from '../WasPrice'
import './PackagesTeaser.css'

// Homepage teasers: name, one-liner, price, link — the detail (inclusions,
// FAQs, reviews) lives on each dedicated page per the brief ("route visitors
// to the package pages; don't explain every service inline").
//
// Names are the overhaul-target package names so they match the pages they
// link to; prices are the October 2026 winter offering (one-hour lessons, a
// two-hour group), matching the live site (f8645c4 on main).
//
// One featured package, sitewide: Foundations, with the Recommended badge,
// the only corner badge. The fall sale's savings are tags beside each struck-
// out price (WasPrice). Both packs cost $80 a lesson, so neither is "Best
// Value". The per-lesson price sits in the one-liner, where it doesn't move
// the price rows out of line with the single and group cards.
const TEASERS = [
  {
    tag: 'Private · Single',
    title: 'Individual Manual Lesson',
    desc: 'A one-hour lesson. Good for a first try or a refresher.',
    price: '$90',
    unit: '/ hour + HST',
    href: '/lessons/individual',
    pkg: 'individual',
    tier: 1,
  },
  {
    tag: 'Private · 3 Lessons',
    title: 'Manual Foundations Package',
    desc: 'Three lessons at $80 each, which is what most beginners need to feel confident.',
    price: '$240',
    unit: '/ 3 lessons + HST',
    href: '/lessons/manual-foundations',
    pkg: 'foundations',
    tier: 2,
    featured: true,
    badge: 'Recommended',
  },
  {
    tag: 'Group · With a Friend',
    title: 'Group Manual Lessons',
    desc: 'Two hours with a friend, taking turns at the wheel.',
    price: '$180',
    unit: '/ 2 hours + HST',
    href: '/lessons/group',
    pkg: 'group',
    tier: 3,
  },
  {
    tag: 'Private · 5 Lessons',
    title: 'Complete Manual Confidence Package',
    desc: 'Five lessons at $80 each, from zero to downtown, highway merging, hills and rush hour.',
    price: '$400',
    unit: '/ 5 lessons + HST',
    href: '/lessons/manual-confidence',
    pkg: 'confidence',
    tier: 4,
  },
]

export default function PackagesTeaser() {
  return (
    <section className="section section--light" id="packages" aria-labelledby="packages-heading">
      <div className="section__inner">
        <header className="section-header section-header--center">
          <p className="section-header__eyebrow" data-anim="rise">
            Packages & Pricing
          </p>
          <h2 id="packages-heading" data-anim="headline">
            Straightforward pricing
          </h2>
          <p
            className="section-header__lead"
            data-anim="rise"
            data-anim-delay="0.3"
          >
            Go solo or bring a friend. You pay by card when you book.
          </p>
        </header>

        <div className="teasers" data-anim="stagger" data-anim-delay="0.35">
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
                  <WasPrice pkg={t.pkg} />
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

        <p className="teasers__hub-link" data-anim="rise" data-anim-delay="0.8">
          <Link href="/manual-driving-lessons">
            Compare every lesson option →
          </Link>
        </p>
      </div>
    </section>
  )
}
