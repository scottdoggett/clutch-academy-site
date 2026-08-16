// Manually-maintained snapshot of the Google Business Profile numbers shown
// across the site: the home reviews badge and the homepage aggregateRating
// schema both read from here, so the number can never disagree with itself.
// (The TrustBlock band was the third consumer until it was removed sitewide in
// August 2026.) No live fetch — when new
// reviews land on the profile, update reviewCount (and rating, if it ever
// moves) in this one spot.
//
// Review QUOTES live in src/components/ReviewsMarquee.jsx.
const googleReviews = {
  rating: 5,
  reviewCount: 33, // per the profile, July 2026
  url: 'https://maps.app.goo.gl/5Mi1EeB3jRs35Ezr5',
}

export default googleReviews
