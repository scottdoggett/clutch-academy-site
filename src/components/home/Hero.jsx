import Image from 'next/image'
import BookButton from '../BookButton'
import heroPhoto from '../../../public/hero-section.jpeg'
import './Hero.css'

// Homepage hero, ported from the gear-1 Home section: same copy and layout,
// minus the pinning, scroll-hint microcopy, and GSAP scroll handoff. "See
// Packages" is now a native same-page anchor to the teaser grid.
//
// Motion: the data-hero attributes are the hero timeline in src/lib/motion.js
// (docs/spec/08-motion.md §The hero). The photo sits in a frame so its settle
// scale is clipped and the box never changes size.
export default function Hero() {
  return (
    <section
      className="section section--first hero"
      aria-labelledby="hero-heading"
      data-hero-root
    >
      <div className="section__inner hero__grid">
        <div className="hero__copy">
          <p className="hero__eyebrow" data-hero="eyebrow">Toronto · Manual Transmission Lessons</p>
          <h1 id="hero-heading" className="hero__headline" data-hero="headline">
            Learn to drive manual without the stress.
          </h1>
          <p className="hero__subhead" data-hero="sub">
            One-on-one lessons in a manual hatchback on real Toronto roads. You
            pick the time and the meeting spot when you book.
          </p>
          <div className="hero__ctas" data-hero="ctas">
            <BookButton source="hero" className="btn btn--primary">
              Book a Lesson
            </BookButton>
            <a className="btn btn--secondary" href="#packages">
              See Packages
            </a>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__frame" data-hero="photo">
            <Image
              className="hero__photo"
              src={heroPhoto}
              alt="Clutch Academy instructor with the training car"
              priority
              sizes="(max-width: 1023px) 90vw, 45vw"
            />
          </div>
          <div className="hero__caption" data-hero="caption">
            We start on quiet streets and work up to real traffic.
          </div>
        </div>
      </div>
    </section>
  )
}
