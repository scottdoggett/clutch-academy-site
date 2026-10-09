/* global process -- Next replaces process.env.NODE_ENV at build time */
import BookButton from '../BookButton'
import RoadLayer from '../hero/RoadLayer'
import HeroStage from '../hero/HeroStage'
import { roadsFor } from '../hero/graph'
import { LAYOUTS } from '../hero/layouts'
import CtaLooks from './CtaLooks'
import './Hero.css'

// On phones the buttons sit inside the street band's grid, one to a block
// with a road on every side (layouts/compact.json `ctas`). Hero.css places
// them from these, so the map stays the one place the numbers live.
const { band, ctas } = LAYOUTS.compact
const PHONE_GRID = {
  '--hero-band': `${band}px`,
  '--ctas-x0': ctas.x0,
  '--ctas-x1': ctas.x1,
  '--ctas-y0': ctas.y0,
  '--ctas-y1': ctas.y1,
  '--ctas-road': `${roadsFor(LAYOUTS.compact).main}px`,
}

// Homepage hero: a city seen from above behind the copy, with traffic and a
// car you can drive (docs/spec/hero-drive.md). The copy is plain HTML and
// stays readable and clickable whatever the city is doing. "See Packages" is
// a native same-page anchor to the teaser grid.
//
// Layers, bottom to top: the roads (one road layer per map, server-rendered;
// CSS shows the one that fits), the copy, then HeroStage for everything
// that moves. From 768px the copy keeps to the left half and a whole-hero
// map fills the hero: the wide one from 1200px, and below that the medium
// one, with fewer columns. On phones the roads get their own band under the
// subhead, with the two buttons inside it.
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
      style={PHONE_GRID}
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
      <div className="hero__streets" aria-hidden="true">
        <RoadLayer layout={LAYOUTS.compact} className="hero__roads" />
      </div>
      <HeroStage />
      {/* Development only: the button looks on trial, October 2026. */}
      {process.env.NODE_ENV === 'development' && <CtaLooks />}
    </section>
  )
}
