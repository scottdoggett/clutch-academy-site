import PageStub from '../../components/PageStub'

export const metadata = {
  title: 'FAQ — Manual Driving Lessons in Toronto | Clutch Academy',
  description:
    'Answers about manual driving lessons in Toronto: licensing, experience needed, where lessons happen, what to wear, payment, cancellation, and more.',
  alternates: { canonical: '/faq' },
}

// PENDING: Phase 7 ports the existing 10-question array here and generates
// FAQPage JSON-LD from the same array so copy and structured data can't drift.
export default function FaqPage() {
  return (
    <PageStub
      heading="Frequently Asked Questions"
      lede="Everything students ask before their first manual lesson —
        licensing, experience, what to wear, payment, and cancellation."
      source="faq"
    />
  )
}
