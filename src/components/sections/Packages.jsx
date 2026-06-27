import GearSection from '../GearSection'
import './Packages.css'

export default function Packages({
  onBookSingle,
  onBookPack,
  onBookGroup1hr,
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

      <div className="packages packages--five">
        <article className="package-card package-card--red-1">
          <div className="package-card__info">
            <p className="package-card__tag">Private · Single</p>
            <h3>Single Lesson</h3>
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
            <p className="package-card__tag">Private · 3-Pack</p>
            <h3>3-Lesson Package</h3>
            <p className="package-card__desc">
              Full progression to road-confident.
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

        <article className="package-card package-card--red-3">
          <div className="package-card__info">
            <p className="package-card__tag">Group · 1 Hour</p>
            <h3>Group Lesson</h3>
            <p className="package-card__desc">
              Bring a friend. Split the experience.
            </p>
            <p className="package-card__price">
              <span className="package-card__currency">$</span>90
              <span className="package-card__unit">/hour</span>
            </p>
          </div>

          <div className="package-card__details">
            <ul className="package-card__list">
              <li>Learn with a friend</li>
              <li>Supportive, low-pressure setting</li>
              <li>Great for first-timers</li>
            </ul>

            <button type="button" className="btn btn--secondary" onClick={onBookGroup1hr}>
              Book 1-Hour Group
            </button>
          </div>
        </article>

        <article className="package-card package-card--red-4">
          <div className="package-card__info">
            <p className="package-card__tag">Group · 2 Hours</p>
            <h3>Extended Group Lesson</h3>
            <p className="package-card__desc">
              Twice the seat time, same friendly pace.
            </p>
            <p className="package-card__price">
              <span className="package-card__currency">$</span>180
              <span className="package-card__unit">/ 2 hours</span>
            </p>
          </div>

          <div className="package-card__details">
            {/* PENDING: GROUP 2HR INCLUSIONS + confirm whether $180 is per-person or per-pair */}
            <ul className="package-card__list">
              <li>Two-hour group session</li>
              <li>More turns at the wheel</li>
              <li>Build real-road confidence</li>
            </ul>

            <button type="button" className="btn btn--secondary" onClick={onBookGroup2hr}>
              Book 2-Hour Group
            </button>
          </div>
        </article>

        <article className="package-card package-card--hero package-card--red-5">
          <span className="package-card__badge">Best Value</span>
          <div className="package-card__info">
            <p className="package-card__tag">Private · 5-Pack</p>
            <h3>Highway &amp; City Confidence Drive</h3>
            <p className="package-card__desc">
              The Toronto Confidence Drive — city, highway, and rush-hour
              mastery.
            </p>
            <p className="package-card__price">
              <span className="package-card__currency">$</span>400
              <span className="package-card__unit">/ 5 lessons</span>
            </p>
          </div>

          <div className="package-card__details">
            {/* PENDING: confirm final price + the "confidence guarantee" terms with client */}
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
      </div>
    </GearSection>
  )
}
