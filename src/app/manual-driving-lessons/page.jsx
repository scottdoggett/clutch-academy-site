import Link from 'next/link'
import PageStub from '../../components/PageStub'

export const metadata = {
  title: 'Stick Shift & Manual Driving Lessons in Toronto | Clutch Academy',
  description:
    'Learn manual in Toronto: one-on-one stick shift lessons, three- and five-lesson packages, and group lessons with a friend. See every option and book online.',
  alternates: { canonical: '/manual-driving-lessons' },
}

// The primary internal-linking hub (08 §2): frames the whole offering and
// links to all four dedicated package pages.
// PENDING: Phase 5 adds the per-package summary cards.
export default function LessonsOverviewPage() {
  return (
    <PageStub
      heading="Manual Driving Lessons"
      lede="Every Clutch Academy lesson happens on real Toronto roads. Choose
        the option that fits where you're starting from:"
      source="lessons_overview"
    >
      <ul>
        <li>
          <Link href="/lessons/individual">Individual Manual Lesson</Link>
        </li>
        <li>
          <Link href="/lessons/manual-foundations">
            Manual Foundations Package (3 lessons)
          </Link>
        </li>
        <li>
          <Link href="/lessons/manual-confidence">
            Complete Manual Confidence Package (5 lessons)
          </Link>
        </li>
        <li>
          <Link href="/lessons/group">Group Manual Lessons</Link>
        </li>
      </ul>
    </PageStub>
  )
}
