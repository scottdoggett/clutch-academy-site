'use client'

import { openCalendly } from '../hooks/useCalendly'

// Shared booking CTA: opens the Calendly popup and fires the per-CTA
// attribution events (GA4 booking_cta_click + Meta/TikTok intent signals).
// `source` identifies the CTA for conversion attribution — one distinct tag
// per placement (e.g. 'nav', 'hero', 'announcement').
export default function BookButton({
  source,
  className = 'btn btn--primary',
  children = 'Book Now',
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => openCalendly(source)}
    >
      {children}
    </button>
  )
}
