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
          <div className="about__bio">
            <p>
              [Sample bio paragraph one — the client will provide 200–300 words
              covering years of manual driving experience, teaching background,
              and why Clutch Academy was started. This placeholder is here to
              show layout rhythm; the final copy will feel warmer and more
              personal.]
            </p>
            <p>
              [Sample bio paragraph two — teaching philosophy and one personal
              detail that humanizes the instructor. Expect two or three short
              paragraphs total, each around 60–100 words, with plenty of line
              height so white text on red stays comfortable to read.]
            </p>
          </div>

          <dl className="about__stats">
            <div className="about__stat">
              <dt>Years on stick</dt>
              {/* PENDING: YEARS OF EXPERIENCE */}
              <dd>[XX]</dd>
            </div>
            <div className="about__stat">
              <dt>Students taught</dt>
              {/* PENDING: STUDENTS TAUGHT COUNT — optional, remove if unknown */}
              <dd>[XXX+]</dd>
            </div>
            <div className="about__stat">
              <dt>Lesson style</dt>
              <dd>1-on-1, real roads</dd>
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
