// The hero's road network as a graph (docs/spec/hero-drive.md §Road graph):
// nodes where roads meet, segments between them, a lane each way along every
// segment, and the movements a car may make from one lane to the next.
//
// Pure: no DOM and no three.js, so Node's test runner can load it. Positions
// are CSS pixels in the layout's own box (the hero, or the street band under
// the CTAs), x right and y down. Headings are radians from +x, which on a
// y-down screen is clockwise. Traffic keeps right.

import { CONFIG } from './config.js'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// A node outside the layout's box is a portal: an off-screen end where
// traffic leaves and a replacement arrives.
export const isPortal = (n) => n.x < 0 || n.x > 1 || n.y < 0 || n.y > 1

// A map's road sizes: CONFIG.roads at the map's zoom (CONFIG.layout.zoom).
// Everything that measures a road, from the graph to the drawing, gets its
// sizes from here. The clearance from the headline isn't a road size, so it
// doesn't scale.
export function roadsFor(layout) {
  const k = CONFIG.layout.zoom[layout.name] ?? 1
  const r = CONFIG.roads
  const scale = (o) => Object.fromEntries(Object.entries(o).map(([key, v]) => [key, v * k]))
  return {
    zoom: k,
    main: r.main * k,
    side: r.side * k,
    tick: scale(r.tick),
    crosswalk: scale(r.crosswalk),
    clearance: r.clearance,
  }
}

// One segment per consecutive pair of nodes along each road, with an id that
// stays the same however the map is scaled or what else is hidden.
export function segmentsOf(layout) {
  const out = []
  for (const road of layout.roads) {
    for (let i = 0; i + 1 < road.nodes.length; i++) {
      out.push({
        id: `${road.id}.${i}`,
        road: road.id,
        kind: road.kind,
        a: road.nodes[i],
        b: road.nodes[i + 1],
      })
    }
  }
  return out
}

// ---------- Paths ------------------------------------------------------
// Anything a car can follow: a length, and a pose at any distance along it.
// at() fills `out` when it's given one, so the traffic loop can reuse the
// same object every step instead of allocating.

const pose = (out, x, y, a) => {
  out.x = x
  out.y = y
  out.a = a
  return out
}

function line(p, q) {
  const len = Math.hypot(q.x - p.x, q.y - p.y)
  const a = Math.atan2(q.y - p.y, q.x - p.x)
  return {
    len,
    at(s, out = {}) {
      const t = len ? clamp(s / len, 0, 1) : 0
      return pose(out, p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t, a)
    },
  }
}

// A turn: a quadratic Bézier through the corner where the two lanes' lines
// meet, walked by arc length so a car's speed along it is its real speed.
const SAMPLES = 16
function bend(p0, p1, p2) {
  const bx = (t, u) => u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x
  const by = (t, u) => u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y
  const cum = [0]
  let prev = p0
  for (let i = 1; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const q = { x: bx(t, 1 - t), y: by(t, 1 - t) }
    cum.push(cum[i - 1] + Math.hypot(q.x - prev.x, q.y - prev.y))
    prev = q
  }
  const len = cum[SAMPLES]
  return {
    len,
    at(s, out = {}) {
      s = clamp(s, 0, len)
      let i = 1
      while (i < SAMPLES && cum[i] < s) i++
      const t = (i - 1 + (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)) / SAMPLES
      const u = 1 - t
      const dx = 2 * u * (p1.x - p0.x) + 2 * t * (p2.x - p1.x)
      const dy = 2 * u * (p1.y - p0.y) + 2 * t * (p2.y - p1.y)
      return pose(out, bx(t, u), by(t, u), Math.atan2(dy, dx))
    },
  }
}

// ---------- The graph ----------------------------------------------------

const DIRS = {
  e: { x: 1, y: 0 },
  w: { x: -1, y: 0 },
  s: { x: 0, y: 1 },
  n: { x: 0, y: -1 },
}

const dirOf = (dx, dy) =>
  dy === 0 ? (dx > 0 ? 'e' : 'w') : dx === 0 ? (dy > 0 ? 's' : 'n') : null

