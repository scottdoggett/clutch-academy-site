import GearSection from '../GearSection'
import './Faq.css'

const FAQS = [
  {
    q: "Do I need a driver's license to take lessons?",
    a: 'Yes, a valid G2 or G license is required for all lessons.',
  },
  {
    q: "I've never touched a stick shift — is that okay?",
    a: 'Absolutely. Lessons are tailored to your starting skill level, whether you\'re a complete beginner or looking to refresh.',
  },
  {
    q: 'Where do lessons happen?',
    // PENDING: LESSON MEETUP LOCATION
    a: '[Pending — specific meetup location in Toronto.]',
  },
  {
    q: 'How many lessons will I need?',
    a: 'Most students feel confident after 3 lessons. Complete beginners may want the 3-lesson package; drivers with some prior experience often need only 1–2.',
  },
  {
    q: 'What should I wear?',
    a: 'Thin-soled shoes are best — you need good pedal feel to control the clutch smoothly.',
  },
  {
    q: 'How do I pay?',
    a: 'We accept cash, e-transfer, and PayPal. Payment is collected in person at the start of your lesson.',
  },
  {
    q: "What's the cancellation / reschedule policy?",
    // PENDING: CANCELLATION POLICY WORDING
    a: '[Pending — exact cancellation/reschedule policy wording from client.]',
  },
  {
    q: 'What car will I learn on?',
    // PENDING: TRAINING CAR MAKE/MODEL
    a: '[Pending — training car make/model and relevant details from client.]',
  },
  {
    q: 'Can I buy a lesson as a gift?',
    // PENDING: GIFT-LESSON ANSWER CONFIRMATION (suggested default below — confirm with client)
    a: "We don't currently offer gift certificates, but a friend or family member is welcome to pay for your lesson on your behalf.",
  },
]

export default function Faq() {
  return (
    <GearSection gear={6} id="faq">
      <h2>Frequently Asked Questions</h2>
      <div className="faq">
        {FAQS.map((item, i) => (
          <details key={i} className="faq__item">
            <summary className="faq__question">{item.q}</summary>
            <p className="faq__answer">{item.a}</p>
          </details>
        ))}
      </div>
    </GearSection>
  )
}
