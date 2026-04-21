import GearSection from '../GearSection'
import './About.css'

export default function About({ onBookNow }) {
  return (
    <GearSection gear={2} id="about">
      <div className="about">
        <img
          className="about__photo"
          src="/headshot.jpeg"
          alt="Sam Anthony, founder and lead instructor"
        />

        <div className="about__text">
          <p className="about__eyebrow">Meet Your Instructor</p>
          <h2 className="about__name">Samuel Anthony</h2>
          <p className="about__role">Founder · Lead Instructor</p>

          {/* PENDING: INSTRUCTOR BIO (200–300 words) */}
          <p className="about__bio">
            [Sample bio — the client will provide 200–300 words covering years
            of manual driving experience, teaching background, why Clutch
            Academy was started, teaching philosophy, and one personal detail.
            This placeholder is here to show layout rhythm; the final copy
            will feel warmer and more personal.]
          </p>

          <dl className="about__stats">
            <div className="about__stat">
              <dt>Lesson style</dt>
              <dd>1-on-1</dd>
            </div>
            <div className="about__stat">
              <dt>Territory</dt>
              <dd>Toronto</dd>
            </div>
            <div className="about__stat">
              <dt>Response time</dt>
              <dd>&lt; 24 hr</dd>
            </div>
          </dl>

          <button type="button" className="btn btn--primary" onClick={onBookNow}>
            Book a Lesson
          </button>
        </div>
      </div>
    </GearSection>
  )
}
