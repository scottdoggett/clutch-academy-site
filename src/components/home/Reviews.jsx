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
          <p className="section-header__eyebrow" data-anim="rise">
            Student Stories
          </p>
          <h2 id="reviews-heading" data-anim="headline">
            What Students Are Saying
          </h2>
          <p
            className="section-header__lead"
            data-anim="rise"
            data-anim-delay="0.3"
          >
            Toronto drivers who learned stick with Sam, in their own words.
          </p>
        </header>

        {/* The strip arrives as one block: it's already moving, so its cards
            never stagger (docs/spec/08-motion.md rule 3). */}
        <div data-anim="rise" data-anim-delay="0.4">
          <ReviewsMarquee />
        </div>

        <div className="reviews__rule" data-anim="draw" data-anim-delay="0.5" />
        <div className="reviews__footer" data-anim="rise" data-anim-delay="0.6">
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
