import './GearIndicator.css'

export default function GearIndicator({ gear, position }) {
  return (
    <div
      className={`gear-indicator gear-indicator--${position}`}
      aria-hidden="true"
    >
      <span className="gear-indicator__numeral">{gear}</span>
    </div>
  )
}
