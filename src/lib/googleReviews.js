// Manually-maintained snapshot of the Google Business Profile numbers shown
// across the site: the home reviews badge and the homepage aggregateRating
// schema both read from here, so the number can never disagree with itself.
// (The TrustBlock band was the third consumer until it was removed sitewide in
// August 2026.) No live fetch — when new
// reviews land on the profile, update reviewCount (and rating, if it ever
// moves) in this one spot.
//
// Review QUOTES live in src/components/ReviewsMarquee.jsx.
// October 7, 2026: 44 reviews, 43 of them five stars and one four, which
// Google shows as 5.0 (the mean is 4.98).
const googleReviews = {
  rating: 5,
  reviewCount: 44, // per the profile, October 7, 2026
  url: 'https://maps.app.goo.gl/5Mi1EeB3jRs35Ezr5',
}

export default googleReviews
