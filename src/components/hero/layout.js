// The layouts in layouts/ turned into something to draw and something to
// check: the road layer's pieces, and the headline clearance rule
// (docs/spec/hero-drive.md §Keeping clear of the headline).
//
// Pure, like graph.js. The layout JSON is passed in rather than imported, so
// Node's test runner and the Next bundler both load this file the same way.

import { CONFIG } from './config.js'
import { buildGraph, checkGraph, roadsFor } from './graph.js'

// ---------- Clearance --------------------------------------------------

// The strip of the box a segment's road covers, px, including the half
// width past each end that its junction squares cover.
export function segmentBand(seg) {
  const h = seg.width / 2
  return {
    x0: Math.min(seg.a.x, seg.b.x) - h,
    y0: Math.min(seg.a.y, seg.b.y) - h,
    x1: Math.max(seg.a.x, seg.b.x) + h,
    y1: Math.max(seg.a.y, seg.b.y) + h,
  }
}

// Live segments whose road comes closer than `clearance` px to `rect`, the
// headline block in the same box. Exactly `clearance` away is fine.
export function offenders(graph, rect, clearance = CONFIG.roads.clearance) {
  return graph.segments.filter((seg) => {
    if (seg.hidden) return false
    const b = segmentBand(seg)
    return (
      b.x0 < rect.x1 + clearance &&
      b.x1 > rect.x0 - clearance &&
      b.y0 < rect.y1 + clearance &&
      b.y1 > rect.y0 - clearance
    )
  })
}

// The runtime rule: any segment too close to the headline is hidden, one at
// a time and in id order, but only if the map still passes every check in
// checkGraph() without it. Anything that can't go stays, and is reported.
//
// wide.json keeps every junction off the headline's envelope, so a segment
// that crosses it runs from junction to junction and hiding it never strands
// a stub. At the sizes the tests require, nothing is hidden at all.
export function resolveClearance(layout, { width, height, copy, clearance = CONFIG.roads.clearance }) {
  const full = buildGraph(layout, { width, height })
  const bad = offenders(full, copy, clearance)
    .map((s) => s.id)
    .sort()
  let hidden = []
  const blocked = []
  for (const id of bad) {
    const trial = [...hidden, id]
    const problems = checkGraph(buildGraph(layout, { width, height, hidden: trial }), layout)
    if (problems.length) blocked.push(id)
    else hidden = trial
  }
  const graph = hidden.length ? buildGraph(layout, { width, height, hidden }) : full
  return { hidden, blocked, graph }
}

// ---------- Drawing ------------------------------------------------------
// The road layer (RoadLayer.jsx) is plain positioned elements, each placed at
// a fraction of its box plus a pixel offset, e.g. left: calc(59.5% - 20px).
// That keeps road widths, ticks and crossings in exact CSS px at any size,
// with no JavaScript. A stretched SVG can't do that: it can't put a crossing
// "3px clear of this junction, the width of the road", and it can't end a
// road's ticks cleanly at the junction box.
//
// Every piece has x, y, w and h, each [fraction, px]: left is x[0] of the
// box's width plus x[1] px, top is y[0] of its height plus y[1] px, and so on.

const JUNCTION = new Set(['cross', 'tee', 'corner'])

