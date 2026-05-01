import GearSection from '../GearSection'
import './About.css'

export default function About({ onBookNow }) {
  return (
    <GearSection gear={4} id="about">
      <div className="about">
        <img
          className="about__photo about__photo--desktop"
          src="/headshot.jpeg"
          alt="Sam Anthony, founder and lead instructor"
        />

        <div className="about__text">
          <p className="about__eyebrow">Meet Your Instructor</p>
          <h2 className="about__name">Samuel Anthony</h2>
          <p className="about__role">Founder · Lead Instructor</p>

          <img
            className="about__photo about__photo--mobile"
            src="/headshot.jpeg"
            alt=""
            aria-hidden="true"
          />

          <p className="about__bio">
            Hey, I’m Sam — I run Clutch Academy.
          </p>
          <p className="about__bio">
            I’ll teach you manual step by step, at your pace, on real
            Toronto roads.
          </p>
          <p className="about__bio">
            We’ll take the pressure off, just build your confidence and
            have fun doing it :)
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
