import './lessons.css'

// Social-proof strip for every package page — copy verbatim from the brief's
// "Add trust throughout the site" example. Links out to the real Google
// reviews so the claim is one tap from its source.
export default function TrustBlock() {
  return (
    <aside className="trust" aria-label="Student ratings">
      <p className="trust__rating">
        <span aria-hidden="true">⭐</span> Rated 5.0 on Google
      </p>
      <p className="trust__line">Hundreds of successful lessons taught.</p>
      <p className="trust__line">Trusted by beginners across Toronto.</p>
      <a
        className="trust__link"
        href="https://maps.app.goo.gl/5Mi1EeB3jRs35Ezr5"
        target="_blank"
        rel="noopener noreferrer"
      >
        Read the reviews on Google
      </a>
    </aside>
  )
}
