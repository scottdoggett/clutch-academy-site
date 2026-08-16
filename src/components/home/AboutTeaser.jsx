import Image from 'next/image'
import Link from 'next/link'
import BookButton from '../BookButton'
import headshot from '../../../public/headshot.jpeg'
import './AboutTeaser.css'

// Homepage About teaser, ported from the gear-5 About section: introduce Sam,
// then route to /about for the full story (Phase 5 builds that page out).
export default function AboutTeaser() {
  return (
    <section className="section" id="about" aria-labelledby="about-heading">
      <div className="section__inner about">
        <Image
          className="tinted-photo about__photo about__photo--desktop"
          src={headshot}
          alt="Sam Anthony, founder and lead instructor"
          sizes="(max-width: 767px) 280px, 380px"
        />

        <div className="about__text">
          <h2 className="about__eyebrow" id="about-heading">
            Meet Your Manual Driving Instructor
          </h2>
          <h3 className="about__name">Samuel Anthony</h3>
          <p className="about__role">Founder · Lead Instructor</p>

          <Image
            className="tinted-photo about__photo about__photo--mobile"
            src={headshot}
            alt=""
            aria-hidden="true"
            sizes="280px"
          />

          <p className="about__bio">Hey, I’m Sam — I run Clutch Academy.</p>
          <p className="about__bio">
            I’ll teach you manual step by step, at your pace, on real Toronto
            roads.
          </p>
          <p className="about__bio">
            We’ll take the pressure off, just build your confidence and have
            fun doing it.
          </p>

          <dl className="about__stats">
            <div className="about__stat">
              <dt>Lesson style</dt>
              <dd>1-on-1</dd>
            </div>
            <div className="about__stat">
              <dt>Territory</dt>
              <dd>Toronto</dd>
            </div>
            <div className="about__stat">
              <dt>Response time</dt>
              <dd>&lt; 24 hr</dd>
            </div>
          </dl>

          <div className="about__actions">
            <BookButton source="about" className="btn btn--primary">
              Book a Lesson
            </BookButton>
            <Link href="/about" className="about__more">
              More about the story behind Clutch Academy →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
