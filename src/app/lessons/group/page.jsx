import PageStub from '../../../components/PageStub'

export const metadata = {
  title: 'Group Manual Driving Lessons in Toronto | Clutch Academy',
  description:
    'Learn to drive manual alongside a friend — fun, supportive group stick shift lessons on real Toronto roads. Book online.',
  alternates: { canonical: '/lessons/group' },
}

// Page-level source tag for now; the per-option packages_group_1hr /
// packages_group_2hr tags return in Phase 6 once the Phase 0 ❓ (1-hour +
// 2.5-hour vs. 2.5-hour only, per-person vs. per-pair pricing) is resolved.
// PENDING: Phase 6 explains the group option(s) that survive that decision.
export default function GroupLessonsPage() {
  return (
    <PageStub
      heading="Group Manual Lessons"
      lede="Learn manual alongside a friend — a fun, supportive way to get
        comfortable with the clutch on real Toronto roads."
      source="packages_group"
    />
  )
}
