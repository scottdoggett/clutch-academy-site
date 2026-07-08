import { useEffect, useRef, useState } from 'react'
import './AnnouncementBanner.css'

// The banner is a pre-August-1 pricing notice; it auto-hides once the new
// pricing takes effect. August 1, 2026, 00:00 Toronto time (EDT = UTC-4).
const DEADLINE = new Date('2026-08-01T00:00:00-04:00')

const isBeforeDeadline = () => new Date() < DEADLINE

export default function AnnouncementBanner() {
  // Start shown so the prerendered snapshot and the first client paint match
  // (crawler-visible, no flash-in), then retract in a post-mount effect if
  // we're already past the deadline. Mirrors ConsentBanner's hydration-safe
  // pattern, reversed: start visible, hide when expired.
  const [visible, setVisible] = useState(true)
  const bannerRef = useRef(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe expiry check
    if (!isBeforeDeadline()) setVisible(false)
  }, [])

  // Publish the strip's real height to --announcement-height so every
  // --nav-height-based clearance (sections, gear indicators, nav offset)
  // tracks it exactly across breakpoints and copy wrapping. Reverts to the
  // 0px token default when the strip unmounts (auto-hide / past deadline).
  useEffect(() => {
    if (!visible) return
    const el = bannerRef.current
    if (!el) return

    const root = document.documentElement
    const sync = () =>
      root.style.setProperty('--announcement-height', `${el.offsetHeight}px`)

    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(el)

    return () => {
      observer.disconnect()
      root.style.removeProperty('--announcement-height')
    }
  }, [visible])

  // Ride-up-and-lock: as the page scrolls, shift the banner AND the nav up in
  // lockstep (both read the shared --header-shift var) until the banner has
  // slid fully out of view and the nav is parked at the top. Clamped to the
  // banner's own height, so once you've scrolled past it the nav stays locked
  // in place. Structure is untouched (both stay position: fixed), so the gear
  // pin/scroll math is undisturbed.
  useEffect(() => {
    if (!visible) return
    const el = bannerRef.current
    if (!el) return

    const root = document.documentElement
    let raf = 0

    const update = () => {
      raf = 0
      const max = el.offsetHeight
      const shift = Math.min(Math.max(window.scrollY, 0), max)
      root.style.setProperty('--header-shift', `${shift}px`)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update() // seed initial value (handles a reload mid-page)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
      root.style.removeProperty('--header-shift')
    }
  }, [visible])

  if (!visible) return null

  return (
    <aside
      ref={bannerRef}
      className="announcement-banner"
      aria-label="Pricing change notice"
    >
      <p className="announcement-banner__copy">
        <span className="announcement-banner__flag">Effective Aug 1</span>
        <span className="announcement-banner__msg">
          Lessons grow from 60 to <strong>75 minutes</strong>, 25% more time
          behind the wheel, plus new pricing.{' '}
          <span className="announcement-banner__lock">
            Book before August 1 to lock in current rates.
          </span>
        </span>
      </p>
    </aside>
  )
}
