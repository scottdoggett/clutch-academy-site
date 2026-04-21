import GearSection from '../GearSection'
import './Home.css'

export default function Home({ onBookNow, onSeePackages }) {
  return (
    <GearSection gear={1} id="home">
      <div className="home">
        <div className="home__copy">
          <p className="home__eyebrow">Toronto · Manual Transmission Lessons</p>
          {/* PENDING: FINAL HEADLINE CHOICE — defaulting to personality-led */}
          <h1 className="home__headline">
            Learn manual
            <br />
            from a patient,
            <br />
            pro instructor.
          </h1>
          <p className="home__subhead">
            One-on-one lessons on real roads. Book your first hour in under a
            minute.
          </p>
          <div className="home__ctas">
            <button type="button" className="btn btn--primary" onClick={onBookNow}>
              Start your manual driving journey today
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onSeePackages}
            >
              See Packages
            </button>
          </div>
          {/* PENDING: SCROLL HINT MICROCOPY — fades out after first scroll event */}
          <p className="home__scroll-hint" aria-hidden="true">
            ↓ Shift to 2nd
          </p>
        </div>

        {/* PENDING: HERO PHOTO — instructor or training car */}
        <div className="home__visual" aria-hidden="true">
          <div className="home__photo">
            <span className="home__photo-label">Hero photo</span>
          </div>
          <div className="home__caption">
            Sample caption — e.g. &ldquo;Real roads, real confidence. Lessons
            across the GTA.&rdquo;
          </div>
        </div>
      </div>
    </GearSection>
  )
}
