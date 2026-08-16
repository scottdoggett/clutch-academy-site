import Link from 'next/link'
import BookButton from '../../components/BookButton'
import ContactCard from '../../components/ContactCard'
import { faqSubset } from '../../lib/faqs'
import './contact.css'

export const metadata = {
  title: 'Contact Clutch Academy | Manual Driving Lessons Toronto',
  description:
    'Reach Clutch Academy by phone, email, Instagram, or Facebook. Payment is collected securely online when you book your manual driving lesson.',
  alternates: { canonical: '/contact' },
}

// ❓ Open decision (08 §7): info-card only vs. reinstating a contact form.
// Current state stays info-card — the same contract as the live site's
// Reverse section. Revisit if Sam wants a form.
export default function ContactPage() {
  const [cancellation] = faqSubset(['cancellation'])

  return (
    <>
      <section
        className="section section--first"
        aria-labelledby="contact-heading"
      >
        <div className="section__inner contact-grid">
          {/* LEFT: pitch + primary book CTA */}
          <header className="contact-hero">
            <p className="section-header__eyebrow">Shift into gear</p>
            <h1 id="contact-heading" className="contact-hero__headline">
              Ready to drive stick with confidence?
            </h1>
            <BookButton source="contact" className="btn btn--primary btn--xl">
              Book Your First Lesson
            </BookButton>
            <p className="contact-hero__payment-note">
              Payment collected securely at time of booking, not in person
              <br />
              All cards accepted
            </p>
          </header>

          {/* RIGHT: contact info card */}
          <ContactCard />
        </div>
      </section>

      {/* ---------- Secure payment + cancellation messaging ---------- */}
      <section className="section" aria-labelledby="policies-heading">
        <div className="section__inner contact-policies">
          <header className="section-header">
            <p className="section-header__eyebrow">Booking, simply</p>
            <h2 id="policies-heading">Payment &amp; cancellation</h2>
          </header>
          <dl className="contact-policies__list">
            <div className="contact-policies__item">
              <dt>Secure payment</dt>
              <dd>
                Payment is securely collected at the time of your booking
                using Stripe — there’s nothing to settle in person. All major
                credit and debit cards are accepted.
              </dd>
            </div>
            <div className="contact-policies__item">
              <dt>Cancellation policy</dt>
              {/* Rendered from the shared FAQ array so this never drifts
                  from the /faq page or its structured data. */}
              <dd>{cancellation.a}</dd>
            </div>
          </dl>
          <p className="lesson-next__links">
            More questions? <Link href="/faq">Read the full FAQ</Link> or
            compare packages on the{' '}
            <Link href="/manual-driving-lessons">lessons overview</Link>.
          </p>
        </div>
      </section>
    </>
  )
}
