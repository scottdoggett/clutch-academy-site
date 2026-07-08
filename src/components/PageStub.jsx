import BookButton from './BookButton'

// Phase 3 route stub: unique h1 + one-line lede + a booking CTA carrying the
// page's attribution source tag. Real page content replaces these in
// Phases 4–7; the ledes stick to facts already approved in the brief
// (docs/spec/08-overhaul-reference.md §2) — no invented inclusions/pricing.
export default function PageStub({ heading, lede, source, children }) {
  return (
    <section className="placeholder-hero" aria-labelledby="page-heading">
      <h1 id="page-heading">{heading}</h1>
      <p>{lede}</p>
      {children}
      <BookButton source={source} className="btn btn--primary btn--xl" />
    </section>
  )
}
