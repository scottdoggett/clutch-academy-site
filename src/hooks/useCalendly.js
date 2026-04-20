// PENDING: CALENDLY URL — swap for client's actual Calendly scheduling link.
// When clients provide separate event types per package, extend this hook to
// accept a source-specific URL.
export const CALENDLY_URL = 'https://calendly.com/CLUTCH_ACADEMY_URL'

/**
 * Opens the Calendly popup widget. Returns `false` so it can be used directly
 * as an onClick handler without the browser following any default link action.
 *
 * `source` is reserved for the GA4 `booking_cta_click` event wired up in
 * step 17 (e.g. "hero", "packages_single", "reverse").
 */
export function openCalendly(_source = 'unknown') {
  if (typeof window === 'undefined') return false
  if (window.Calendly?.initPopupWidget) {
    window.Calendly.initPopupWidget({ url: CALENDLY_URL })
  } else {
    // The Calendly widget script is loaded async; in the rare case a user
    // clicks before it's ready, fall back to opening the scheduling page in a
    // new tab so the conversion isn't lost.
    window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')
  }
  return false
}
