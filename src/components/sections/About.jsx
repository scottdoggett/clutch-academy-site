import GearSection from '../GearSection'
import './About.css'

export default function About({ onBookNow }) {
  return (
    <GearSection gear={2} id="about">
      <h2>Meet Your Instructor</h2>
      <div className="about">
        {/* PENDING: INSTRUCTOR PHOTO (headshot or action shot with training car) */}
        <div className="about__photo" role="img" aria-label="Instructor photo — pending">
          <span className="about__photo-label">Instructor photo</span>
        </div>
        <div>
          {/* PENDING: INSTRUCTOR NAME */}
          {/* PENDING: INSTRUCTOR BIO (200–300 words covering years of experience, teaching background, why Clutch Academy was started, teaching philosophy, one humanizing detail) */}
          <p className="about__bio">
            [Instructor bio placeholder — client to provide 200–300 words covering years
            of manual driving experience, teaching background, why Clutch Academy was
            started, teaching philosophy, and one personal detail.]
          </p>
          <button type="button" className="btn btn--primary" onClick={onBookNow}>
            Book a Lesson
          </button>
        </div>
      </div>
    </GearSection>
  )
}
