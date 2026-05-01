import GearSection from '../GearSection'
import './Reviews.css'

const PLACEHOLDERS = [
  {
    quote:
      'Great experience learning manual here. Clear instruction, patient teaching, and I felt confident behind the wheel way faster than expected',
    name: 'Ethan B.',
  },
  {
    quote:
      'Used to think driving manual was super stressful, pure anxiety, lots of stalling, but one lesson with Sam and no more stalling, looking forward to learning smooth downshifts and hill starts in lessons 2 and 3',
    name: 'Obiora E.',
  },
  {
    quote:
      'Best decision I made before my Europe trip. I felt completely comfortable renting a manual car.',
    name: 'Scott D.',
  },
  // PENDING: JAMIE'S REVIEW QUOTE
  {
    quote: 'XYZ',
    name: 'Jamie S.',
  },
]

// The marquee works by translating a track that contains *two* copies of
// the list from 0 to -50%. Because the second copy is an exact duplicate
// of the first, the 100% -> 0% reset is visually seamless — card 1 of
// copy B sits exactly where card 1 of copy A used to be.
const MARQUEE_SEQUENCE = [...PLACEHOLDERS, ...PLACEHOLDERS]

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

      <div
        className="reviews__marquee"
        aria-label="Student testimonials"
        role="region"
      >
        <ul className="reviews__track">
          {MARQUEE_SEQUENCE.map((r, i) => (
            <li
              key={i}
              className="reviews__slide"
              aria-hidden={i >= PLACEHOLDERS.length ? 'true' : undefined}
            >
              <article className="review-card">
                <p className="review-card__quote">{r.quote}</p>
                <footer className="review-card__meta">
                  <span className="review-card__name">— {r.name}</span>
                  {r.package && (
                    <span className="review-card__package">{r.package}</span>
                  )}
                </footer>
              </article>
            </li>
          ))}
        </ul>
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
