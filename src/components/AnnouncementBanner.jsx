'use client'

import { useEffect, useRef } from 'react'
import './AnnouncementBanner.css'

// Fall-sale notice (src/lib/sale.js), ported from the live site (main's
// AnnouncementBanner at 4eff398). A thin strip above the nav that slides away
// as the page scrolls. It's in the server-rendered HTML, so crawlers read it
// too; app/layout.jsx mounts it only while FALL_SALE is on.
export default function AnnouncementBanner() {
  const bannerRef = useRef(null)

  // Publish the strip's real height to --announcement-height so every
  // --nav-height-based clearance (sections, nav offset) tracks it exactly
  // across breakpoints and copy wrapping. Until this runs, the estimate in
  // AnnouncementBanner.css holds the nav below the strip. The inline value is
  // removed on unmount.
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
  // in place. Both stay position: fixed.
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
        {/* The biggest drop on a struck-out price (src/lib/sale.js): the
            five-lesson package, $470 to $400. */}
        <span className="announcement-banner__save">
          <svg
            className="announcement-banner__tag"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M11.4 2.6A2 2 0 0 1 12.8 2H20a2 2 0 0 1 2 2v7.2a2 2 0 0 1-.6 1.4l-8.7 8.7a2.4 2.4 0 0 1-3.4 0l-6.6-6.6a2.4 2.4 0 0 1 0-3.4z" />
            <circle cx="16.5" cy="7.5" r="1.25" />
          </svg>
          <span>
            <strong>Save up to $70</strong>{' '}
            <span className="announcement-banner__save-note">
              on lesson packages.
            </span>
          </span>
        </span>
      </p>
    </aside>
  )
}
