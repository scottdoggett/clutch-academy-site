import BookButton from '../BookButton'
import RoadLayer from '../hero/RoadLayer'
import HeroStage from '../hero/HeroStage'
import { LAYOUTS } from '../hero/layouts'
import './Hero.css'

// Homepage hero: a city seen from above behind the copy, with traffic and a
// car you can drive (docs/spec/hero-drive.md). The copy is plain HTML and
// stays readable and clickable whatever the city is doing. "See Packages" is
// a native same-page anchor to the teaser grid.
//
// Layers, bottom to top: the roads (one road layer per map, server-rendered;
// CSS shows the one that fits), the copy, then HeroStage for everything
// that moves. From 768px the copy keeps to the left half and a whole-hero
// map fills the hero: the wide one from 1200px, and below that the medium
// one, with fewer columns. Phones have no roads and no traffic, just the
// copy and its two buttons (October 14 review: the roads made it too busy).
//
// No photo since September 2026: the headline is the LCP element.
//
// Motion: the data-hero attributes are the hero timeline in src/lib/motion.js
// (docs/spec/08-motion.md §The hero).
export default function Hero() {
  return (
    <section
      className="section section--first hero"
      aria-labelledby="hero-heading"
      data-hero-root
    >
      <RoadLayer layout={LAYOUTS.wide} className="hero__roads hero__roads--wide" />
      <RoadLayer layout={LAYOUTS.medium} className="hero__roads hero__roads--medium" />
      <div className="section__inner hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow" data-hero="eyebrow">
            Toronto · Manual Transmission Lessons
          </p>
          <h1 id="hero-heading" className="hero__headline" data-hero="headline">
            Finally learn manual, without the stress
          </h1>
          <p className="hero__subhead" data-hero="sub">
            One-on-one lessons in a manual hatchback on real Toronto roads. You
            pick the time and the meeting spot when you book.
          </p>
          <div className="hero__ctas" data-hero="ctas">
            <BookButton source="hero" className="btn btn--primary">
              <span className="hero__cta-label">
                Book a <span className="hero__cta-end">Lesson</span>
              </span>
            </BookButton>
            <a className="btn btn--secondary" href="#packages">
              <span className="hero__cta-label">
                See <span className="hero__cta-end">Packages</span>
              </span>
            </a>
          </div>
        </div>
      </div>
      <HeroStage />
    </section>
  )
}
