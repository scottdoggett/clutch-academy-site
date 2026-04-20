import GearSection from '../GearSection'

export default function About({ onBookNow }) {
  return (
    <GearSection gear={2} id="about">
      <h2>Meet Your Instructor</h2>
      {/* PENDING: INSTRUCTOR PHOTO */}
      {/* PENDING: INSTRUCTOR NAME */}
      {/* PENDING: INSTRUCTOR BIO (200–300 words covering years of experience, teaching background, why Clutch Academy was started, teaching philosophy, one humanizing detail) */}
      <p>
        [Instructor bio placeholder — client to provide 200–300 words covering years of
        manual driving experience, teaching background, why Clutch Academy was started,
        teaching philosophy, and one personal detail.]
      </p>
      <button type="button" className="btn btn--primary" onClick={onBookNow}>
        Book a Lesson
      </button>
    </GearSection>
  )
}
