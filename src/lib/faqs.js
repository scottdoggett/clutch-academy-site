// Single source of truth for the site FAQ, first ported from the
// pre-overhaul Faq section and reworded in the October 9, 2026 copy pass.
// The /faq page renders the full list AND generates its FAQPage JSON-LD from
// this same array (Phase 7), while each lesson page surfaces a relevant
// subset by id — so on-page copy and structured data can't drift.
//
// Neither duration switch (60 -> 75 min on August 1, back to 60 in October
// 2026) needed edits here: the answers talk in lesson counts, not durations. If duration copy is ever added, it belongs in
// this array — never forked into a page.
export const FAQS = [
  {
    id: 'license',
    q: "Do I need a driver's license to take lessons?",
    a: 'Yes. You need a valid G2 or G license for every lesson.',
  },
  {
    id: 'never-driven',
    q: "I've never driven manual before. Is that okay?",
    a: 'Yes. Most students start as complete beginners. Sam works from your level and adds one skill at a time.',
  },
  {
    id: 'synonyms',
    q: "What's the difference between manual, stick shift, and standard?",
    a: "Nothing. They're three names for the same thing, a car you shift yourself with a clutch. Whether you call it manual, stick shift, or standard transmission, that's what you'll learn to drive here.",
  },
  {
    id: 'location',
    q: 'Where do lessons take place?',
    a: 'Lessons take place in Toronto. We usually start somewhere quiet to build confidence, then move onto real roads. You pick the meeting spot when you book.',
  },
  {
    id: 'how-many',
    q: 'How many lessons will I need?',
    a: 'Most beginners feel confident after 3 lessons. If you have some prior experience, 1–2 lessons is often enough to get comfortable.',
  },
  {
    id: 'wear',
    q: 'What should I wear?',
    a: 'Wear comfortable clothes and thin-soled shoes. Thin soles let you feel the clutch and pedals better. No sandals or open-toe shoes.',
  },
  {
    id: 'pay',
    q: 'How do I pay?',
    a: 'You pay securely through Stripe when you book. We accept all major credit and debit cards.',
  },
  {
    id: 'cancellation',
    // PENDING: final cancellation-policy wording from Sam (07-status.md item 6). This is
    // the wording currently live on the site; it renders on /faq, /contact,
    // and the package-page FAQ subsets — updating it here updates them all.
    q: 'What is your cancellation policy?',
    a: 'Cancellations made at least 24 hours before the scheduled lesson are eligible for a full refund. Cancellations made after 24 hours of booking or less than 24 hours before the lesson will be charged in full.',
  },
  {
    id: 'car',
    q: 'What car will I be learning on?',
    a: "You'll learn in a manual-transmission hatchback. Its clutch is smooth and forgiving, which makes it a good car to learn on.",
  },
  {
    id: 'gift',
    q: 'Can I buy a lesson as a gift?',
    a: 'Yes. You can buy lessons for someone else. Add their name when you book, or get in touch after you buy.',
  },
]

// Convenience lookup for pages that surface a subset by id.
export function faqSubset(ids) {
  return ids
    .map((id) => FAQS.find((f) => f.id === id))
    .filter(Boolean)
}
