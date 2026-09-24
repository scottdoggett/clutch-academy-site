import { forwardRef } from 'react'

// The way into play mode (docs/spec/hero-drive.md §Entry): a quiet pill in
// the hero's bottom-right corner, after the CTAs in tab order. The drive
// chunk starts loading as soon as the pill is hovered or focused, so a press
// rarely waits on it.

// A steering wheel in the site's 24×24 line-icon idiom: rim, hub and three
// spokes, strokeWidth 2 like the gear-lever bullet it sits beside in spirit.
export const WHEEL = (
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
      aria-label="Drive the black car with your keyboard"
      aria-busy={busy || undefined}
      onClick={onPress}
      onPointerEnter={onPrefetch}
      onFocus={onPrefetch}
    >
      {WHEEL}
      <span className="drive__label">Drive</span>
    </button>
  )
})

export default DriveButton
