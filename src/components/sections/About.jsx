import GearSection from '../GearSection'
import './About.css'

export default function About({ onBookNow }) {
  return (
    <GearSection gear={2} id="about">
      <div className="about">
        {/* PENDING: INSTRUCTOR PHOTO — headshot or action shot with training car */}
        <div className="about__photo" aria-hidden="true">
          <span className="about__photo-label">Instructor photo</span>
        </div>

        <div className="about__text">
          <p className="about__eyebrow">Meet Your Instructor</p>
          {/* PENDING: INSTRUCTOR NAME */}
          <h2 className="about__name">[Instructor Name]</h2>
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
              <dt>Years on stick</dt>
              {/* PENDING: YEARS OF EXPERIENCE */}
              <dd>[XX]</dd>
            </div>
            <div className="about__stat">
              <dt>Lesson style</dt>
              <dd>1-on-1</dd>
            </div>
            <div className="about__stat">
              <dt>Territory</dt>
              <dd>GTA</dd>
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
