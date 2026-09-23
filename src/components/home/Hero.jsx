import Image from 'next/image'
import BookButton from '../BookButton'
import heroPhoto from '../../../public/hero-section.jpeg'
import './Hero.css'

// Homepage hero, ported from the gear-1 Home section: same copy and layout,
// minus the pinning, scroll-hint microcopy, and GSAP scroll handoff. "See
// Packages" is now a native same-page anchor to the teaser grid.
export default function Hero() {
  return (
    <section
      className="section section--first hero"
      aria-labelledby="hero-heading"
    >
      <div className="section__inner hero__grid">
        <div className="hero__copy">
          <p className="hero__eyebrow">Toronto · Manual Transmission Lessons</p>
          <h1 id="hero-heading" className="hero__headline">
            Learn to drive manual without the stress.
          </h1>
          <p className="hero__subhead">
            One-on-one lessons in a manual hatchback on real Toronto roads. You
            pick the time and the meeting spot when you book.
          </p>
          <div className="hero__ctas">
            <BookButton source="hero" className="btn btn--primary">
              Book a Lesson
            </BookButton>
            <a className="btn btn--secondary" href="#packages">
              See Packages
            </a>
          </div>
        </div>

        <div className="hero__visual">
          <Image
            className="hero__photo"
            src={heroPhoto}
            alt="Clutch Academy instructor with the training car"
            priority
            sizes="(max-width: 1023px) 90vw, 45vw"
          />
          <div className="hero__caption">
            We start on quiet streets and work up to real traffic.
          </div>
        </div>
      </div>
    </section>
  )
}
