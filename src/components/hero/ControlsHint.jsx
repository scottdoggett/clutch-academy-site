// The keys, along the bottom of the window when driving starts and again
// when the gearbox mode changes (docs/spec/hero-drive.md §HUD), in the live
// region of the dock so a screen reader hears them. The automatic needs only
// the pedals and the wheel; the manual adds the lever and the clutch. The
// mode switch and Stop sit in the dock's bar below with their own keys, so
// they're spoken here but not shown twice. Each key stays with its word, so
// a line only ever breaks between pairs.
export default function ControlsHint({ mode }) {
  const manual = mode === 'manual'
  const pairs = [
    [['W', 'A', 'S', 'D'], 'drive'],
    ...(manual
      ? [
          [['↑', '↓'], 'shift'],
          [['Shift'], 'hold for the clutch'],
        ]
      : []),
  ]
  return (
    <p className="drive-hint__text">
      {pairs.map(([keys, word]) => (
        <span key={word} className="drive-hint__pair">
          <span className="drive-hint__keys">
            {keys.map((k) => (
              <kbd key={k}>{k}</kbd>
            ))}
          </span>{' '}
          {word}
        </span>
      ))}
      <span className="visually-hidden">
        {' '}
        M switches to {manual ? 'the automatic' : 'manual'}. Esc stops.
      </span>
    </p>
  )
}
