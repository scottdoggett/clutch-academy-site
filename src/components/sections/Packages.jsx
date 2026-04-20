import GearSection from '../GearSection'

export default function Packages({ onBookNow }) {
  return (
    <GearSection gear={4} id="packages">
      <h2>Packages & Pricing</h2>
      <div className="packages">
        <article className="package-card">
          <h3>Single Lesson</h3>
          <p className="package-card__price">$90</p>
          <p className="package-card__duration">1 hour</p>
          <p className="package-card__desc">Best for first-timers or refreshers.</p>
          {/* PENDING: SINGLE LESSON INCLUSIONS (3–5 bullets from client) */}
          <ul className="package-card__list">
            <li>One-on-one instruction</li>
            <li>Clutch control basics</li>
            <li>First-gear starts and stops</li>
            <li>Personalized feedback</li>
          </ul>
          <button type="button" className="btn btn--primary" onClick={onBookNow}>
            Book This Lesson
          </button>
        </article>

        <article className="package-card package-card--featured">
          <span className="package-card__badge">Most Popular</span>
          <h3>3-Lesson Package</h3>
          <p className="package-card__price">$240</p>
          <p className="package-card__duration">3 × 1-hour sessions</p>
          <p className="package-card__desc">
            Best for most learners — full progression from basics to road-confident.
          </p>
          {/* PENDING: 3-LESSON INCLUSIONS (3–5 bullets from client) */}
          <ul className="package-card__list">
            <li>Everything in Single Lesson</li>
            <li>Progression across three sessions</li>
            <li>Hill starts and real-road practice</li>
            <li>Smooth shifting at speed</li>
          </ul>
          <button type="button" className="btn btn--primary" onClick={onBookNow}>
            Book This Package
          </button>
        </article>
      </div>
      <p className="packages__savings">Save $30 with the 3-lesson package.</p>
      <p className="packages__payment">
        Payment accepted in person — cash, e-transfer, or PayPal.
      </p>
    </GearSection>
  )
}
