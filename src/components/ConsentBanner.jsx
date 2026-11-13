'use client'

import { useEffect, useState } from 'react'
import './ConsentBanner.css'
import { CONSENT_STORAGE_KEY, readStoredConsent } from '../lib/consent'
import { loadPixel as loadMetaPixel } from '../lib/metaPixel'
import { loadPixel as loadTiktokPixel } from '../lib/tiktokPixel'

export default function ConsentBanner() {
  // Start hidden, then reveal on the client if no decision is stored. This
  // post-mount toggle is intentional: the server-rendered HTML contains no
  // banner, and we want hydration to match before revealing.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (readStoredConsent() === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe client-only reveal
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const decide = (choice) => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, choice)
    } catch {
      /* localStorage may be disabled (private mode, quota); fall through */
    }
    if (typeof window.gtag === 'function') {
      // Flip analytics + ad storage together so Google Ads conversion tracking
      // and remarketing work for visitors who accept. GA4, Google Ads, and the
      // Meta/TikTok pixels are all disclosed in the banner copy below.
      const consent = choice === 'granted' ? 'granted' : 'denied'
      window.gtag('consent', 'update', {
        analytics_storage: consent,
        ad_storage: consent,
        ad_user_data: consent,
        ad_personalization: consent,
      })
    }
    if (choice === 'granted') {
      loadMetaPixel()
      loadTiktokPixel()
    }
    setVisible(false)
  }

  return (
    <div
      className="consent-banner"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <p className="consent-banner__copy">
        We use cookies for analytics (Google Analytics) and ad measurement
        (Google Ads, Meta Pixel, TikTok Pixel) to understand how visitors use
        the site and how our ads perform. Calendly sets its own cookies when
        you book a lesson.{' '}
        <a href="/privacy" className="consent-banner__link">
          Privacy policy
        </a>
        .
      </p>
      <div className="consent-banner__actions">
        <button
          type="button"
          className="consent-banner__btn consent-banner__btn--secondary"
          onClick={() => decide('denied')}
        >
          Decline
        </button>
        <button
          type="button"
          className="consent-banner__btn consent-banner__btn--primary"
          onClick={() => decide('granted')}
        >
          Accept
        </button>
      </div>
    </div>
  )
}
