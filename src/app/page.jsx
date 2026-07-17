import Hero from '../components/home/Hero'
import Reviews from '../components/home/Reviews'
import HowItWorks from '../components/home/HowItWorks'
import PackagesTeaser from '../components/home/PackagesTeaser'
import AboutTeaser from '../components/home/AboutTeaser'
import googleReviews from '../lib/googleReviews'

export const metadata = {
  description:
    'Manual transmission driving lessons in Toronto from $90/hr. One-on-one, on real roads, with founder-instructor Sam Anthony. Book your first hour online.',
  alternates: { canonical: '/' },
  openGraph: {
    url: 'https://clutchacademy.ca/',
    title: 'Manual Driving Lessons in Toronto | Clutch Academy',
    description:
      'Manual transmission driving lessons in Toronto from $90/hr. One-on-one, on real roads. Book your first hour online.',
    images: [
      {
        url: '/og-image.png?v=2',
        width: 1200,
        height: 630,
        alt: 'Clutch Academy — manual transmission driving lessons in Toronto',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manual Driving Lessons in Toronto | Clutch Academy',
    description:
      'Manual transmission driving lessons in Toronto from $90/hr. One-on-one, on real roads.',
    images: ['/og-image.png?v=2'],
  },
}

// DrivingSchool / Offer / Person structured data, carried over verbatim from
// the pre-overhaul index.html. Offers still describe the OLD packages/prices —
// the Phase 10 pricing switch updates them together with the on-page copy.
const SCHEMA_GRAPH = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'DrivingSchool',
      '@id': 'https://clutchacademy.ca/#business',
      name: 'Clutch Academy',
      alternateName: 'Clutch Academy Manual Driving Lessons',
      url: 'https://clutchacademy.ca/',
      description:
        'Manual transmission driving school in Toronto. One-on-one lessons on real roads with founder-instructor Sam Anthony.',
      image: 'https://clutchacademy.ca/og-image.png?v=2',
      logo: 'https://clutchacademy.ca/logo.svg',
      telephone: '+1-437-223-1153',
      email: 'hello@clutchacademy.ca',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Toronto',
        addressRegion: 'ON',
        addressCountry: 'CA',
      },
      priceRange: '$$',
      currenciesAccepted: 'CAD',
      paymentAccepted: 'Credit Card, Debit Card, E-Transfer',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 43.7182412,
        longitude: -79.3780581,
      },
      hasMap: 'https://maps.app.goo.gl/5Mi1EeB3jRs35Ezr5',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          opens: '08:00',
          closes: '21:00',
        },
      ],
      areaServed: [
        { '@type': 'City', name: 'Toronto', containedInPlace: { '@type': 'AdministrativeArea', name: 'Ontario, Canada' } },
        { '@type': 'City', name: 'Etobicoke', containedInPlace: { '@type': 'AdministrativeArea', name: 'Ontario, Canada' } },
        { '@type': 'City', name: 'North York', containedInPlace: { '@type': 'AdministrativeArea', name: 'Ontario, Canada' } },
        { '@type': 'City', name: 'Scarborough', containedInPlace: { '@type': 'AdministrativeArea', name: 'Ontario, Canada' } },
        { '@type': 'City', name: 'East York', containedInPlace: { '@type': 'AdministrativeArea', name: 'Ontario, Canada' } },
        { '@type': 'City', name: 'Mississauga', containedInPlace: { '@type': 'AdministrativeArea', name: 'Ontario, Canada' } },
        { '@type': 'City', name: 'Vaughan', containedInPlace: { '@type': 'AdministrativeArea', name: 'Ontario, Canada' } },
      ],
      // Wired to the shared Business Profile numbers module so the markup can
      // never drift from the visible badges. Whether aggregateRating should
      // exist at all is still the open flag in 09 §5.3 — this only keeps it
      // accurate while it does.
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: googleReviews.rating.toFixed(1),
        reviewCount: googleReviews.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
      sameAs: [
        'https://www.instagram.com/clutchacademy.ca/',
        'https://www.facebook.com/profile.php?id=61569269306023',
        'https://maps.app.goo.gl/5Mi1EeB3jRs35Ezr5',
      ],
      makesOffer: [
        { '@id': 'https://clutchacademy.ca/#offer-single' },
        { '@id': 'https://clutchacademy.ca/#offer-3pack' },
        { '@id': 'https://clutchacademy.ca/#offer-confidence-5pack' },
      ],
      employee: [{ '@id': 'https://clutchacademy.ca/#instructor-sam' }],
    },
    {
      '@type': 'Offer',
      '@id': 'https://clutchacademy.ca/#offer-single',
      name: 'Single Lesson',
      description: 'One hour of one-on-one manual transmission instruction.',
      price: '90.00',
      priceCurrency: 'CAD',
      category: 'Driving lesson',
      availability: 'https://schema.org/InStock',
      offeredBy: { '@id': 'https://clutchacademy.ca/#business' },
    },
    {
      '@type': 'Offer',
      '@id': 'https://clutchacademy.ca/#offer-3pack',
      name: '3-Lesson Package',
      description:
        'Three one-hour lessons: progression from clutch basics to road-confident driving.',
      price: '240.00',
      priceCurrency: 'CAD',
      category: 'Driving lesson package',
      availability: 'https://schema.org/InStock',
      offeredBy: { '@id': 'https://clutchacademy.ca/#business' },
    },
    {
      '@type': 'Offer',
      '@id': 'https://clutchacademy.ca/#offer-confidence-5pack',
      name: 'Highway & City Confidence Drive (5-Lesson Package)',
      description:
        'Five one-hour lessons covering downtown driving, highway merging, hill starts, and rush-hour practice, with a confidence guarantee.',
      price: '400.00',
      priceCurrency: 'CAD',
      category: 'Driving lesson package',
      availability: 'https://schema.org/InStock',
      offeredBy: { '@id': 'https://clutchacademy.ca/#business' },
    },
    {
      '@type': 'Person',
      '@id': 'https://clutchacademy.ca/#instructor-sam',
      name: 'Samuel Anthony',
      jobTitle: 'Founder & Lead Instructor',
      worksFor: { '@id': 'https://clutchacademy.ca/#business' },
    },
  ],
}

// Conventional scrolling homepage (Phase 4): introduce Clutch Academy, build
// trust, showcase reviews, introduce Sam, and route visitors to the dedicated
// package pages — the detail lives there, not inline.
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_GRAPH) }}
      />
      <Hero />
      <Reviews />
      <HowItWorks />
      <PackagesTeaser />
      <AboutTeaser />
    </>
  )
}
