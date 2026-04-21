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
    title: 'Meet at the lesson location',
    desc: "Show up ready to drive — we'll handle the rest.",
  },
  {
    n: 4,
    title: 'Drive, learn, leave confident',
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
          From picking a package to leaving with confidence — here&apos;s the
          full drive.
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
          <p className="section-header__eyebrow">First lesson</p>
          <h3>What to Expect</h3>
        </div>
        {/* PENDING: FIRST LESSON EXPECTATIONS */}
        <div className="first-lesson__body">
          <p>
            [Sample placeholder — the client will provide content describing
            what happens in the opening minutes of lesson one, how a typical
            multi-lesson arc progresses, and which skills are covered. Expect
            roughly three short paragraphs of warm, jargon-free copy.]
          </p>
          <ul className="first-lesson__checklist">
            <li>Clutch control and smooth engagement</li>
            <li>Starting and stopping on hills</li>
            <li>Shifting under real-road conditions</li>
            <li>Confidence in busy Toronto traffic</li>
          </ul>
        </div>
      </section>
    </GearSection>
  )
}
