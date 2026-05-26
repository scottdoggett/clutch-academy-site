// TikTok Pixel integration. The events.js library is lazy-loaded only after
// the user grants consent through ConsentBanner — matching how GA4 and the
// Meta Pixel are gated, and keeping zero requests to analytics.tiktok.com
// until consent.
//
// Calendly handles its own conversion tracking on completed bookings, so the
// events fired from this site are intent signals (ClickButton on CTA click,
// Contact on phone/email/social taps) rather than booking completions.

const PIXEL_ID = 'D87LSEBC77UENKCNER8G'
const SRC = 'https://analytics.tiktok.com/i18n/pixel/events.js'

let loaded = false

export function loadPixel() {
  if (typeof window === 'undefined') return
  if (window.__PRERENDER__) return
  if (loaded) return

  // Standard TikTok Pixel bootstrap, expanded from the official one-liner for
  // readability. Defines window.ttq as a queueing stub, injects events.js,
  // then fires load() + initial page().
  const w = window
  const d = document
  const t = 'ttq'

  w.TiktokAnalyticsObject = t
  const ttq = (w[t] = w[t] || [])
  ttq.methods = [
    'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once',
    'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent',
    'revokeConsent', 'grantConsent',
  ]
  ttq.setAndDefer = function (target, method) {
    target[method] = function () {
      target.push([method].concat(Array.prototype.slice.call(arguments, 0)))
    }
  }
  for (let i = 0; i < ttq.methods.length; i++) {
    ttq.setAndDefer(ttq, ttq.methods[i])
  }
  ttq.instance = function (id) {
    const e = ttq._i[id] || []
    for (let n = 0; n < ttq.methods.length; n++) {
      ttq.setAndDefer(e, ttq.methods[n])
    }
    return e
  }
  ttq.load = function (e, n) {
    ttq._i = ttq._i || {}
    ttq._i[e] = []
    ttq._i[e]._u = SRC
    ttq._t = ttq._t || {}
    ttq._t[e] = +new Date()
    ttq._o = ttq._o || {}
    ttq._o[e] = n || {}
    const script = d.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = SRC + '?sdkid=' + e + '&lib=' + t
    const first = d.getElementsByTagName('script')[0]
    first.parentNode.insertBefore(script, first)
  }

  ttq.load(PIXEL_ID)
  ttq.page()
  loaded = true
}

function track(event, params) {
  if (typeof window === 'undefined') return
  if (typeof window.ttq?.track !== 'function') return
  if (params) window.ttq.track(event, params)
  else window.ttq.track(event)
}

// TikTok's standard "ClickButton" event — the conversion-optimizable signal
// when a visitor taps a primary CTA. Mirrors metaPixel.trackLead so both
// pixels fire from the same call sites.
export function trackLead(source) {
  track('ClickButton', { source: source || 'unknown' })
}

// TikTok has a standard "Contact" event matching Meta's, so the semantics
// stay aligned across pixels.
export function trackContact(method) {
  track('Contact', { method: method || 'unknown' })
}
