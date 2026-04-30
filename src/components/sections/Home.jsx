import GearSection from '../GearSection'
import './Home.css'

export default function Home({ onBookNow, onSeePackages }) {
  return (
    <GearSection gear={1} id="home">
      <div className="home">
        <div className="home__copy">
          <p className="home__eyebrow">Toronto · Manual Transmission Lessons</p>
          <h1 className="home__headline">
            Finally learn manual, without the stress.
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
            <span className="home__scroll-hint-desktop">↓ Shift to 2nd</span>
            <span className="home__scroll-hint-mobile">Shift into 2nd</span>
          </p>
        </div>

        <div className="home__visual">
          <img
            className="home__photo"
            src="/hero-section.jpeg"
            alt="Clutch Academy instructor with the training car"
          />
          <div className="home__caption">
            Real roads, real confidence. Lessons across Toronto.
          </div>
        </div>
      </div>
    </GearSection>
  )
}
