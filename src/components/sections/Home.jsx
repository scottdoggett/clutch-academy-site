import GearSection from '../GearSection'

export default function Home({ onBookNow, onSeePackages }) {
  return (
    <GearSection gear={1} id="home">
      {/* PENDING: HERO PHOTO */}
      {/* PENDING: FINAL HEADLINE CHOICE — defaulting to personality-led */}
      <h1>Learn Manual from a Patient, Pro Instructor</h1>
      <p className="home__subhead">
        One-on-one lessons on real roads. Book your first hour in under a minute.
      </p>
      <div className="home__ctas">
        <button type="button" className="btn btn--primary" onClick={onBookNow}>
          Start your manual driving journey today
        </button>
        <button type="button" className="btn btn--secondary" onClick={onSeePackages}>
          See Packages
        </button>
      </div>
      {/* PENDING: SCROLL HINT MICROCOPY (e.g. "Shift to 2nd") */}
    </GearSection>
  )
}
