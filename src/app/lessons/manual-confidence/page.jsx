import PageStub from '../../../components/PageStub'

export const metadata = {
  title: 'Complete Manual Confidence Package — 5 Lessons | Clutch Academy',
  description:
    'The flagship five-lesson package: downtown Toronto driving, highway merging, rush-hour traffic, advanced hill starts, and parking — with personalized coaching.',
  alternates: { canonical: '/lessons/manual-confidence' },
}

// PENDING: Phase 6 builds the flagship positioning, inclusions, the
// confidence-guarantee terms (📎 pending), trust block, FAQ subset, reviews.
export default function ManualConfidencePage() {
  return (
    <PageStub
      heading="Complete Manual Confidence Package"
      lede="Five lessons covering downtown driving, highway merging, rush-hour
        traffic, advanced hill starts, and parking — personalized coaching all
        the way to full confidence."
      source="packages_confidence_5pack"
    />
  )
}
