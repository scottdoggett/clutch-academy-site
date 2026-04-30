// When clients provide separate event types per package, extend this hook to
// accept a source-specific URL.
//
// `primary_color` is the accent Calendly uses for selectable dates,
// time-slot buttons, and the confirm CTA. The original snippet from Sam
// passed `ffffff`, which made those elements white-on-white inside the
// popup — switching to the brand red so they're legible.
export const CALENDLY_URL =
  'https://calendly.com/clutchacademy-ibca?primary_color=c8102e'

/**
 * Opens the Calendly popup widget. Returns `false` so it can be used directly
 * as an onClick handler without the browser following any default link action.
 *
 * Callers may pass a `source` string (e.g. "hero", "packages_single",
 * "reverse") for the GA4 `booking_cta_click` event wired up in step 17;
 * the parameter is currently ignored but kept in the signature so call
 * sites don't have to change once analytics is wired in.
 */
export function openCalendly() {
  if (typeof window === 'undefined') return false
  if (!window.Calendly?.initPopupWidget) {
    // The Calendly widget script is loaded async; in the rare case a user
    // clicks before it's ready, fall back to opening the scheduling page in a
    // new tab so the conversion isn't lost.
    window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')
    return false
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
