import './Reviews.css'
import ReviewsMarquee from '../ReviewsMarquee'
import googleReviews from '../../lib/googleReviews'

// Home "What Students Are Saying" section: header + the shared review
// marquee + the Google-rating footer. A beige band (`section--light` in
// globals.css flips its header type and button to red). Review quotes live in
// src/components/ReviewsMarquee.jsx; rating/count numbers in
// src/lib/googleReviews.js.
export default function Reviews() {
  return (
    <section className="section section--light" id="reviews" aria-labelledby="reviews-heading">
      <div className="section__inner">
        <header className="section-header">
          <p className="section-header__eyebrow">Student Stories</p>
          <h2 id="reviews-heading">What Students Are Saying</h2>
          <p className="section-header__lead">
            Toronto drivers who learned stick with Sam, in their own words.
          </p>
        </header>

        <ReviewsMarquee />

        <div className="reviews__footer">
          {/* Stars/count derive from the shared numbers module so the badge
              can never disagree with the homepage aggregateRating schema. */}
          <div className="reviews__badge">
            <span className="reviews__badge-label">Google reviews</span>
            <span className="reviews__badge-stars" aria-hidden="true">
              {'★'.repeat(Math.round(googleReviews.rating))}
            </span>
            <span className="visually-hidden">
              Rated {googleReviews.rating.toFixed(1)} out of 5 from{' '}
              {googleReviews.reviewCount} reviews
            </span>
          </div>
          <a
            href={googleReviews.url}
            className="btn btn--secondary btn--on-light"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read more reviews on Google
          </a>
        </div>
      </div>
    </section>
  )
}
