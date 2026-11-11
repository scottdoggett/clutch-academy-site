import { Overpass } from 'next/font/google'
import './WhySigns.css'

// "Why Students Choose Clutch Academy" as a street of five road signs, and
// the About page's opening band, so its heading is the page's h1. From
// 1024px they stand in one row, every post running down to the bottom of the
// band and each sign at its own height, with its words in the open space
// above it. Below that, each sign sits beside its words in a single list.
//
// The signs are drawn to Ontario's conventions (white regulatory, yellow
// warning, blue service, the red prohibition ring) and lettered in Overpass,
// the open-source descendant of the Highway Gothic faces on North American
// road signs. Every legend has a fixed textLength, so the fallback face
// while Overpass loads can't change a sign's size.
//
// Each sign is drawn in one shared 200-wide space with its post on x 100,
// and `box` crops the SVG to the sign alone. The post is CSS (WhySigns.css),
// so it can run to any length: `post` is how much of it shows below the sign
// on the street, in CSS pixels.
//
// Decorative: each SVG is aria-hidden, and its words say the same thing.
//
// No motion since November 2026. The heading took the section-h2 Headline
// and the signs a Stagger while this band sat below the story. As the first
// band they're above the fold, where a scroll reveal hides what's already
// painted, and the h1 is an LCP candidate a mask would clip
// (docs/spec/08-motion.md, §Headline and §The hero).
//
// Sam reviewed the signs on November 5, 2026: he reworded At your pace's and
// Book at any hour's lines, retitled Real Toronto roads as Various driving
// scenarios, and cut Just you and Sam (no instructor's name outside the
// story). PENDING: "Manual is all we teach" and "Stalls expected", titles
// and lines, which his notes didn't mention. PENDING too: the no-parking
// sign was drawn for "Real Toronto roads, not an empty parking lot" and
// doesn't match its new title.

const signFace = Overpass({
  subsets: ['latin'],
  weight: '800',
  variable: '--font-sign',
  display: 'swap',
})

// Where the sign is bolted to its post.
function Bolts({ top, bottom }) {
  return (
    <>
      <circle className="why-sign__bolt" cx="100" cy={top} r="2.4" />
      <circle className="why-sign__bolt" cx="100" cy={bottom} r="2.4" />
    </>
  )
}

// A line of sign lettering, centred on x and stretched or squeezed to
// exactly `width`.
function Legend({ x = 100, y, size, width, tone = 'black', children }) {
  return (
    <text
      className={`why-sign__legend why-sign__legend--${tone}`}
      x={x}
      y={y}
      fontSize={size}
      textAnchor="middle"
      textLength={width}
      lengthAdjust="spacingAndGlyphs"
    >
      {children}
    </text>
  )
}

