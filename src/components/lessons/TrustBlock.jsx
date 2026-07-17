import './lessons.css'
import googleReviews from '../../lib/googleReviews'

// Full-bleed trust strip: an edge-to-edge cream band with the real Google
// rating centred on one line and the three trust points centred beneath it.
// Renders its own <section> — pages drop it in directly, NOT inside
// .section/.section__inner (it needs the full viewport width).
//
// Rating, review count, and the reviews URL come from src/lib/googleReviews.js
// — the manually-maintained snapshot of the real Business Profile. Never
// hard-code numbers here; that module is the single source.

// Official multicolour Google "G" — decorative; the visible text carries the
// meaning.
function GoogleLogo() {
  return (
    <svg
      className="trust-band__logo"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

// Grey track with a gold overlay clipped to rating/5, so a future 4.9 renders
// a partial fifth star without a redesign.
function StarRow({ rating }) {
  const fillPercent = Math.max(0, Math.min(100, (rating / 5) * 100))
  return (
    <span className="trust-band__stars" aria-hidden="true">
      <span className="trust-band__stars-track">★★★★★</span>
      <span
        className="trust-band__stars-fill"
        style={{ width: `${fillPercent}%` }}
      >
        ★★★★★
      </span>
    </span>
  )
}

const TRUST_POINTS = [
  'Hundreds of successful lessons taught',
  'Trusted by beginners across Toronto',
  'Online booking & secure payment',
]

export default function TrustBlock() {
  const { rating, reviewCount, url } = googleReviews
  return (
    <section className="trust-band" aria-label="Student trust">
      <p className="trust-band__score">
        <GoogleLogo />
        <span className="trust-band__number">
          {rating.toFixed(1)}
          <span className="visually-hidden"> out of 5 stars on Google</span>
        </span>
        <StarRow rating={rating} />
        <a
          className="trust-band__count"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {reviewCount} Google reviews
        </a>
      </p>
      <ul className="trust-band__points">
        {TRUST_POINTS.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </section>
  )
}
