import PageStub from '../../components/PageStub'

export const metadata = {
  title: 'About Clutch Academy | Manual Driving School in Toronto',
  description:
    'Meet Sam Anthony, founder and instructor at Clutch Academy — calm, patient, one-on-one manual transmission lessons on real Toronto roads.',
  alternates: { canonical: '/about' },
}

// PENDING: Phase 5 rewrites this as the personal story (why Clutch Academy
// exists), plus the "Why Students Choose Clutch Academy" icon grid, "What
// Lessons Are Really Like", and "Why Learn Manual Driving" sections.
export default function AboutPage() {
  return (
    <PageStub
      heading="About Clutch Academy"
      lede="Founded by instructor Sam Anthony, Clutch Academy teaches manual
        transmission driving one-on-one, on real Toronto roads — calm, patient,
        and judgment-free."
      source="about"
    />
  )
}
