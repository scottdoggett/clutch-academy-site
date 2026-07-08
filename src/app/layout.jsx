import Script from 'next/script'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import AnnouncementBanner from '../components/AnnouncementBanner'
import ConsentBanner from '../components/ConsentBanner'
import AnalyticsLoader from '../components/AnalyticsLoader'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://clutchacademy.ca'),
  title: 'Manual Driving Lessons in Toronto | Clutch Academy',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: [
      { url: '/favicon.svg?v=3', type: 'image/svg+xml' },
      { url: '/favicon-32.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48.png?v=2', sizes: '48x48', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png?v=2', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    siteName: 'Clutch Academy',
    type: 'website',
    locale: 'en_CA',
  },
  // PENDING: Search Console verification — add
  // verification: { google: '...' } once the GSC token is issued.
}

export const viewport = {
  themeColor: '#C8102E',
}

// Google Analytics 4 + Google Ads (gtag.js) with Consent Mode v2
// (default-deny). Rendered as a synchronous inline script so consent defaults
// are set before the async gtag.js library processes the queue. The pageview
// and any subsequent events are queued by gtag and only flushed once the user
// grants consent through the in-app ConsentBanner, which flips analytics + ad
// storage to granted. Mirrors the inline snippet in public/booked.html.
const GTAG_CONSENT_INIT = `
window.dataLayer = window.dataLayer || []
function gtag() {
  dataLayer.push(arguments)
}
window.gtag = gtag
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
})
// Read persisted consent BEFORE the gtag config call so the page-view
// event respects a returning visitor's prior choice.
try {
  var stored = localStorage.getItem('clutch.consent.v1')
  if (stored === 'granted') {
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted'
    })
  }
} catch (_) {}
gtag('js', new Date())
gtag('config', 'G-5E5GEN5N59', { anonymize_ip: true })
// Google Ads conversion tag — same gtag.js library, added as a second
// config per Google's "tag already installed (e.g. via GA)" setup path.
gtag('config', 'AW-18196514948')
`

export default function RootLayout({ children }) {
  return (
    <html lang="en-CA" className={`${jakarta.variable} ${inter.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: GTAG_CONSENT_INIT }} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5E5GEN5N59"
          strategy="afterInteractive"
        />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AnnouncementBanner />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <ConsentBanner />
        <AnalyticsLoader />
      </body>
    </html>
  )
}
