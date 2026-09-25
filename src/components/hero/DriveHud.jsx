import { forwardRef } from 'react'
import ControlsHint from './ControlsHint'
import GearGate from './GearGate'
import './DriveHud.css'

// The speedometer: a half circle, centred at (80, 84), 0 on the left to
// 220 km/h on the right over the top. The speed's arc outside, and a thin
// arc of revs inside it, each measured in 100ths so a value is a dash
// length.
export const TOP_KMH = 220
const SPEED_ARC = 'M20 84A60 60 0 0 1 140 84'
const REVS_ARC = 'M30 84A50 50 0 0 1 130 84'
// Ticks every 20 km/h, and a figure every 40.
const TICKS = Array.from({ length: 12 }, (_, i) => {
  const kmh = i * 20
  const a = Math.PI * (1 - kmh / TOP_KMH)
  const at = (r) => [80 + Math.cos(a) * r, 84 - Math.sin(a) * r]
  return { kmh, outer: at(70), inner: at(kmh % 40 ? 66 : 64), label: kmh % 40 ? null : at(78) }
})
const round = (v) => Math.round(v * 10) / 10

// What's on screen while someone drives (docs/spec/hero-drive.md §HUD), all
// in the driving layer over the window, along the bottom like a car's dash:
//
// - The speedometer, in the bottom-left corner: a half circle that fills
//   with the speed, the speed in figures in its mouth, and a thin arc of
//   revs inside with the redline.
// - The dock, in the middle. The keys show along its top when driving
//   starts and when the mode changes, then fade; below them, always, the
//   Auto / Manual switch and Stop. Focus lands on the dock, labelled
//   "Driving", and the switch and Stop are what screen readers get.
// - The gear shifter, in the bottom-right corner, large: its knob travels
//   the H-pattern, the gear sits beside it as a numeral, and in manual a
//   lamp lights while the clutch is down.
//
// Each sits on its own pod of dark, blurred glass, shaped to what it holds
// (a dome for the speedometer), so white reads over the red hero, the beige
// bands and the white roads alike. The speedometer and the shifter are
// decoration: aria-hidden.
// Per-frame
// values skip React: the speed, the revs, the redline's flicker and the
// clutch lamp are written straight to the DOM through the refs, so React
// re-renders only when the gear, the mode or the engine's state changes.
const DriveHud = forwardRef(function DriveHud(
  { gear, mode, off, grinding, hint, speed, speedArc, revs, redline, clutch, onToggleMode, onExit },
  ref,
) {
  const manual = mode === 'manual'
  return (
    <>
      <div className="dash__panel dash__speedo" aria-hidden="true">
        <svg className="speedo" viewBox="-10 -6 180 100" focusable="false">
          <g className="speedo__ticks">
            {TICKS.map((t) => (
              <line key={t.kmh} x1={round(t.inner[0])} y1={round(t.inner[1])} x2={round(t.outer[0])} y2={round(t.outer[1])} />
            ))}
          </g>
          {TICKS.filter((t) => t.label).map((t) => (
            <text key={t.kmh} className="speedo__figure" x={round(t.label[0])} y={round(t.label[1]) + 3}>
              {t.kmh}
            </text>
          ))}
          <path className="speedo__track" d={SPEED_ARC} pathLength="100" />
          <path ref={speedArc} className="speedo__speed" d={SPEED_ARC} pathLength="100" />
          <path className="speedo__revs-track" d={REVS_ARC} pathLength="100" />
          <path ref={redline} className="speedo__red" d={REVS_ARC} pathLength="100" />
          <path ref={revs} className="speedo__revs" d={REVS_ARC} pathLength="100" />
        </svg>
        <span className="speedo__readout">
          {/* Written every frame by HeroStage, not by React. */}
          <span ref={speed} className="speedo__kmh" />
          <span className="speedo__unit">km/h</span>
        </span>
      </div>

      <div
        className="dash__panel dash__shifter"
        aria-hidden="true"
        data-off={off || undefined}
        data-grinding={grinding || undefined}
      >
        <GearGate gear={gear} />
        <span className="dash__gear-col">
          <span className="dash__gear">{gear}</span>
          {manual && (
            <span ref={clutch} className="dash__clutch">
              clutch
            </span>
          )}
        </span>
      </div>

      <div ref={ref} className="dock" role="group" aria-label="Driving" tabIndex={-1}>
        <div className="drive-hint" aria-live="polite">
          {hint && <ControlsHint mode={mode} />}
        </div>
        <div className="dock__bar">
          <button
            type="button"
            className="dock__mode"
            aria-label={manual ? 'Manual gearbox. Switch to automatic' : 'Automatic gearbox. Switch to manual'}
            aria-keyshortcuts="M"
            onClick={onToggleMode}
          >
            <span data-on={!manual || undefined}>Auto</span>
            <span data-on={manual || undefined}>Manual</span>
            <kbd aria-hidden="true">M</kbd>
          </button>
          <button
            type="button"
            className="dock__stop"
            aria-label="Stop driving"
            aria-keyshortcuts="Escape"
            onClick={onExit}
          >
            <kbd aria-hidden="true">Esc</kbd>
            Stop
          </button>
        </div>
      </div>
    </>
  )
})

export default DriveHud
