import GearSection from '../GearSection'
import './Packages.css'

export default function Packages({
  onBookSingle,
  onBookPack,
  onBookGroup2hr,
  onBookConfidence,
}) {
  return (
    <GearSection gear={4} id="packages">
      <header className="section-header section-header--center">
        <p className="section-header__eyebrow">Packages & Pricing</p>
        <h2>Simple, straightforward pricing</h2>
        <p className="section-header__lead">
          Solo or with a friend. Pay securely at booking.
        </p>
      </header>

      <div className="packages">
        <article className="package-card package-card--red-1">
          <div className="package-card__info">
            <p className="package-card__tag">Private · 1 Hour</p>
            <h3>1hr Individual Manual Lesson</h3>
            <p className="package-card__desc">Best for refreshers.</p>
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
            </ul>

            <button type="button" className="btn btn--secondary" onClick={onBookSingle}>
              Book This Lesson
            </button>
          </div>
        </article>

        <article className="package-card package-card--featured package-card--red-2">
          <span className="package-card__badge">Save $30</span>
          <div className="package-card__info">
            <p className="package-card__tag">Private · 3 Lessons</p>
            <h3>Manual Foundations Package</h3>
            <p className="package-card__desc">
              Full progression to road-confident.
            </p>
            <p className="package-card__price">
              <span className="package-card__currency">$</span>240
              <span className="package-card__unit">/ 3 lessons</span>
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

        <article className="package-card package-card--red-3">
          <span className="package-card__badge">Best Value</span>
          <div className="package-card__info">
            <p className="package-card__tag">Private · 5 Lessons</p>
            <h3>Complete Confidence Package</h3>
            <p className="package-card__desc">
              Master manual driving in real-world conditions.
            </p>
            <p className="package-card__price">
              <span className="package-card__currency">$</span>400
              <span className="package-card__unit">/ 5 lessons</span>
            </p>
          </div>

          <div className="package-card__details">
            {/* PENDING: confirm the "confidence guarantee" terms with client */}
            <ul className="package-card__list">
              <li>Downtown driving</li>
              <li>Highway merging</li>
              <li>Hill starts</li>
              <li>Rush-hour practice</li>
              <li>Confidence guarantee</li>
            </ul>

            <button type="button" className="btn btn--primary" onClick={onBookConfidence}>
              Book This Package
            </button>
          </div>
        </article>

        <article className="package-card package-card--red-4">
          <div className="package-card__info">
            <p className="package-card__tag">Group · 2 Hours</p>
            <h3>2hr Group Manual Lesson</h3>
            <p className="package-card__desc">
              Bring a friend. Split the experience.
            </p>
            <p className="package-card__price">
              <span className="package-card__currency">$</span>180
              <span className="package-card__unit">/ 2 hours</span>
            </p>
          </div>

          <div className="package-card__details">
            {/* PENDING: GROUP 2HR INCLUSIONS + confirm whether $180 is per-person or per-pair */}
            <ul className="package-card__list">
              <li>Learn with a friend</li>
              <li>Two-hour group session</li>
              <li>More turns at the wheel</li>
            </ul>

            <button type="button" className="btn btn--secondary" onClick={onBookGroup2hr}>
              Book 2-Hour Group
            </button>
          </div>
        </article>
      </div>
    </GearSection>
  )
}
