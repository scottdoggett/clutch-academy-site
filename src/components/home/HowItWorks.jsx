import './HowItWorks.css'

const STEPS = [
  {
    n: 1,
    title: 'Pick a package',
    desc: 'One lesson, a pack of three or five, or a group lesson with a friend.',
  },
  {
    n: 2,
    title: 'Book a time',
    desc: 'Choose a time and a meeting spot on Calendly, and pay by card.',
  },
  {
    n: 3,
    title: 'Show up',
    desc: 'Bring your G2 or G license and wear thin-soled shoes. We bring the car.',
  },
  {
    n: 4,
    title: 'Drive it yourself',
    desc: 'Sam sits beside you and coaches at whatever pace you need.',
  },
]

export default function HowItWorks() {
  return (
    <section
      className="section"
      id="how-it-works"
      aria-labelledby="how-heading"
    >
      <div className="section__inner">
        <div className="how-it-works__top">
          <header className="section-header how-it-works__header">
            <p className="section-header__eyebrow">The Process</p>
            <h2 id="how-heading">How It Works</h2>
            <p className="section-header__lead">
              Four steps, and you only have to think about the first two.
            </p>
          </header>

          <section className="first-lesson" aria-labelledby="first-lesson-heading">
            <div className="first-lesson__heading">
              <p className="section-header__eyebrow">Your first lesson</p>
              <h3 id="first-lesson-heading">What to Expect</h3>
            </div>
            <ul className="first-lesson__copy">
              <li className="first-lesson__body">
                We start somewhere quiet, so you get a feel for the clutch before
                there's traffic around you.
              </li>
              <li className="first-lesson__body">
                You find the bite point and practise pulling away until it stops
                feeling like a guess.
              </li>
              <li className="first-lesson__body">
                Then stopping, shifting and hill starts, at whatever speed suits
                you.
              </li>
              <li className="first-lesson__body">
                By the end of the lesson you're changing gears on your own.
              </li>
            </ul>
          </section>
        </div>

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
      </div>
    </section>
  )
}
