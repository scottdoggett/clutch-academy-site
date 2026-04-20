import GearSection from '../GearSection'
import './Reviews.css'

export default function Reviews() {
  return (
    <GearSection gear={5} id="reviews">
      <h2>What Students Are Saying</h2>
      {/* PENDING: TESTIMONIALS (4–6 from client — quote, first name + last initial, optional package/context) */}
      <div className="reviews__grid">
        {[1, 2, 3, 4].map((i) => (
          <article key={i} className="review-card">
            <p className="review-card__quote">
              [Testimonial placeholder — client to provide quote, 2–3 sentences max.]
            </p>
            <p className="review-card__attribution">— Student {i}</p>
          </article>
        ))}
      </div>
      {/* PENDING: GOOGLE BUSINESS PROFILE URL */}
      <a href="#" className="btn btn--secondary" rel="noopener">
        Read more reviews on Google
      </a>
    </GearSection>
  )
}
