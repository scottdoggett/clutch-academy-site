import GearSection from '../GearSection'
import './Packages.css'

export default function Packages({ onBookSingle, onBookPack }) {
  return (
    <GearSection gear={3} id="packages">
      <header className="section-header section-header--center">
        <p className="section-header__eyebrow">Packages & Pricing</p>
        <h2>Simple, straightforward pricing</h2>
        <p className="section-header__lead">
          Two options. Pay in person when you arrive.
        </p>
      </header>

      <div className="packages">
        <article className="package-card">
          <div className="package-card__info">
            <p className="package-card__tag">Single</p>
            <h3>Single Lesson</h3>
            <p className="package-card__desc">
              Best for refreshers.
            </p>
            <p className="package-card__price">
              <span className="package-card__currency">$</span>90
              <span className="package-card__unit">/hour</span>
            </p>
          </div>

          <div className="package-card__details">
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
          </div>
        </article>

        <article className="package-card package-card--featured">
          <span className="package-card__badge">Save $30</span>
          <div className="package-card__info">
            <h3>3-Lesson Package</h3>
            <p className="package-card__desc">
              Full progression from basics to road-confident.
            </p>
            <p className="package-card__price">
              <span className="package-card__currency">$</span>240
              <span className="package-card__unit">/ 3 hours</span>
            </p>
          </div>

          <div className="package-card__details">
            {/* PENDING: 3-LESSON INCLUSIONS (3–5 bullets from client) */}
            <ul className="package-card__list">
              <li>Progression across three sessions</li>
              <li>Hill starts and real-road practice</li>
              <li>Smooth shifting at speed</li>
            </ul>

            <button type="button" className="btn btn--primary" onClick={onBookPack}>
              Book This Package
            </button>
          </div>
        </article>
      </div>
    </GearSection>
  )
}
