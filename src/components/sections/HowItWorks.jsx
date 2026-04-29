import GearSection from '../GearSection'
import './HowItWorks.css'

const STEPS = [
  {
    n: 1,
    title: 'Pick a package',
    desc: 'Choose the single lesson or 3-pack that fits your goals.',
  },
  {
    n: 2,
    title: 'Book on Calendly',
    desc: 'Select a time that works for you in seconds.',
  },
  {
    n: 3,
    title: 'Meet at the lesson',
    desc: "Show up ready to drive — we'll handle the rest.",
  },
  {
    n: 4,
    title: 'Drive with confidence',
    desc: 'One-on-one coaching tailored to your pace.',
  },
]

export default function HowItWorks() {
  return (
    <GearSection gear={3} id="how-it-works">
      <header className="section-header section-header--center">
        <p className="section-header__eyebrow">The Process</p>
        <h2>How It Works</h2>
        <p className="section-header__lead">
          From picking a package to leaving with confidence.
        </p>
      </header>

      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s.n} className="steps__item">
            <div className="steps__header">
              <span className="steps__num" aria-hidden="true">
                {String(s.n).padStart(2, '0')}
              </span>
              {i < STEPS.length - 1 && (
                <span className="steps__rule" aria-hidden="true" />
              )}
            </div>
            <h3 className="steps__title">{s.title}</h3>
            <p className="steps__desc">{s.desc}</p>
          </li>
        ))}
      </ol>

      <section className="first-lesson">
        <div className="first-lesson__heading">
          <p className="section-header__eyebrow">Your first lesson</p>
          <h3>What to Expect</h3>
        </div>
        <div className="first-lesson__copy">
          <p className="first-lesson__body">
            Your first lesson is all about getting comfortable and building
            confidence from the start.
          </p>
          <p className="first-lesson__body">
            We’ll begin by walking through the basics: how the clutch
            works, how to find the bite point, and how to move off smoothly
            without stalling. From there, you’ll quickly progress into real
            driving in low-pressure areas before gradually introducing
            traffic.
          </p>
          <p className="first-lesson__body">
            You’ll learn how to start, stop, shift gears, and handle common
            situations like hills and intersections — all at your pace.
            There’s no pressure, no rushing, and no judgment. Most students
            are surprised by how quickly it starts to click.
          </p>
          <p className="first-lesson__body">
            By the end of your first lesson, you won’t just understand
            manual — you’ll actually be driving it.
          </p>
        </div>
      </section>
    </GearSection>
  )
}
