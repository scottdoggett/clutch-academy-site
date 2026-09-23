import Image from 'next/image'
import Link from 'next/link'
import BookButton from '../BookButton'
import headshot from '../../../public/headshot.jpeg'
import './AboutTeaser.css'

// Homepage About teaser, ported from the gear-5 About section: introduce Sam,
// then route to /about for the full story (Phase 5 builds that page out).
//
// Motion (docs/spec/08-motion.md): the headshots Settle inside frames, the
// text Rises in order beside them, the stats Stagger.
export default function AboutTeaser() {
  return (
    <section className="section" id="about" aria-labelledby="about-heading">
      <div className="section__inner about">
        <div className="about__frame about__photo--desktop" data-anim="settle">
          <Image
            className="tinted-photo about__photo"
            src={headshot}
            alt="Sam Anthony, founder and lead instructor"
            sizes="(max-width: 767px) 280px, 380px"
          />
        </div>

        <div className="about__text">
          <h2 className="about__eyebrow" id="about-heading" data-anim="rise">
            Meet Your Manual Driving Instructor
          </h2>
          <h3 className="about__name" data-anim="rise" data-anim-delay="0.1">
            Samuel Anthony
          </h3>
          <p className="about__role" data-anim="rise" data-anim-delay="0.2">
            Founder · Lead Instructor
          </p>

          <div
            className="about__frame about__photo--mobile"
            data-anim="settle"
            data-anim-delay="0.2"
          >
            <Image
              className="tinted-photo about__photo"
              src={headshot}
              alt=""
              aria-hidden="true"
              sizes="280px"
            />
          </div>

          <p className="about__bio" data-anim="rise" data-anim-delay="0.3">
            Hey, I'm Sam, and I run Clutch Academy.</p>
          <p className="about__bio" data-anim="rise" data-anim-delay="0.3">
            I teach manual one step at a time, on real Toronto roads, at the pace
            you set.
          </p>
          <p className="about__bio" data-anim="rise" data-anim-delay="0.3">
            Everyone stalls while they're learning. Nobody's grading you, so we
            keep it relaxed, and most people end up having fun.
          </p>

          <dl className="about__stats" data-anim="stagger" data-anim-delay="0.4">
            <div className="about__stat">
              <dt>Lesson style</dt>
              <dd>1-on-1</dd>
            </div>
            <div className="about__stat">
              <dt>Area</dt>
              <dd>Toronto</dd>
            </div>
            <div className="about__stat">
              <dt>Response time</dt>
              <dd>&lt; 24 hr</dd>
            </div>
          </dl>

          <div className="about__actions" data-anim="rise" data-anim-delay="0.6">
            <BookButton source="about" className="btn btn--primary">
              Book a Lesson
            </BookButton>
            <Link href="/about" className="about__more">
              How Clutch Academy started →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