// layout: the JSON in layouts/. width, height: the box it's drawn in, px.
// hidden: ids of segments the headline check has taken out (layout.js).
export function buildGraph(layout, { width = 1, height = 1, hidden = [], roads = roadsFor(layout) } = {}) {
  const off = new Set(hidden)
  const problems = []

  const nodes = new Map()
  for (const n of layout.nodes) {
    if (nodes.has(n.id)) problems.push(`node ${n.id} is defined twice`)
    nodes.set(n.id, {
      id: n.id,
      nx: n.x,
      ny: n.y,
      x: n.x * width,
      y: n.y * height,
      portal: isPortal(n),
      arms: {}, // direction letter → segment leaving this node that way
      in: [],
      out: [],
    })
  }

  const segments = []
  for (const s of segmentsOf(layout)) {
    const a = nodes.get(s.a)
    const b = nodes.get(s.b)
    if (!a || !b) {
      problems.push(`${s.id} names a node that doesn't exist`)
      continue
    }
    const width = roads[s.kind]
    if (!width) problems.push(`${s.id} has unknown kind "${s.kind}"`)
    const seg = { ...s, a, b, width, hidden: off.has(s.id) }
    const ab = dirOf(Math.sign(b.nx - a.nx), Math.sign(b.ny - a.ny))
    if (!ab) {
      problems.push(`${s.id} is not horizontal or vertical`)
      continue
    }
    seg.axis = ab === 'e' || ab === 'w' ? 'h' : 'v'
    segments.push(seg)
    if (seg.hidden) continue
    const ba = { e: 'w', w: 'e', n: 's', s: 'n' }[ab]
    for (const [node, d] of [
      [a, ab],
      [b, ba],
    ]) {
      if (node.arms[d]) problems.push(`${node.id} has two roads leaving ${d}: ${node.arms[d].id} and ${s.id}`)
      node.arms[d] = seg
    }
  }

  // What each node is, from the roads still meeting there, and the box a
  // car has to cross to get through it. The box is as wide as the road
  // crossing it in each direction, so a narrower road T-ing into a wider
  // one makes a box only as wide as the narrow road. Since every road is
  // one width (config.js), in practice every box is square.
  for (const n of nodes.values()) {
    const arms = Object.keys(n.arms)
    const wide = (ds) => Math.max(0, ...ds.map((d) => n.arms[d]?.width ?? 0))
    n.hx = wide(['n', 's']) / 2
    n.hy = wide(['e', 'w']) / 2
    n.size = Math.max(n.hx, n.hy) * 2 // the square drawn over the junction
    const straight = arms.length === 2 && DIRS[arms[0]].x === -DIRS[arms[1]].x && DIRS[arms[0]].y === -DIRS[arms[1]].y
    if (n.portal) n.kind = arms.length ? 'portal' : 'unused'
    else if (arms.length === 0) n.kind = 'unused'
    else if (arms.length === 1) n.kind = 'dead-end'
    else if (arms.length === 2) n.kind = straight ? 'through' : 'corner'
    else n.kind = arms.length === 3 ? 'tee' : 'cross'
    if (n.kind === 'through' && n.arms[arms[0]].width !== n.arms[arms[1]].width) {
      problems.push(`${n.id} joins a main road straight on to a side street`)
    }
    if (n.kind === 'through' || n.portal) n.hx = n.hy = 0
    n.box = { x0: n.x - n.hx, y0: n.y - n.hy, x1: n.x + n.hx, y1: n.y + n.hy }
    // Only crosses and Ts are stops. A corner or a straight run has one way
    // on, and its two lanes never cross.
    n.stop = n.kind === 'tee' || n.kind === 'cross'
  }

  // Lanes: one each way along every segment, a quarter of the road's width
  // right of its centre line, starting and ending at the junction boxes.
  const lanes = []
  const inset = (n, d) => (d.x !== 0 ? n.hx : n.hy)
  for (const seg of segments) {
    if (seg.hidden) continue
    for (const [from, to, sign] of [
      [seg.a, seg.b, '+'],
      [seg.b, seg.a, '-'],
    ]) {
      const len = Math.hypot(to.x - from.x, to.y - from.y)
      const d = { x: (to.x - from.x) / len, y: (to.y - from.y) / len }
      const right = { x: -d.y, y: d.x }
      const o = seg.width / 4
      const p0 = { x: from.x + d.x * inset(from, d) + right.x * o, y: from.y + d.y * inset(from, d) + right.y * o }
      const p1 = { x: to.x - d.x * inset(to, d) + right.x * o, y: to.y - d.y * inset(to, d) + right.y * o }
      const lane = {
        id: `${seg.id}${sign}`,
        seg,
        from,
        to,
        d,
        heading: Math.atan2(d.y, d.x),
        p0,
        p1,
        path: line(p0, p1),
        moves: [],
      }
      if ((p1.x - p0.x) * d.x + (p1.y - p0.y) * d.y <= 0) {
        problems.push(`${seg.id} is too short: its junction boxes overlap`)
      }
      lanes.push(lane)
      from.out.push(lane)
      to.in.push(lane)
    }
  }

  // Movements: from each lane into a junction, every lane out of it except
  // the way back along the same road. That exclusion is the whole of "no
  // U-turns", because no node has two roads leaving the same way.
  for (const lane of lanes) {
    if (lane.to.portal) continue
    for (const next of lane.to.out) {
      if (next.seg === lane.seg) continue
      const cross = lane.d.x * next.d.y - lane.d.y * next.d.x
      const dot = lane.d.x * next.d.x + lane.d.y * next.d.y
      let path
      if (dot > 0.5) {
        path = line(lane.p1, next.p0)
      } else {
        const corner = lane.d.x !== 0 ? { x: next.p0.x, y: lane.p1.y } : { x: lane.p1.x, y: next.p0.y }
        path = bend(lane.p1, corner, next.p0)
      }
      // Clockwise on a y-down screen is a right turn.
      const turn = dot > 0.5 ? 'straight' : cross > 0 ? 'right' : 'left'
      lane.moves.push({ to: next, turn, path })
    }
  }

  return {
    name: layout.name,
    width,
    height,
    nodes: [...nodes.values()],
    segments,
    lanes,
    entries: lanes.filter((l) => l.from.portal),
    exits: lanes.filter((l) => l.to.portal),
    problems,
  }
}

