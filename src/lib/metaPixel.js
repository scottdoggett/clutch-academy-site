// Meta Pixel integration. The fbevents.js library is lazy-loaded only after
// the user grants consent through ConsentBanner — matching how GA4 is gated
// and keeping zero requests to connect.facebook.net until consent.
//
// Calendly handles its own conversion tracking on completed bookings, so the
// events fired from this site are intent signals (Lead on CTA click, Contact
// on phone/email/social taps) rather than booking completions.

const PIXEL_ID = '2845684255788584'
const SRC = 'https://connect.facebook.net/en_US/fbevents.js'

let loaded = false

export function loadPixel() {
  if (typeof window === 'undefined') return
  if (window.__PRERENDER__) return
  if (loaded || window.fbq?.loaded) {
    loaded = true
    return
  }

  // Standard Meta Pixel snippet, expanded for readability. Defines the fbq
  // queue, injects fbevents.js, then fires init + initial PageView.
  const n = (window.fbq = function () {
    n.callMethod
      ? n.callMethod.apply(n, arguments)
      : n.queue.push(arguments)
  })
  if (!window._fbq) window._fbq = n
  n.push = n
  n.loaded = true
  n.version = '2.0'
  n.queue = []

  const script = document.createElement('script')
  script.async = true
  script.src = SRC
  const first = document.getElementsByTagName('script')[0]
  first.parentNode.insertBefore(script, first)

  window.fbq('init', PIXEL_ID)
  window.fbq('track', 'PageView')
  loaded = true
}

function track(event, params) {
  if (typeof window === 'undefined') return
  if (typeof window.fbq !== 'function') return
  if (params) window.fbq('track', event, params)
  else window.fbq('track', event)
}

export function trackLead(source) {
  track('Lead', { source: source || 'unknown' })
}

export function trackContact(method) {
  track('Contact', { method: method || 'unknown' })
}
