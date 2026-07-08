import PageStub from '../../../components/PageStub'

export const metadata = {
  title: 'Manual Foundations Package — 3 Lessons | Clutch Academy',
  description:
    'Learn to drive manual from zero: a three-lesson progression from clutch control to traffic, hill starts, and independent driving. Toronto, one-on-one.',
  alternates: { canonical: '/lessons/manual-foundations' },
}

// PENDING: Phase 6 builds out the three-lesson progression detail
// (clutch control → traffic/hill starts → independent driving), trust
// block, FAQ subset, and reviews.
export default function ManualFoundationsPage() {
  return (
    <PageStub
      heading="Manual Foundations Package"
      lede="Three lessons that take a complete beginner from clutch control and
        first starts, through traffic and hill starts, to independent driving."
      source="packages_3pack"
    />
  )
}
