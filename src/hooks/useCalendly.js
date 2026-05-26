import { trackLead as trackMetaLead } from '../lib/metaPixel'
import { trackLead as trackTiktokLead } from '../lib/tiktokPixel'

// When clients provide separate event types per package, extend this hook to
// accept a source-specific URL.
//
// `primary_color` is the accent Calendly uses for selectable dates,
// time-slot buttons, and the confirm CTA. The original snippet from Sam
// passed `ffffff`, which made those elements white-on-white inside the
// popup — switching to the brand red so they're legible.
export const CALENDLY_URL =
  'https://calendly.com/clutchacademy-ibca?primary_color=c8102e'

const WIDGET_JS = 'https://assets.calendly.com/assets/external/widget.js'
const WIDGET_CSS = 'https://assets.calendly.com/assets/external/widget.css'

// Calendly's widget is ~100KB of third-party JS. Loading it on first user
// intent (rather than on initial page load) keeps it out of the prerendered
// HTML and shaves the critical-path payload. Once injected, the script is
// reused for the rest of the session.
let loadPromise = null
function ensureCalendlyLoaded() {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.Calendly?.initPopupWidget) return Promise.resolve(true)
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve) => {
    if (!document.querySelector('link[data-calendly-css]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = WIDGET_CSS
      link.dataset.calendlyCss = 'true'
      document.head.appendChild(link)
    }

    const existing = document.querySelector('script[data-calendly-js]')
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true })
      existing.addEventListener('error', () => resolve(false), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = WIDGET_JS
    script.async = true
    script.dataset.calendlyJs = 'true'
    script.addEventListener('load', () => resolve(true), { once: true })
    script.addEventListener('error', () => resolve(false), { once: true })
    document.head.appendChild(script)
  })
  return loadPromise
}

/**
 * Opens the Calendly popup widget. Returns `false` so it can be used directly
 * as an onClick handler without the browser following any default link action.
 *
 * `source` (e.g. "hero", "packages_single", "reverse") is passed to GA4 as
 * the `booking_cta_click` event so we can attribute conversions to the
 * specific CTA the user clicked. gtag is queued by Consent Mode while
 * analytics_storage is denied; once granted, queued events flush.
 */
export function openCalendly(source) {
  if (typeof window === 'undefined') return false

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'booking_cta_click', { source: source || 'unknown' })
  }
  trackMetaLead(source)
  trackTiktokLead(source)

  ensureCalendlyLoaded().then((ok) => {
    if (!ok || !window.Calendly?.initPopupWidget) {
      // Script failed (network, ad-blocker) — fall back to opening the
      // scheduling page in a new tab so the conversion isn't lost.
      window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')
      return
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches

    // Mobile: render into our own constrained container so iOS Safari can't
    // mis-size the popup and stretch the document. Desktop uses the native
    // Calendly popup unchanged.
    if (isMobile) {
      openMobilePopup()
    } else {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL })
    }
  })

  return false
}

function openMobilePopup() {
  const overlay = document.createElement('div')
  overlay.className = 'cal-host-overlay'

  const popup = document.createElement('div')
  popup.className = 'cal-host-popup'

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.className = 'cal-host-close'
  closeBtn.setAttribute('aria-label', 'Close booking dialog')
  closeBtn.textContent = '×'

  const close = () => {
    overlay.remove()
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onKeydown)
  }
  const onKeydown = (e) => {
    if (e.key === 'Escape') close()
  }

  closeBtn.addEventListener('click', close)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close()
  })
  document.addEventListener('keydown', onKeydown)

  document.body.style.overflow = 'hidden'
  popup.appendChild(closeBtn)
  overlay.appendChild(popup)
  document.body.appendChild(overlay)

  // initInlineWidget mounts only the booking iframe into our parent, with
  // none of Calendly's own popup/overlay chrome. initPopupWidget would inject
  // its own overlay wrapper even when parentElement is provided, producing a
  // second popup stacked on top of ours.
  window.Calendly.initInlineWidget({
    url: CALENDLY_URL,
    parentElement: popup,
  })
}