// ---------- Checks -----------------------------------------------------
// Everything the map has to be before traffic can drive it. The tests run
// these on the authored layouts; layout.js runs them before it hides a
// segment, to make sure hiding it leaves a network that still works.

export function checkGraph(graph, layout) {
  const problems = [...graph.problems]
  const live = graph.nodes.filter((n) => n.kind !== 'unused')

  for (const n of live) {
    if (n.kind === 'dead-end') problems.push(`${n.id} is a dead end`)
  }

  // Side streets cut through blocks: a road at both ends, never an edge.
  for (const road of layout.roads) {
    if (road.kind !== 'side') continue
    const ends = [road.nodes[0], road.nodes[road.nodes.length - 1]]
    for (const id of ends) {
      const n = graph.nodes.find((m) => m.id === id)
      if (n?.portal) problems.push(`side street ${road.id} runs off the edge at ${id}`)
    }
  }

  // One piece: every live node reachable from every other along live roads.
  if (live.length) {
    const seen = new Set([live[0]])
    const stack = [live[0]]
    while (stack.length) {
      const n = stack.pop()
      for (const seg of Object.values(n.arms)) {
        const m = seg.a === n ? seg.b : seg.a
        if (!seen.has(m)) {
          seen.add(m)
          stack.push(m)
        }
      }
    }
    for (const n of live) if (!seen.has(n)) problems.push(`${n.id} is cut off from the rest of the map`)
  }

  // And drivable that way, with no U-turns: from every way in, a car can
  // reach every way out. That's what "any car can reach any edge" means for
  // traffic that can't turn around.
  for (const entry of graph.entries) {
    const seen = new Set([entry])
    const queue = [entry]
    while (queue.length) {
      const lane = queue.shift()
      for (const m of lane.moves) {
        if (!seen.has(m.to)) {
          seen.add(m.to)
          queue.push(m.to)
        }
      }
    }
    const missed = graph.exits.filter((x) => !seen.has(x))
    if (missed.length) {
      problems.push(`from ${entry.id} a car can't reach ${missed.map((x) => x.id).join(', ')}`)
    }
  }

  // Every lane is on some route from a way in to a way out, so no car can be
  // born into, or turn into, a loop it can't leave.
  const reachable = new Set()
  for (const entry of graph.entries) {
    const queue = [entry]
    reachable.add(entry)
    while (queue.length) {
      for (const m of queue.shift().moves) {
        if (!reachable.has(m.to)) {
          reachable.add(m.to)
          queue.push(m.to)
        }
      }
    }
  }
  for (const lane of graph.lanes) {
    if (!reachable.has(lane)) problems.push(`no way in reaches lane ${lane.id}`)
  }
  for (const lane of graph.lanes) {
    const seen = new Set([lane])
    const queue = [lane]
    let out = lane.to.portal
    while (queue.length && !out) {
      for (const m of queue.shift().moves) {
        if (m.to.to.portal) out = true
        if (!seen.has(m.to)) {
          seen.add(m.to)
          queue.push(m.to)
        }
      }
    }
    if (!out) problems.push(`a car on lane ${lane.id} can never leave`)
  }

  return problems
}
