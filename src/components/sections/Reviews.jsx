import GearSection from '../GearSection'
import './Reviews.css'

// Placeholder testimonials so the section reads as finished. Client will
// replace these with real quotes + first name + last initial.
// PENDING: TESTIMONIALS
const PLACEHOLDERS = [
  {
    quote:
      '[Sample testimonial — a couple of sentences about what lessons were like and what the student can do now that they couldn\'t before. Expect warm, specific, ~2–3 line quotes.]',
    name: 'Student One',
    package: '3-Lesson Package',
  },
  {
    quote:
      '[Sample testimonial — a couple of sentences about what lessons were like and what the student can do now that they couldn\'t before. Expect warm, specific, ~2–3 line quotes.]',
    name: 'Student Two',
    package: 'Single Lesson',
  },
  {
    quote:
      '[Sample testimonial — a couple of sentences about what lessons were like and what the student can do now that they couldn\'t before. Expect warm, specific, ~2–3 line quotes.]',
    name: 'Student Three',
    package: '3-Lesson Package',
  },
  {
    quote:
      '[Sample testimonial — a couple of sentences about what lessons were like and what the student can do now that they couldn\'t before. Expect warm, specific, ~2–3 line quotes.]',
    name: 'Student Four',
    package: 'Single Lesson',
  },
]

export default function Reviews() {
  return (
    <GearSection gear={5} id="reviews">
      <header className="section-header">
        <p className="section-header__eyebrow">Student Stories</p>
        <h2>What Students Are Saying</h2>
        <p className="section-header__lead">
          Real reviews from drivers who got behind the stick with Clutch
          Academy.
        </p>
      </header>

      <div className="reviews__grid">
        {PLACEHOLDERS.map((r, i) => (
          <article key={i} className="review-card">
            <p className="review-card__quote">{r.quote}</p>
            <footer className="review-card__meta">
              <span className="review-card__name">— {r.name}</span>
              <span className="review-card__package">{r.package}</span>
            </footer>
          </article>
        ))}
      </div>

      <div className="reviews__footer">
        <div className="reviews__badge">
          <span className="reviews__badge-label">Google reviews</span>
          {/* PENDING: FINAL STAR RATING ONCE REVIEWS PUBLISHED */}
          <span className="reviews__badge-stars" aria-hidden="true">
            ★★★★★
          </span>
          <span className="reviews__badge-count">pending</span>
        </div>
        {/* PENDING: GOOGLE BUSINESS PROFILE URL */}
        <a href="#" className="btn btn--secondary" rel="noopener">
          Read more reviews on Google
        </a>
      </div>
    </GearSection>
  )
}