// Left to right along the street. The post lengths are all different, and
// they alternate tall and short (odd signs tall, which WhySigns.css relies
// on) so no two neighbours' words sit at the same height. Re-balanced for
// five on November 5, 2026.
const SIGNS = [
  {
    key: 'manual-only',
    title: 'Manual is all we teach',
    line: 'Hundreds of lessons taught. Every driver started where you are.',
    box: [41, 7, 118, 152],
    post: 150,
    // A reserved-lane sign (the "BUSES ONLY" kind). Its pictogram is the
    // hub chooser's gear-lever bullet, scaled up: knob, shaft and gate. A
    // shift pattern was drawn first and read as the letters HH.
    sign: (
      <>
        <rect className="why-sign__white" x="42" y="8" width="116" height="150" rx="9" />
        <rect className="why-sign__border" x="48" y="14" width="104" height="138" rx="6" />
        <g className="why-sign__pictogram">
          <path d="M100 36v18M83 54h34M83 54v14M117 54v14" />
          <circle cx="100" cy="31" r="8" />
        </g>
        <Legend y={104} size={23} width={86}>MANUAL</Legend>
        <Legend y={136} size={28} width={66}>ONLY</Legend>
        <Bolts top={11} bottom={155} />
      </>
    ),
  },
  {
    key: 'your-pace',
    title: 'At your pace',
    line: 'We’ll never push you past your comfort level.',
    box: [45, 7, 110, 148],
    post: 60,
    // Ontario's MAXIMUM speed sign, with the limit set by you.
    sign: (
      <>
        <rect className="why-sign__white" x="46" y="8" width="108" height="146" rx="9" />
        <rect className="why-sign__border" x="52" y="14" width="96" height="134" rx="6" />
        <Legend y={40} size={15} width={70}>MAXIMUM</Legend>
        <Legend y={88} size={36} width={78}>YOUR</Legend>
        <Legend y={130} size={36} width={78}>PACE</Legend>
        <Bolts top={11} bottom={151} />
      </>
    ),
  },
  {
    key: 'stalls-ahead',
    title: 'Stalls expected',
    line: 'Stall it thirty times. Nobody is counting.',
    box: [24, 4, 152, 152],
    post: 230,
    // A yellow warning diamond. The thick yellow stroke with round joins is
    // what rounds its corners.
    sign: (
      <>
        <polygon className="why-sign__yellow" points="100,10 170,80 100,150 30,80" />
        <polygon className="why-sign__border" points="100,19 161,80 100,141 39,80" />
        <Legend y={78} size={21} width={76}>STALLS</Legend>
        <Legend y={102} size={21} width={70}>AHEAD</Legend>
        <Bolts top={30} bottom={130} />
      </>
    ),
  },
  {
    key: 'no-parking',
    title: 'Various driving scenarios',
    line: 'Hills, downshifting, rev-matching.',
    box: [43, 9, 114, 126],
    post: 90,
    // No parking: the one sign here in the brand's own red.
    sign: (
      <>
        <rect className="why-sign__white" x="44" y="10" width="112" height="124" rx="9" />
        <rect className="why-sign__border" x="50" y="16" width="100" height="112" rx="6" />
        <Legend y={95} size={58} width={36}>P</Legend>
        <circle className="why-sign__ring" cx="100" cy="72" r="38" />
        <path className="why-sign__ring" d="M73 45L127 99" />
        <Bolts top={13} bottom={131} />
      </>
    ),
  },
  {
    key: 'book-online',
    title: 'Book at any hour',
    line: 'Book and pay online whenever you decide.',
    box: [33, 13, 134, 120],
    post: 185,
    // A blue service sign, with a booked day as its pictogram.
    sign: (
      <>
        <rect className="why-sign__blue" x="34" y="14" width="132" height="118" rx="9" />
        <rect className="why-sign__border why-sign__border--white" x="40" y="20" width="120" height="106" rx="6" />
        <g className="why-sign__pictogram why-sign__pictogram--white">
          <rect x="84" y="33" width="32" height="28" rx="3" />
          <path d="M84 41h32M92 28v8M108 28v8M93 51l5 5l9-9" />
        </g>
        <Legend y={89} size={16} width={100} tone="white">BOOK ONLINE</Legend>
        <Legend y={115} size={21} width={66} tone="white">24 HRS</Legend>
        <Bolts top={17} bottom={129} />
      </>
    ),
  },
]

export default function WhySigns() {
  return (
    <section
      className={`section section--first about-why ${signFace.variable}`}
      aria-labelledby="why-choose-heading"
    >
      <div className="section__inner">
        <header className="section-header section-header--center">
          <p className="section-header__eyebrow">
            Five signs you’re in the right place
          </p>
          <h1 id="why-choose-heading">Why Students Choose Clutch Academy</h1>
        </header>

        <ul className="why-signs">
          {SIGNS.map(({ key, title, line, box, post, sign }) => (
            <li
              key={key}
              className="why-signs__item"
              style={{ '--w': box[2], '--h': box[3], '--post': post }}
            >
              <div className="why-signs__text">
                <h3 className="why-signs__title">{title}</h3>
                <p className="why-signs__line">{line}</p>
              </div>
              <div className="why-signs__mount">
                <svg
                  className="why-signs__sign"
                  viewBox={box.join(' ')}
                  aria-hidden="true"
                  focusable="false"
                >
                  {sign}
                </svg>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
