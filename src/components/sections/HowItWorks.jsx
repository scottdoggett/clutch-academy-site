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
        {/* PENDING: FIRST LESSON EXPECTATIONS */}
        <p className="first-lesson__body">
          [Sample placeholder — the client will provide warm, jargon-free copy
          describing what happens in lesson one, how the arc progresses, and
          which skills are covered: clutch control, hill starts, shifting
          under real-road conditions.]
        </p>
      </section>
    </GearSection>
  )
}
