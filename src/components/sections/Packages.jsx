import GearSection from '../GearSection'
import './Packages.css'

export default function Packages({ onBookSingle, onBookPack }) {
  return (
    <GearSection gear={4} id="packages">
      <header className="section-header section-header--center">
        <p className="section-header__eyebrow">Packages & Pricing</p>
        <h2>Simple, straightforward pricing.</h2>
        <p className="section-header__lead">
          Two options. No upsells. Pay in person when you arrive.
        </p>
      </header>

      <div className="packages">
        <article className="package-card">
          <div className="package-card__header">
            <h3>Single Lesson</h3>
            <p className="package-card__desc">
              Best for first-timers or refreshers.
            </p>
          </div>
          <div className="package-card__pricing">
            <p className="package-card__price">
              <span className="package-card__currency">$</span>90
            </p>
            <p className="package-card__unit">per hour · 1 session</p>
          </div>
          {/* PENDING: SINGLE LESSON INCLUSIONS (3–5 bullets from client) */}
          <ul className="package-card__list">
            <li>One-on-one instruction</li>
            <li>Clutch control basics</li>
            <li>First-gear starts and stops</li>
            <li>Personalized feedback</li>
          </ul>
          <button type="button" className="btn btn--secondary" onClick={onBookSingle}>
            Book This Lesson
          </button>
        </article>

        <article className="package-card package-card--featured">
          <span className="package-card__badge">Most Popular</span>
          <div className="package-card__header">
            <h3>3-Lesson Package</h3>
            <p className="package-card__desc">
              Full progression from basics to road-confident.
            </p>
          </div>
          <div className="package-card__pricing">
            <p className="package-card__price">
              <span className="package-card__currency">$</span>240
            </p>
            <p className="package-card__unit">3 × 1-hour · $80/hr · save $30</p>
          </div>
          {/* PENDING: 3-LESSON INCLUSIONS (3–5 bullets from client) */}
          <ul className="package-card__list">
            <li>Everything in Single Lesson</li>
            <li>Progression across three sessions</li>
            <li>Hill starts and real-road practice</li>
            <li>Smooth shifting at speed</li>
          </ul>
          <button type="button" className="btn btn--primary" onClick={onBookPack}>
            Book This Package
          </button>
        </article>
      </div>

      <p className="packages__payment">
        Payment accepted in person — cash, e-transfer, or PayPal.
      </p>
    </GearSection>
  )
}
