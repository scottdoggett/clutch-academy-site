'use client'

import { useEffect, useRef } from 'react'
import './AnnouncementBanner.css'

// Fall-sale notice (src/lib/sale.js), ported from the live site (main's
// AnnouncementBanner at 4eff398). A thin strip above the nav that scrolls
// away with the page. It's in the server-rendered HTML, so crawlers read it
// too; app/layout.jsx mounts it only while FALL_SALE is on.
//
// Scrolling is the browser's own, with no script: the strip sits in the
// page's flow and scrolls like any content, and the nav under it is
// position: sticky, so it rides up behind the strip and parks at the top
// (Nav.css). Until November 11, 2026 a scroll listener moved both, through a
// --header-shift variable on <html>. On phones that ran a frame or more
// behind the finger, because iOS scrolls on another thread, and it restyled
// the whole page every frame. The bar jittered on every swipe.
export default function AnnouncementBanner() {
  const bannerRef = useRef(null)

  // Publish the strip's real height to --announcement-height so every
  // --nav-height-based clearance (sections, the nav's negative margin) tracks
  // it exactly across breakpoints and copy wrapping. Until this runs, the
  // estimate in AnnouncementBanner.css holds. The inline value is removed on
  // unmount.
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

  return (
    <aside
      ref={bannerRef}
      className="announcement-banner"
      aria-label="Fall sale notice"
    >
      <p className="announcement-banner__copy">
        <span className="announcement-banner__flag">Fall sale</span>
        {/* Two sentences, so a phone can set them on rows of their own
            (AnnouncementBanner.css). */}
        <span className="announcement-banner__msg">
          <span className="announcement-banner__pitch">
            We&apos;ve downshifted our prices for a limited time.
          </span>{' '}
          <span className="announcement-banner__price">
            Lessons now from <strong>$90</strong>.
          </span>
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