export function roadPieces(layout, roads = roadsFor(layout)) {
  // At 1×1, node positions come out as fractions of the box, while junction
  // boxes, which are made of road widths, are still px.
  const graph = buildGraph(layout, { roads })
  const bands = []
  const boxes = []
  const ticks = []
  const walks = []
  const { gap: G, depth: D } = roads.crosswalk
  const t = roads.tick.width

  // How far a road's centre ticks stop short of node n along `axis`: the
  // junction box, plus the crossing in front of it at a cross or a T.
  const clear = (n, axis) =>
    (JUNCTION.has(n.kind) ? (axis === 'h' ? n.hx : n.hy) : 0) + (n.stop ? G + D : 0)

  for (const seg of graph.segments) {
    const h = seg.axis === 'h'
    const [a, b] = (h ? seg.a.nx < seg.b.nx : seg.a.ny < seg.b.ny) ? [seg.a, seg.b] : [seg.b, seg.a]
    const half = seg.width / 2
    const s0 = clear(a, seg.axis)
    const s1 = clear(b, seg.axis)
    if (h) {
      bands.push({ kind: 'band', seg: seg.id, x: [a.nx, 0], y: [a.ny, -half], w: [b.nx - a.nx, 0], h: [0, seg.width] })
      ticks.push({ kind: 'tick', axis: 'h', seg: seg.id, x: [a.nx, s0], y: [a.ny, -t / 2], w: [b.nx - a.nx, -s0 - s1], h: [0, t] })
    } else {
      bands.push({ kind: 'band', seg: seg.id, x: [a.nx, -half], y: [a.ny, 0], w: [0, seg.width], h: [b.ny - a.ny, 0] })
      ticks.push({ kind: 'tick', axis: 'v', seg: seg.id, x: [a.nx, -t / 2], y: [a.ny, s0], w: [0, t], h: [b.ny - a.ny, -s0 - s1] })
    }
  }

  // The junction box, white. Mostly it sits on road that's already white;
  // at a corner it fills the outside of the bend.
  for (const n of graph.nodes) {
    if (!JUNCTION.has(n.kind)) continue
    boxes.push({ kind: 'box', node: n.id, x: [n.nx, -n.hx], y: [n.ny, -n.hy], w: [0, 2 * n.hx], h: [0, 2 * n.hy] })
  }

  // Zebra crossings: on every road into a cross or a T, the full width of the
  // road, just clear of the box. The stripes run the way the road does.
  // Corners and straight runs have none, since traffic doesn't stop there.
  for (const n of graph.nodes) {
    if (!n.stop) continue
    for (const [dir, seg] of Object.entries(n.arms)) {
      const half = seg.width / 2
      let at
      if (dir === 'w') at = { x: [n.nx, -n.hx - G - D], y: [n.ny, -half], w: [0, D], h: [0, seg.width] }
      else if (dir === 'e') at = { x: [n.nx, n.hx + G], y: [n.ny, -half], w: [0, D], h: [0, seg.width] }
      else if (dir === 'n') at = { x: [n.nx, -half], y: [n.ny, -n.hy - G - D], w: [0, seg.width], h: [0, D] }
      else at = { x: [n.nx, -half], y: [n.ny, n.hy + G], w: [0, seg.width], h: [0, D] }
      walks.push({ kind: 'walk', axis: seg.axis, seg: seg.id, node: n.id, ...at })
    }
  }

  return { bands, boxes, ticks, walks }
}

// A piece's box in px, in a layout box of width × height.
export function pieceRect(p, width, height) {
  const x = p.x[0] * width + p.x[1]
  const y = p.y[0] * height + p.y[1]
  return { x0: x, y0: y, x1: x + p.w[0] * width + p.w[1], y1: y + p.h[0] * height + p.h[1] }
}

// Which pieces come off once the headline check has hidden some segments:
// the hidden segments' roads, ticks and crossings; a junction box left on a
// straight run or on nothing; and a crossing at a node that's no longer a
// stop, like a T that's lost its stem.
export function hideRule(graph) {
  const segs = new Set(graph.segments.filter((s) => s.hidden).map((s) => s.id))
  const noBox = new Set(graph.nodes.filter((n) => n.kind === 'through' || n.kind === 'unused').map((n) => n.id))
  const noStop = new Set(graph.nodes.filter((n) => !n.stop).map((n) => n.id))
  return ({ kind, seg, node }) =>
    kind === 'box' ? noBox.has(node) : kind === 'walk' ? segs.has(seg) || noStop.has(node) : segs.has(seg)
}
