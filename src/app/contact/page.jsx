import PageStub from '../../components/PageStub'

export const metadata = {
  title: 'Contact Clutch Academy | Manual Driving Lessons Toronto',
  description:
    'Reach Clutch Academy by phone, email, Instagram, or Facebook. Payment is collected securely online when you book your manual driving lesson.',
  alternates: { canonical: '/contact' },
}

// PENDING: Phase 7 ports the Reverse contact-info card (phone, email,
// Instagram, Facebook) plus secure-payment and cancellation messaging.
// ❓ open decision: info-card only vs. reinstating a contact form.
export default function ContactPage() {
  return (
    <PageStub
      heading="Contact"
      lede="Questions before you book? Reach Clutch Academy by phone, email,
        Instagram, or Facebook — or grab a lesson time right away."
      source="contact"
    />
  )
}
