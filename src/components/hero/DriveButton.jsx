import { forwardRef } from 'react'

// The way into play mode (docs/spec/hero-drive.md §Entry): a "Test drive"
// pill in the hero's bottom-right corner, after the CTAs in tab order. The
// steering wheel sits on a white disc, like a key fob's button; the label
// is white on the hero red, and the pill stays in sentence case so it never
// competes with Book a Lesson. The drive chunk starts loading as soon as
// the pill is hovered or focused, so a press rarely waits on it.

// A steering wheel in the site's 24×24 line-icon idiom: rim, hub and three
// spokes, strokeWidth 2 like the gear-lever bullet it sits beside in spirit.
const WHEEL = (
  <svg
    className="drive__icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.25" />
    <path d="M3.5 11h6.25M14.25 11h6.25M12 14.25V21" />
  </svg>
)

const DriveButton = forwardRef(function DriveButton({ onPress, onPrefetch, busy }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className="drive"
      aria-label="Test drive the black car with your keyboard"
      aria-busy={busy || undefined}
      onClick={onPress}
      onPointerEnter={onPrefetch}
      onFocus={onPrefetch}
    >
      <span className="drive__disc" aria-hidden="true">
        {WHEEL}
      </span>
      <span className="drive__label">Test drive</span>
    </button>
  )
})

export default DriveButton
