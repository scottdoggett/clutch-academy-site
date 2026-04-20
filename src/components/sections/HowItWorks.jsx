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
      <h2>How It Works</h2>
      <ol className="steps">
        {STEPS.map((s) => (
          <li key={s.n} className="steps__item">
            <span className="steps__num" aria-hidden="true">
              {String(s.n).padStart(2, '0')}
            </span>
            <h3 className="steps__title">{s.title}</h3>
            <p className="steps__desc">{s.desc}</p>
          </li>
        ))}
      </ol>

      <div className="first-lesson">
        <h3>What to Expect in Your First Lesson</h3>
        {/* PENDING: FIRST LESSON EXPECTATIONS (client to provide — what happens at start of lesson 1, typical progression across lessons, skills covered) */}
        <p>
          [First-lesson expectations placeholder — client to provide content covering
          what happens at the start of lesson 1, typical multi-lesson progression, and
          the skills covered.]
        </p>
      </div>
    </GearSection>
  )
}
