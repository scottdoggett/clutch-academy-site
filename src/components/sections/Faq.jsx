import GearSection from '../GearSection'
import './Faq.css'

const FAQS = [
  {
    q: "Do I need a driver's license to take lessons?",
    a: 'Yes — a valid G2 or G license is required for all lessons.',
  },
  {
    q: "I've never driven manual before — is that okay?",
    a: "Absolutely. Most students start as complete beginners. Lessons are tailored to your level, so you'll learn step by step without feeling overwhelmed.",
  },
  {
    q: 'Where do lessons take place?',
    a: 'Lessons take place in Toronto. We typically start in a quieter area to build confidence, then transition to real-road driving. Selection of meeting location available at booking.',
  },
  {
    q: 'How many lessons will I need?',
    a: 'Most beginners feel confident after 3 lessons. If you have some prior experience, 1–2 lessons is often enough to get comfortable.',
  },
  {
    q: 'What should I wear?',
    a: 'Wear comfortable clothing and thin-soled shoes — this helps you feel the clutch and pedals more precisely. No sandals or open-toe shoes.',
  },
  {
    q: 'How do I pay?',
    a: 'Payment is securely collected at the time of your booking using Stripe. Arrangements can be made to also accept e-transfer, and PayPal.',
  },
  {
    q: 'What is your cancellation policy?',
    a: "Cancellations are eligible for a full refund if made within 24 hours of booking and at least 24 hours before the scheduled lesson time. Cancellations made after 24 hours of booking or less than 24 hours before the lesson will be charged in ",
  },
  {
    q: 'What car will I be learning on?',
    a: "You'll learn in a 2015 Volkswagen Golf with a manual transmission — a great car for learning thanks to its smooth clutch and forgiving feel.",
  },
  {
    q: 'Can I buy a lesson as a gift?',
    a: 'Yes — lessons can be purchased for someone else. Just include their name when booking or reach out after purchase.',
  },
]

export default function Faq() {
  // Split into two columns for a more editorial, less scroll-heavy feel.
  const midpoint = Math.ceil(FAQS.length / 2)
  const left = FAQS.slice(0, midpoint)
  const right = FAQS.slice(midpoint)

  return (
    <GearSection gear={6} id="faq">
      <header className="section-header">
        <p className="section-header__eyebrow">Questions & Answers</p>
        <h2>Frequently Asked Questions</h2>
        <p className="section-header__lead">
          Everything you need to know before your first lesson. Still unsure?
          Drop a message below and we&apos;ll get back within 24 hours.
        </p>
      </header>

      <div className="faq-columns">
        {[left, right].map((col, ci) => (
          <div key={ci} className="faq">
            {col.map((item, i) => (
              <details key={i} name="faq-accordion" className="faq__item">
                <summary className="faq__question">{item.q}</summary>
                <p className="faq__answer">{item.a}</p>
              </details>
            ))}
          </div>
        ))}
      </div>
    </GearSection>
  )
}
