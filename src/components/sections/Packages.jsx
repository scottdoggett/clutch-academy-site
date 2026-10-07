import GearSection from '../GearSection'
import './Packages.css'

// Fall sale: next to today's price, each card shows the price it had until
// October 5, 2026 struck through, and the difference. Those were 75-minute
// lessons and a 2.5-hour group (f8645c4). Drop `was` when the sale ends.
function PackagePrice({ amount, was, unit }) {
  return (
    <div className="package-card__pricing">
      <p className="package-card__price">
        <span className="package-card__currency">$</span>
        {amount}
        {was && (
          <span className="package-card__deal">
            <s className="package-card__was">
              <span className="package-card__sr-only">Was </span>${was}
            </s>
            <span className="package-card__save">Save ${was - amount}</span>
          </span>
        )}
      </p>
      <p className="package-card__unit">/ {unit}</p>
    </div>
  )
}

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
            <h3>Individual Manual Lesson</h3>
            <p className="package-card__desc">Best for refreshers.</p>
            <PackagePrice amount={90} was={110} unit="hour" />
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
          <span className="package-card__badge">Save $60</span>
          <div className="package-card__info">
            <p className="package-card__tag">Private · 3 Lessons</p>
            <h3>Manual Foundations Package</h3>
            <p className="package-card__desc">
              Full progression to road-confident.
            </p>
            <PackagePrice amount={240} was={300} unit="3 lessons" />
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
          <span className="package-card__badge">Save $70</span>
          <div className="package-card__info">
            <p className="package-card__tag">Private · 5 Lessons</p>
            <h3>Complete Confidence Package</h3>
            <p className="package-card__desc">
              Master manual driving in real-world conditions.
            </p>
            <PackagePrice amount={400} was={470} unit="5 lessons" />
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
            <h3>Group Manual Lesson</h3>
            <p className="package-card__desc">
              Bring a friend. Split the experience.
            </p>
            <PackagePrice amount={180} was={220} unit="2 hours" />
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
