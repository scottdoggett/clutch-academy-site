'use client'

import { useEffect } from 'react'
import { readStoredConsent } from '../lib/consent'
import { loadPixel as loadMetaPixel } from '../lib/metaPixel'
import { loadPixel as loadTiktokPixel } from '../lib/tiktokPixel'

// Returning visitors who already accepted consent: load the ad pixels on
// mount so the PageView/page event fires on this visit. First-time visitors
// load them from ConsentBanner when they click Accept. (GA4 needs no loader
// here — gtag.js is always present and Consent Mode gates its storage.)
export default function AnalyticsLoader() {
  useEffect(() => {
    if (readStoredConsent() === 'granted') {
      loadMetaPixel()
      loadTiktokPixel()
    }
  }, [])

  return null
}
