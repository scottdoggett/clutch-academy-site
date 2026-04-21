import GearSection from '../GearSection'
import './Reviews.css'

// Placeholder testimonials so the section reads as finished. Client will
// replace these with real quotes + first name + last initial.
// PENDING: TESTIMONIALS
const PLACEHOLDERS = [
  {
    quote:
      'I stalled about a dozen times in my first lesson and walked away convinced I\'d never get it. By lesson three I was pulling out of my driveway on a hill like it was nothing. Patient, calm, zero judgment.',
    name: 'Priya R.',
    package: '3-Lesson Package',
  },
  {
    quote:
      'Bought a used Miata before I knew how to drive stick — probably not the smartest move. One afternoon with Clutch Academy and I actually drove it home. Worth every dollar.',
    name: 'Marcus T.',
    package: 'Single Lesson',
  },
  {
    quote:
      'The instructor broke down what the clutch is actually doing in a way nobody else had. Suddenly the bite point made sense instead of being a guessing game.',
    name: 'Elena K.',
    package: '3-Lesson Package',
  },
  {
    quote:
      'I needed this for a job that required driving a manual van. Tight timeline, super accommodating with scheduling, and I passed my work road test first try.',
    name: 'Devon A.',
    package: 'Single Lesson',
  },
  {
    quote:
      'My dad tried to teach me years ago and it nearly ended our relationship. One lesson here and I already felt more confident than after a month of him yelling at me.',
    name: 'Sofia L.',
    package: '3-Lesson Package',
  },
  {
    quote:
      'Honestly thought the gear-shift branding was gimmicky until I took a lesson. The instructor genuinely knows the craft and teaches it like someone who cares about you getting it.',
    name: 'Jordan M.',
    package: '3-Lesson Package',
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
                  <span className="review-card__package">{r.package}</span>
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
