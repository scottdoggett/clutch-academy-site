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

          <p className="about__bio">
            Hi, I’m Sam — founder of Clutch Academy and your instructor.
          </p>
          <p className="about__bio">
            I started Clutch Academy because learning manual shouldn’t feel
            stressful, intimidating, or rushed. Most people either try to
            teach themselves or learn from someone who doesn’t know how to
            teach — and that’s where frustration comes from. My approach is
            simple: calm, patient, and focused on real-world driving. We’ll
            get you confidently shifting on actual Toronto roads, step by
            step, at your pace.
          </p>
          <p className="about__bio">
            Whether you’ve never touched a stick shift or just need to clean
            up your technique, I tailor every lesson to you. We focus on the
            skills that actually matter: clutch control, smooth takeoffs,
            hill starts, and shifting naturally in traffic — not just
            textbook driving.
          </p>
          <p className="about__bio">
            My goal is simple: by the end of your lessons, driving manual
            should feel natural, not something you have to think about. If
            you’ve been putting it off or had a bad experience in the past,
            this is your chance to finally learn it the right way.
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
