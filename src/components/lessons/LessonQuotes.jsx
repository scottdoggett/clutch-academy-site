import '../ReviewCard.css'
import './lessons.css'

// A package page's pair of Google-review quotes, drawn as the homepage's
// review cards (src/components/ReviewCard.css) on the page's beige reviews
// band. Every review on the profile is five stars (googleReviews.js holds the
// 5.0 rating), so the star row is fixed rather than per-quote data, and
// decorative, as it is on the homepage.
export default function LessonQuotes({ quotes }) {
  return (
    <div className="lesson-quotes">
      {quotes.map((q) => (
        <figure key={q.name} className="review-card">
          <p className="review-card__stars" aria-hidden="true">
            ★★★★★
          </p>
          <blockquote className="review-card__quote">{q.text}</blockquote>
          <figcaption className="review-card__meta">
            <span className="review-card__avatar" aria-hidden="true">
              {q.name.charAt(0)}
            </span>
            <span className="review-card__name">{q.name}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
