import PageStub from '../../../components/PageStub'

export const metadata = {
  title: 'Individual Manual Driving Lesson in Toronto | Clutch Academy',
  description:
    'A one-on-one manual transmission lesson on real Toronto roads — ideal as a refresher or a first introduction to driving stick. Book online.',
  alternates: { canonical: '/lessons/individual' },
}

// PENDING: Phase 6 adds who-it's-for, inclusions (📎 pending from Sam),
// FAQ subset, reviews, and the trust block.
export default function IndividualLessonPage() {
  return (
    <PageStub
      heading="Individual Manual Lesson"
      lede="One-on-one time behind the wheel on real Toronto roads — ideal as
        a refresher or a first introduction to driving stick."
      source="packages_single"
    />
  )
}
