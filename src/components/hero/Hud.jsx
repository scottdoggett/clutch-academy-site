import { forwardRef } from 'react'
import ControlsHint from './ControlsHint'
import GearGate from './GearGate'
import './Hud.css'

// The gear display (docs/spec/hero-drive.md §HUD), where the Drive pill was:
// the H-pattern with its travelling knob, the gear as a big numeral, a thin
// rev bar with the redline marked, the clutch lamp, the Auto / Manual
// switch and the × to stop. Machined, not gamey: white on the hero red, on
// a plate with a hairline, in the site's type.
//
// Focus lands on the group, labelled "Driving". Only the switch, the × and
// the hint's live region are for screen readers; a gear read out on every
// change would help nobody.
//
// The rev bar and the redline mark move every frame, straight from the
// engine through `rev` and `redline` (HeroStage), so React re-renders only
// when the gear, the mode, the clutch or the engine's state changes.
const Hud = forwardRef(function Hud({ gear, mode, clutch, off, grinding, hint, rev, redline, onToggleMode, onExit }, ref) {
  const manual = mode === 'manual'
  return (
    <div ref={ref} className="hud" role="group" aria-label="Driving" tabIndex={-1}>
      <div className="drive-hint" aria-live="polite">
        {hint && <ControlsHint mode={mode} />}
      </div>
      <div className="hud__plate">
        <div className="hud__gearbox" aria-hidden="true" data-off={off || undefined} data-grinding={grinding || undefined}>
          <GearGate gear={gear} />
          <span className="hud__gear">{gear}</span>
        </div>
        <button type="button" className="hud__exit" aria-label="Stop driving" onClick={onExit}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M7 7l10 10M17 7L7 17" />
          </svg>
        </button>
        <div className="hud__rev" aria-hidden="true">
          <span ref={rev} className="hud__rev-fill" />
          <span ref={redline} className="hud__redline" />
        </div>
        <span className="hud__clutch" aria-hidden="true" data-on={clutch || undefined} hidden={!manual}>
          Clutch
        </span>
        <button
          type="button"
          className="hud__mode"
          aria-label={manual ? 'Manual gearbox. Switch to automatic' : 'Automatic gearbox. Switch to manual'}
          onClick={onToggleMode}
        >
          <span data-on={!manual || undefined}>Auto</span>
          <span data-on={manual || undefined}>Manual</span>
          <kbd aria-hidden="true">M</kbd>
        </button>
      </div>
    </div>
  )
})

export default Hud
