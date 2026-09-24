import { roadsFor } from './graph.js'
import { roadPieces } from './layout.js'
import './RoadLayer.css'

// One layout's roads, rendered on the server as positioned elements, so the
// city is there at first paint with no JavaScript (docs/spec/hero-drive.md
// §Drawing the roads). Each piece sits at a fraction of the box plus a px
// offset (RoadLayer.css), so roads, ticks and crossings are exact at any
// size and CSS rescales them for free.
//
// Paint order: white roads, white junction boxes, black centre ticks, black
// zebra crossings.
//
// data-piece, data-seg and data-node are what HeroStage uses to hide a
// segment the headline check has taken out.

// Enough precision for a sub-pixel position on a 2560px screen, and no more.
const num = (v) => Math.round(v * 1e5) / 1e5

// Only the non-zero terms: RoadLayer.css defaults the rest to 0. Every
// piece's position is in the page twice, once in the HTML and once in the
// hydration payload, so the zeros are worth leaving out.
const place = ({ x, y, w, h }) => {
  const style = {}
  const terms = { '--x': x[0], '--dx': x[1], '--y': y[0], '--dy': y[1], '--w': w[0], '--dw': w[1], '--h': h[0], '--dh': h[1] }
  for (const [k, v] of Object.entries(terms)) if (num(v) !== 0) style[k] = num(v)
  return style
}

export default function RoadLayer({ layout, className }) {
  // The map's own road sizes, zoomed out on phones (CONFIG.layout.zoom).
  const roads = roadsFor(layout)
  const { bands, boxes, ticks, walks } = roadPieces(layout, roads)
  const { tick, crosswalk } = roads
  return (
    <div
      className={`roads ${className ?? ''}`}
      aria-hidden="true"
      data-layout={layout.name}
      style={{
        '--tick-len': `${tick.length}px`,
        '--tick-gap': `${tick.gap}px`,
        '--stripe': `${crosswalk.stripe}px`,
        '--stripe-space': `${crosswalk.space}px`,
      }}
    >
      {bands.map((p) => (
        <span key={`b${p.seg}`} className="roads__band" data-piece="band" data-seg={p.seg} style={place(p)} />
      ))}
      {boxes.map((p) => (
        <span key={`x${p.node}`} className="roads__box" data-piece="box" data-node={p.node} style={place(p)} />
      ))}
      {ticks.map((p) => (
        <span
          key={`t${p.seg}`}
          className={`roads__tick roads__tick--${p.axis}`}
          data-piece="tick"
          data-seg={p.seg}
          style={place(p)}
        />
      ))}
      {walks.map((p) => (
        <span
          key={`w${p.seg}${p.node}`}
          className={`roads__walk roads__walk--${p.axis}`}
          data-piece="walk"
          data-seg={p.seg}
          data-node={p.node}
          style={place(p)}
        />
      ))}
    </div>
  )
}
