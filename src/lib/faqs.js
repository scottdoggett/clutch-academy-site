// Single source of truth for the site FAQ, ported verbatim from the
// pre-overhaul Faq section. The /faq page renders the full list AND
// generates its FAQPage JSON-LD from this same array (Phase 7), while each
// lesson page surfaces a relevant subset by id — so on-page copy and
// structured data can't drift.
//
// PENDING (Phase 10): the "How many lessons" answer references lesson counts
// only, but any future duration copy (60 -> 75 min) must be updated here on
// the August 1 switch.
export const FAQS = [
  {
    id: 'license',
    q: "Do I need a driver's license to take lessons?",
    a: 'Yes — a valid G2 or G license is required for all lessons.',
  },
  {
    id: 'never-driven',
    q: "I've never driven manual before — is that okay?",
    a: "Absolutely. Most students start as complete beginners. Lessons are tailored to your level, so you'll learn step by step without feeling overwhelmed.",
  },
  {
    id: 'synonyms',
    q: "What's the difference between manual, stick shift, and standard?",
    a: "Nothing — they're three names for the same thing: a car you shift yourself with a clutch. Whether you call it manual, stick shift, or standard transmission, that's exactly what you'll learn to drive here.",
  },
  {
    id: 'location',
    q: 'Where do lessons take place?',
    a: 'Lessons take place in Toronto. We typically start in a quieter area to build confidence, then transition to real-road driving. Selection of meeting location available at booking.',
  },
  {
    id: 'how-many',
    q: 'How many lessons will I need?',
    a: 'Most beginners feel confident after 3 lessons. If you have some prior experience, 1–2 lessons is often enough to get comfortable.',
  },
  {
    id: 'wear',
    q: 'What should I wear?',
    a: 'Wear comfortable clothing and thin-soled shoes — this helps you feel the clutch and pedals more precisely. No sandals or open-toe shoes.',
  },
  {
    id: 'pay',
    q: 'How do I pay?',
    a: 'Payment is securely collected at the time of your booking using Stripe. Arrangements can be made to also accept e-transfer, and PayPal.',
  },
  {
    id: 'cancellation',
    // PENDING: final cancellation-policy wording from Sam (08 §7). This is
    // the wording currently live on the site; it renders on /faq, /contact,
    // and the package-page FAQ subsets — updating it here updates them all.
    q: 'What is your cancellation policy?',
    a: 'Cancellations made at least 24 hours before the scheduled lesson are eligible for a full refund. Cancellations made after 24 hours of booking or less than 24 hours before the lesson will be charged in full.',
  },
  {
    id: 'car',
    q: 'What car will I be learning on?',
    a: "You'll learn in a 2015 Volkswagen Golf with a manual transmission — a great car for learning thanks to its smooth clutch and forgiving feel.",
  },
  {
    id: 'gift',
    q: 'Can I buy a lesson as a gift?',
    a: 'Yes — lessons can be purchased for someone else. Just include their name when booking or reach out after purchase.',
  },
]

// Convenience lookup for pages that surface a subset by id.
export function faqSubset(ids) {
  return ids
    .map((id) => FAQS.find((f) => f.id === id))
    .filter(Boolean)
}
