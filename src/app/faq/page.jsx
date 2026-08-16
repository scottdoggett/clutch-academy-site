import Link from 'next/link'
import BookButton from '../../components/BookButton'
import { FAQS } from '../../lib/faqs'
import './faq.css'

export const metadata = {
  title: 'FAQ — Manual Driving Lessons in Toronto | Clutch Academy',
  description:
    'Answers about manual driving lessons in Toronto: licensing, experience needed, where lessons happen, what to wear, payment, cancellation, and more.',
  alternates: { canonical: '/faq' },
}

// FAQPage structured data generated from the SAME array that renders the
// page (src/lib/faqs.js) — on-page copy and schema can't drift.
const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function FaqPage() {
  // Split into two columns for a more editorial, less scroll-heavy feel —
  // same treatment as the pre-overhaul section.
  const midpoint = Math.ceil(FAQS.length / 2)
  const columns = [FAQS.slice(0, midpoint), FAQS.slice(midpoint)]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <section
        className="section section--first"
        aria-labelledby="faq-heading"
      >
        <div className="section__inner">
          <header className="section-header">
            <p className="section-header__eyebrow">Questions &amp; Answers</p>
            <h1 id="faq-heading" className="faq-headline">
              Frequently Asked Questions
            </h1>
            <p className="section-header__lead">
              Everything you need to know before your first manual lesson.
              Still unsure? <Link href="/contact">Get in touch</Link>and
              we&apos;ll get back within 24 hours.
            </p>
          </header>

          <div className="faq-columns">
            {columns.map((col, ci) => (
              <div key={ci === 0 ? 'left' : 'right'} className="faq">
                {col.map((item) => (
                  <details
                    key={item.id}
                    name="faq-accordion"
                    className="faq__item"
                  >
                    <summary className="faq__question">{item.q}</summary>
                    <p className="faq__answer">{item.a}</p>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-cta-heading">
        <div className="section__inner lesson-next">
          <header className="section-header">
            <p className="section-header__eyebrow">Answered everything?</p>
            <h2 id="faq-cta-heading">Then let’s drive</h2>
          </header>
          <BookButton source="faq" className="btn btn--primary btn--xl">
            Book a Lesson
          </BookButton>
          <p className="lesson-next__links">
            Or start by choosing a package on the{' '}
            <Link href="/manual-driving-lessons">lessons overview</Link>.
          </p>
        </div>
      </section>
    </>
  )
}
