import { Fragment } from 'react'

// The controls, shown when driving starts and again when the gearbox mode
// changes (docs/spec/hero-drive.md §Entry), in the live region above the
// gear display so a screen reader hears them. The automatic needs only the
// pedals and the wheel; the manual adds the lever and the clutch. Each key
// stays with its word, so a line only ever breaks between pairs.
export default function ControlsHint({ mode }) {
  const manual = mode === 'manual'
  const pairs = [
    [['W', 'A', 'S', 'D'], 'drive'],
    ...(manual
      ? [
          [['↑', '↓'], 'shift'],
          [['Shift'], 'clutch'],
        ]
      : []),
    [['M'], manual ? 'automatic' : 'manual'],
    [['Esc'], 'exit'],
  ]
  return (
    <p className="drive-hint__text">
      {pairs.map(([keys, word], i) => (
        <Fragment key={word}>
          <span className="drive-hint__pair">
            <span className="drive-hint__keys">
              {keys.map((k) => (
                <kbd key={k}>{k}</kbd>
              ))}
            </span>{' '}
            {word}
          </span>
          {i < pairs.length - 1 && ' · '}
        </Fragment>
      ))}
    </p>
  )
}
