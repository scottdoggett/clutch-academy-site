import { useEffect, useRef } from 'react'
import './AnnouncementBanner.css'

// Fall-sale notice. A thin strip above the nav that slides away as the
// page scrolls. Rendered unconditionally so the prerendered snapshot and the
// first client paint match; take it out of App.jsx when the sale ends.
export default function AnnouncementBanner() {
  const bannerRef = useRef(null)

  // Publish the strip's real height to --announcement-height so every
  // --nav-height-based clearance (sections, gear indicators, nav offset)
  // tracks it exactly across breakpoints and copy wrapping. Reverts to the
  // 0px token default on unmount.
  useEffect(() => {
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
  }, [])

  // Ride-up-and-lock: as the page scrolls, shift the banner AND the nav up in
  // lockstep (both read the shared --header-shift var) until the banner has
  // slid fully out of view and the nav is parked at the top. Clamped to the
  // banner's own height, so once you've scrolled past it the nav stays locked
  // in place. Structure is untouched (both stay position: fixed), so the gear
  // pin/scroll math is undisturbed.
  useEffect(() => {
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
  }, [])

  return (
    <aside
      ref={bannerRef}
      className="announcement-banner"
      aria-label="Fall sale notice"
    >
      <p className="announcement-banner__copy">
        <span className="announcement-banner__flag">Fall sale</span>
        <span className="announcement-banner__msg">
          We&apos;ve downshifted our prices for a limited time. Lessons now from{' '}
          <strong>$90</strong>.
        </span>
      </p>
    </aside>
  )
}
