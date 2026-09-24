// Ambient traffic (docs/spec/hero-drive.md §Ambient traffic): cars that
// follow their lanes, keep their distance, stop just behind each zebra
// crossing, take every cross and T one at a time, and leave by the edges to
// come back in somewhere else.
//
// Pure, like graph.js: no DOM and no three.js, so the headless test runs it
// in Node. Positions are CSS px in the layout's box, x right and y down. The
// config's SI values are converted once, at pxPerM times the map's zoom, so
// phone cars are 0.6 size and cover 0.6 as many px a second.
//
// A car is its nose on a piece of road, either a lane or a movement through
// a junction, at distance s along it, and its body takes up the car length
// behind that along the same route. Both axles sit on the path, so through
// a turn the body lies on the line between them and cuts the corner a
// little, the way a real car does.

import { CONFIG } from '../config.js'
import { roadsFor } from '../graph.js'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

const isLane = (piece) => piece.seg !== undefined

// A small seeded generator, so every visitor sees the same start and the
// same turns, and a test run can be repeated exactly.
export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// How many cars a map gets: one per pxPerCar of its box, within limits.
export function carCount(layout, width, height, t = CONFIG.traffic) {
  const min = layout.name === 'compact' ? t.compactMin : t.min
  return clamp(Math.round((width * height) / t.pxPerCar), min, t.max)
}

// The car and the rules of the road in px and seconds, for one map.
export function unitsFor(layout) {
  const roads = roadsFor(layout)
  const k = CONFIG.world.pxPerM * roads.zoom
  const t = CONFIG.traffic
  const kmh = (v) => (v / 3.6) * k
  const length = CONFIG.car.length * k
  const s0 = t.stopGap * k
  const margin = t.boxClear * k
  return {
    pxPerM: k,
    length,
    width: CONFIG.car.width * k,
    wheelbase: CONFIG.car.wheelbase * k,
    cruise: t.cruiseKmh.map(kmh),
    turn: kmh(t.turnKmh),
    accel: t.accel * k,
    decel: t.decel * k,
    maxDecel: t.maxDecel * k,
    headway: t.headway,
    s0,
    // The closest a car's nose ever gets to the car ahead, whatever the
    // following model says.
    touch: s0 / 4,
    margin,
    need: length + margin,
    // How far short of a junction box a car stops: the zebra crossing, and
    // a pixel more.
    back: roads.crosswalk.gap + roads.crosswalk.depth + t.lineGap * roads.zoom,
    horizon: t.lookahead * k,
  }
}

// Do two cars overlap? Each is a length × width rectangle centred on its
// (x, y) and turned to its heading a. padLong and padSide are the clearance
// to insist on, along and across each car.
export function overlap(p, q, length, width, padLong = 0, padSide = 0) {
  const hl = (length + padLong) / 2
  const hw = (width + padSide) / 2
  const dx = q.x - p.x
  const dy = q.y - p.y
  const reach = 2 * Math.hypot(hl, hw)
  if (dx * dx + dy * dy >= reach * reach) return false
  // Separating axes: each rectangle's two edge directions.
  const cp = Math.cos(p.a)
  const sp = Math.sin(p.a)
  const cq = Math.cos(q.a)
  const sq = Math.sin(q.a)
  const axes = [
    [cp, sp],
    [-sp, cp],
    [cq, sq],
    [-sq, cq],
  ]
  for (const [ax, ay] of axes) {
    const rp = hl * Math.abs(cp * ax + sp * ay) + hw * Math.abs(-sp * ax + cp * ay)
    const rq = hl * Math.abs(cq * ax + sq * ay) + hw * Math.abs(-sq * ax + cq * ay)
    if (Math.abs(dx * ax + dy * ay) >= rp + rq) return false
  }
  return true
}

// Does a car's body touch an axis-aligned box (a junction), with `pad` of
// clearance? The same separating-axis test.
export function touchesBox(p, box, length, width, pad = 0) {
  const hl = length / 2
  const hw = width / 2
  const bx = (box.x1 - box.x0) / 2 + pad
  const by = (box.y1 - box.y0) / 2 + pad
  const dx = box.x0 + (box.x1 - box.x0) / 2 - p.x
  const dy = box.y0 + (box.y1 - box.y0) / 2 - p.y
  const c = Math.cos(p.a)
  const s = Math.sin(p.a)
  for (const [ax, ay] of [
    [1, 0],
    [0, 1],
    [c, s],
    [-s, c],
  ]) {
    const rc = hl * Math.abs(c * ax + s * ay) + hw * Math.abs(-s * ax + c * ay)
    const rb = bx * Math.abs(ax) + by * Math.abs(ay)
    if (Math.abs(dx * ax + dy * ay) >= rc + rb) return false
  }
  return true
}

// graph: from buildGraph(), with any hidden segments already taken out.
// count: how many cars (carCount()). The first car is the black one, which
// drives as ordinary traffic until Phase 4 lets a visitor take it over.
export function createTraffic(graph, layout, { count, seed = CONFIG.world.seed } = {}) {
  const u = unitsFor(layout)
  const t = CONFIG.traffic
  const rand = mulberry32(seed)
  const pick = (list) => list[Math.floor(rand() * list.length)]

  // Per graph, rebuilt when the map is rescaled.
  let g = null
  let stopAt = new Map() // lane → where a car's nose stops for the junction at its end
  let occ = new Map() // piece → spans of the car bodies on it, this step
  let junctions = new Map() // stop node → { node, holder, queue }
  let fromOf = new Map() // movement → the lane it leaves

  const cars = []
  let target = count
  let time = 0
  // Cars off the lanes, as { x, y, a } px poses: the one a visitor is
  // driving, and one finding its way back. Traffic stops for them (below).
  let bodies = []

  // ---------- The map ---------------------------------------------------

  // Where a car stops for a cross or a T: its nose just behind the zebra
  // crossing. On a block too short to hold a car there without its tail
  // in the junction behind, it pulls up onto the crossing instead.
  function stopPoint(lane) {
    const len = lane.path.len
    const at = len - u.back
    return at >= u.need ? at : Math.min(len - 1e-3, u.need)
  }

  // The room a car needs on `lane` before it may enter the junction behind
  // it: enough to stop with its tail boxClear past the box. A block too
  // short for that (a 1280×600 window, either side of the wide map's side
  // street) needs only as far as its stop point, which still clears the
  // box. Asking for more there left a car waiting for good. It never asks
  // for less than the whole car: a lane shorter than that is one the
  // runtime rules in layout.js should have hidden, and a car let into it
  // would hold the box behind it for good.
  const needOn = (lane) =>
    Math.max(u.length + 1e-3, lane.to.stop ? Math.min(u.need, stopAt.get(lane)) : u.need)

  function index(next) {
    g = next
    stopAt = new Map()
    occ = new Map()
    junctions = new Map()
    fromOf = new Map()
    for (const lane of g.lanes) {
      occ.set(lane, [])
      if (lane.to.stop) stopAt.set(lane, stopPoint(lane))
      for (const m of lane.moves) {
        occ.set(m, [])
        fromOf.set(m, lane)
      }
    }
    for (const n of g.nodes) if (n.stop) junctions.set(n, { node: n, holder: null, queue: [] })
  }

  // ---------- Cars ------------------------------------------------------

  function makeCar(id) {
    const car = {
      id,
      black: id === 0,
      active: false, // on the map
      pending: false, // waiting to come back in at an edge
      piece: null,
      s: 0,
      v: 0,
      cruise: 0,
      trail: [], // the pieces behind the front one, nearest first
      route: [], // the pieces ahead, chosen as they're needed
      holds: null, // the junction whose box this car has
      driven: false, // off the lanes, under a visitor's control or finding its way back
      queued: false,
      dwell: 0,
      waited: 0,
      x: 0,
      y: 0,
      a: 0,
      spans: [],
    }
    for (let i = 0; i < 3; i++) car.spans.push({ car, lo: 0, hi: 0 })
    return car
  }

  function seat(car, lane, s) {
    car.piece = lane
    car.s = s
    car.v = 0
    car.cruise = u.cruise[0] + rand() * (u.cruise[1] - u.cruise[0])
    car.trail.length = 0
    car.route.length = 0
    car.holds = null
    car.queued = false
    car.dwell = 0
    car.waited = 0
    car.active = true
    car.pending = false
    car.driven = false
    pose(car)
  }

  const live = () => cars.reduce((n, c) => n + (c.active || c.pending ? 1 : 0), 0)

  // Off the map, and back in later unless there are too many cars.
  function drop(car) {
    if (car.holds) junctions.get(car.holds).holder = null
    if (car.queued) {
      const q = junctions.get(car.piece.to).queue
      q.splice(q.indexOf(car), 1)
    }
    car.holds = null
    car.queued = false
    car.active = false
    car.pending = live() < target
  }

  // Which way next at the end of a lane: any valid exit, at random. The
  // black car keeps to exits that stay on screen when it can, so it's
  // almost always in view.
  function choose(car, lane) {
    let moves = lane.moves
    if (car.black) {
      const stay = moves.filter((m) => !m.to.to.portal)
      if (stay.length) moves = stay
    }
    return pick(moves)
  }

  // The i-th piece after the one the car's nose is on, deciding turns as
  // far ahead as anything asks. Null past a way out.
  function routeAt(car, i) {
    while (car.route.length <= i) {
      const last = car.route.length ? car.route[car.route.length - 1] : car.piece
      if (isLane(last)) {
        if (last.to.portal) return null
        car.route.push(choose(car, last))
      } else car.route.push(last.to)
    }
    return car.route[i]
  }

  // ---------- Where everyone is -------------------------------------------

  // Each car's body as spans along the pieces it covers, front to rear.
  function occupy() {
    for (const list of occ.values()) list.length = 0
    for (const car of cars) {
      if (!car.active || car.driven) continue
      let piece = car.piece
      let hi = car.s
      let left = u.length
      // A hair of length left over from rounding isn't body: counted, it
      // would leave a zero-length ghost on the junction the car just left.
      for (let i = 0; piece && left > 1e-6 && i < car.spans.length; i++) {
        const sp = car.spans[i]
        sp.lo = Math.max(0, hi - left)
        sp.hi = hi
        occ.get(piece)?.push(sp)
        left -= hi - sp.lo
        piece = car.trail[i]
        hi = piece ? piece.path.len : 0
      }
    }
  }

  // How far onto `lane` a car could get before it has to stop, measured to
  // its nose: behind the nearest car, or at the line. Through a corner,
  // where there's only one way on, it keeps looking. Stops once it has
  // found `need`.
  function roomOn(lane, need) {
    let piece = lane
    let off = 0
    while (piece) {
      let rear = Infinity
      for (const sp of occ.get(piece)) rear = Math.min(rear, sp.lo)
      if (rear < Infinity) return off + rear - u.s0
      if (isLane(piece)) {
        if (piece.to.stop) return off + stopAt.get(piece)
        if (piece.to.portal) return Infinity
        off += piece.path.len
        piece = piece.moves[0]
      } else {
        off += piece.path.len
        piece = piece.to
      }
      if (off >= need) return off
    }
    return off
  }

  // What's ahead of a car along its route: the rear of the nearest car and
  // its speed, the line it has to stop at, and the next turn. Distances are
  // from the car's nose.
  const seen = { gap: Infinity, lead: 0, line: Infinity, turn: Infinity }
  function scan(car) {
    seen.gap = Infinity
    seen.lead = 0
    seen.line = Infinity
    seen.turn = Infinity
    let piece = car.piece
    let off = -car.s
    for (let i = 0; piece && off < u.horizon; i++) {
      for (const sp of occ.get(piece)) {
        if (sp.car === car || (i === 0 && sp.hi <= car.s)) continue
        const gap = off + sp.lo
        if (gap < seen.gap) {
          seen.gap = gap
          seen.lead = sp.car.v
        }
      }
      if (isLane(piece)) {
        if (piece.to.stop && car.holds !== piece.to) {
          seen.line = off + stopAt.get(piece)
          break
        }
      } else if (piece.turn !== 'straight' && off > 0) seen.turn = Math.min(seen.turn, off)
      if (seen.gap < Infinity) break
      off += piece.path.len
      piece = routeAt(car, i)
    }
    if (bodies.length) {
      const d = bodyAhead(car, Math.min(seen.gap, seen.line, u.horizon))
      if (d < seen.gap) {
        seen.gap = d
        seen.lead = 0
      }
    }
    return seen
  }

  // A car off the lanes is in the way if driving on would put this car's
  // body into it: walk the route ahead a couple of px at a time, and give
  // the last clear distance. Whatever the off-lane car is doing, treat it as
  // standing still.
  const probe = { x: 0, y: 0, a: 0 }
  function bodyAhead(car, limit) {
    const reach = limit + u.length * 2
    const near = bodies.filter((b) => Math.hypot(b.x - car.x, b.y - car.y) < reach)
    if (!near.length) return Infinity
    const stepPx = 2
    for (let d = 0; d <= limit; d += stepPx) {
      // Where the car's body would be with its nose d further on.
      pointAlong(car, d - u.length / 2, probe)
      for (const b of near) {
        if (overlap(probe, b, u.length, u.width, u.touch, 0)) return Math.max(0, d - stepPx)
      }
    }
    return Infinity
  }

  // The deceleration that brings speed v down to vt within distance d, once
  // it has reached a normal stop's; until then, no limit. So a car brakes
  // late and evenly, at `decel`, and arrives exactly.
  function brake(v, vt, d) {
    if (v <= vt) return Infinity
    if (d <= 0) return -u.maxDecel
    const need = (v * v - vt * vt) / (2 * d)
    return need >= u.decel ? -need : Infinity
  }

  // The fastest a car can be going here and still stop for what's ahead.
  function safeSpeed(car) {
    const ahead = scan(car)
    let v = car.cruise
    if (!isLane(car.piece) && car.piece.turn !== 'straight') v = Math.min(v, u.turn)
    if (ahead.gap < Infinity) v = Math.min(v, Math.sqrt(2 * u.decel * Math.max(0, ahead.gap - u.s0)))
    if (ahead.line < Infinity) v = Math.min(v, Math.sqrt(2 * u.decel * Math.max(0, ahead.line)))
    if (ahead.turn < Infinity) v = Math.min(v, Math.sqrt(u.turn * u.turn + 2 * u.decel * ahead.turn))
    return v
  }

  // ---------- A step ------------------------------------------------------

  // All-way stops, first come first served. The first car in a junction's
  // queue gets the box when nobody has it and its exit has room for the
  // whole car past the box, so it can never stop inside it. Waiting too
  // long on a full exit, it picks another.
  function grant(dt) {
    for (const j of junctions.values()) {
      if (j.holder || !j.queue.length) continue
      const car = j.queue[0]
      // Still holding the box behind (needOn keeps this from happening).
      if (car.holds) continue
      // A car off the lanes in the box, or touching it: wait for it.
      if (bodies.some((b) => touchesBox(b, j.node.box, u.length, u.width, u.touch))) continue
      const exit = routeAt(car, 0).to
      if (roomOn(exit, needOn(exit)) >= needOn(exit)) {
        j.queue.shift()
        j.holder = car
        car.holds = j.node
        car.queued = false
        car.dwell = 0
        car.waited = 0
      } else if ((car.waited += dt) >= t.reroute) {
        car.waited = 0
        const others = car.piece.moves.filter((m) => m !== car.route[0])
        const open = others.filter((m) => roomOn(m.to, needOn(m.to)) >= needOn(m.to))
        if (others.length) {
          car.route.length = 0
          car.route.push(pick(open.length ? open : others))
        }
      }
    }
  }

  // Speed, by the intelligent driver model for following, and plain even
  // braking for lines and turns. Then two hard limits the model can't
  // break: never into the car ahead, never over the line.
  function drive(car, dt) {
    const ahead = scan(car)
    const v = car.v
    const onTurn = !isLane(car.piece) && car.piece.turn !== 'straight'
    const v0 = onTurn ? Math.min(car.cruise, u.turn) : car.cruise
    let a = u.accel * (1 - (v / v0) ** 4)
    if (ahead.gap < Infinity) {
      const want = u.s0 + Math.max(0, v * u.headway + (v * (v - ahead.lead)) / (2 * Math.sqrt(u.accel * u.decel)))
      a -= u.accel * (want / Math.max(ahead.gap, 1e-3)) ** 2
    }
    if (ahead.turn < Infinity) a = Math.min(a, brake(v, u.turn, ahead.turn))
    if (ahead.line < Infinity) a = Math.min(a, brake(v, 0, ahead.line))
    a = Math.max(a, -u.maxDecel)

    let nv = Math.max(0, v + a * dt)
    let ds = nv * dt
    const room = ahead.gap - u.touch
    if (ds > room) {
      ds = Math.max(0, room)
      nv = Math.min(nv, ahead.lead)
    }
    if (ds >= ahead.line) {
      ds = Math.max(0, ahead.line)
      nv = 0
    }
    car.v = nv
    car.s += ds
  }

  // Onto the next piece when the nose runs off the end of this one, and off
  // the map at a way out. Then the junction bookkeeping.
  function advance(car, dt) {
    for (;;) {
      const len = car.piece.path.len
      if (car.s < len) break
      if (isLane(car.piece)) {
        if (car.piece.to.portal) return drop(car)
        if (car.piece.to.stop && car.holds !== car.piece.to) {
          car.s = stopAt.get(car.piece)
          car.v = 0
          break
        }
      }
      const next = routeAt(car, 0)
      car.route.shift()
      car.s -= len
      car.trail.unshift(car.piece)
      if (car.trail.length > 2) car.trail.length = 2
      car.piece = next
    }

    // The box is free once the car's rear is out on its exit lane.
    if (car.holds && isLane(car.piece) && car.piece.from === car.holds && car.s >= u.length) {
      junctions.get(car.holds).holder = null
      car.holds = null
    }

    // Stopped at the line: count the dwell, then join the queue.
    const lane = car.piece
    if (isLane(lane) && lane.to.stop && car.holds !== lane.to && !car.queued) {
      if (car.v === 0 && car.s >= stopAt.get(lane) - 1e-6) {
        car.dwell += dt
        if (car.dwell >= t.dwell) {
          junctions.get(lane.to).queue.push(car)
          car.queued = true
        }
      } else car.dwell = 0
    }
  }

  // Back in at a random way in with two car lengths clear, the black car
  // first. With nowhere clear, try again next step.
  function respawn() {
    let used = null
    for (const car of cars) {
      if (!car.pending) continue
      if (live() > target) {
        car.pending = false
        continue
      }
      const open = g.entries.filter((l) => !used?.includes(l) && roomOn(l, 2 * u.length) >= 2 * u.length)
      if (!open.length) return
      const lane = pick(open)
      seat(car, lane, u.length)
      car.v = safeSpeed(car)
      ;(used ??= []).push(lane)
    }
  }

  // ---------- Poses -------------------------------------------------------

  const front = { x: 0, y: 0, a: 0 }
  const rear = { x: 0, y: 0, a: 0 }
  const overhang = (u.length - u.wheelbase) / 2

  // The point `back` px behind the car's nose along its route. Behind the
  // start of everything it knows (just spawned), straight back.
  function pointBack(car, back, out) {
    let d = car.s - back
    let piece = car.piece
    for (let i = 0; d < 0 && i < car.trail.length; i++) {
      piece = car.trail[i]
      d += piece.path.len
    }
    if (d >= 0) return piece.path.at(d, out)
    piece.path.at(0, out)
    out.x += Math.cos(out.a) * d
    out.y += Math.sin(out.a) * d
    return out
  }

  // The point `dist` px along the car's route from its nose: ahead if
  // positive, behind if negative. Past a way out, straight on.
  function pointAlong(car, dist, out) {
    if (dist <= 0) return pointBack(car, -dist, out)
    let piece = car.piece
    let d = car.s + dist
    for (let i = 0; d > piece.path.len; i++) {
      const next = routeAt(car, i)
      if (!next) {
        piece.path.at(piece.path.len, out)
        out.x += Math.cos(out.a) * (d - piece.path.len)
        out.y += Math.sin(out.a) * (d - piece.path.len)
        return out
      }
      d -= piece.path.len
      piece = next
    }
    return piece.path.at(d, out)
  }

  function pose(car) {
    pointBack(car, overhang, front)
    pointBack(car, overhang + u.wheelbase, rear)
    car.x = (front.x + rear.x) / 2
    car.y = (front.y + rear.y) / 2
    car.a = Math.atan2(front.y - rear.y, front.x - rear.x)
  }

  // ---------- The start ---------------------------------------------------

  // Cars scattered along lanes, never in a box, never past a line, and
  // clear of each other, from the seeded generator. The black car starts on
  // a street that's fully on screen.
  function start() {
    const inside = g.lanes.filter((l) => !l.from.portal && !l.to.portal)
    for (const car of cars) {
      if (!place(car, car.black && inside.length ? inside : g.lanes)) car.pending = true
    }
    occupy()
    for (const car of cars) if (car.active) car.v = safeSpeed(car)
  }

  // Seat a car somewhere random along the lanes in `pool`, weighted by
  // length, clear of every other car. False if 200 tries found nowhere.
  function place(car, pool) {
    const total = pool.reduce((sum, l) => sum + l.path.len, 0)
    for (let tries = 0; tries < 200; tries++) {
      let r = rand() * total
      let lane = pool[0]
      for (const l of pool) {
        lane = l
        if ((r -= l.path.len) < 0) break
      }
      const lo = u.need
      const hi = lane.to.stop ? stopAt.get(lane) : lane.path.len - u.margin
      if (hi < lo) continue
      seat(car, lane, lo + rand() * (hi - lo))
      if (!cars.some((o) => o !== car && o.active && overlap(car, o, u.length, u.width, u.s0))) return true
      car.active = false
    }
    return false
  }

  // ---------- Rescale -----------------------------------------------------

  // The same map at a new size (or with different segments hidden): every
  // car keeps its lane and how far along it is. A car whose road is gone,
  // or that now overlaps another, leaves and comes back in at an edge.
  function rescale(next, nextCount = target) {
    const nodeById = new Map(next.nodes.map((n) => [n.id, n]))
    const laneById = new Map(next.lanes.map((l) => [l.id, l]))
    const oldFrom = fromOf
    const map = (p) => {
      if (isLane(p)) return laneById.get(p.id)
      return laneById.get(oldFrom.get(p).id)?.moves.find((m) => m.to.id === p.to.id)
    }
    const queues = [...junctions.values()].map((j) => [j.node.id, j.queue])
    const mapAll = (list) => {
      const out = []
      for (const p of list) {
        const q = map(p)
        if (!q) break
        out.push(q)
      }
      return out
    }

    index(next)
    for (const car of cars) {
      if (!car.active || car.driven) continue
      const piece = map(car.piece)
      const holds = car.holds && nodeById.get(car.holds.id)
      const atLine = car.queued || car.dwell > 0
      car.holds = null
      car.queued = false
      if (!piece) {
        car.active = false
        car.pending = true
        continue
      }
      car.s *= piece.path.len / car.piece.path.len
      car.piece = piece
      car.trail = mapAll(car.trail)
      car.route = mapAll(car.route)
      if (holds?.stop && !junctions.get(holds).holder) {
        junctions.get(holds).holder = car
        car.holds = holds
      }
      if (isLane(piece) && piece.to.stop && car.holds !== piece.to) {
        const line = stopAt.get(piece)
        if (atLine || car.s > line) {
          car.s = line
          car.v = 0
        }
      }
    }

    // Queues keep their order, for the cars still waiting at the same line.
    for (const [id, queue] of queues) {
      const j = junctions.get(nodeById.get(id))
      if (!j) continue
      for (const car of queue) {
        if (car.active && isLane(car.piece) && car.piece.to === j.node && car.s === stopAt.get(car.piece)) {
          j.queue.push(car)
          car.queued = true
          car.dwell = t.dwell
        }
      }
    }

    target = nextCount
    while (cars.length < target) {
      const car = makeCar(cars.length)
      car.pending = true
      cars.push(car)
    }

    // Anything that now overlaps something already kept leaves.
    occupy()
    const kept = []
    for (const car of cars) {
      if (!car.active || car.driven) continue
      pose(car)
      if (kept.some((o) => overlap(car, o, u.length, u.width, u.touch))) drop(car)
      else kept.push(car)
    }
    for (const car of cars) if (!car.active && !car.pending) car.pending = live() < target
    occupy()
  }

  // ---------- Play mode -----------------------------------------------------
  // The black car leaves the lanes when a visitor takes it over, and comes
  // back when they're done (drive/index.js).

  // Out of traffic: off its lane, out of any junction, and no longer moved
  // by this code. Whoever took it sets its pose.
  function takeOut(car) {
    if (car.holds) junctions.get(car.holds).holder = null
    if (car.queued) {
      const q = junctions.get(car.piece.to).queue
      q.splice(q.indexOf(car), 1)
    }
    car.holds = null
    car.queued = false
    car.dwell = 0
    car.waited = 0
    car.route.length = 0
    car.trail.length = 0
    car.driven = true
  }

  // Off the map now, to come straight back in at a way in. For a car that
  // never found its way back, and for the black car when Drive is pressed
  // while it's outside the hero.
  function sendOff(car) {
    car.driven = false
    if (car.active) drop(car)
    car.pending = true
  }

  // Parked on a street on screen, straight away: for the black car when
  // Drive is pressed under reduced motion, where nothing will drive it in.
  function seatInside(car) {
    const inside = g.lanes.filter((l) => !l.from.portal && !l.to.portal)
    return place(car, inside.length ? inside : g.lanes)
  }

  // The pose of a car with its nose at s on a lane, which is straight.
  function laneSpot(lane, s, out) {
    const c = s - u.length / 2
    out.x = lane.p0.x + lane.d.x * c
    out.y = lane.p0.y + lane.d.y * c
    out.a = lane.heading
    return out
  }

  // Room for a car with its nose at s on `lane`: nothing else within `gap`
  // of it along the lane. A landing asks for a stopped car's gap either
  // side; joining only needs not to touch, and the following rules keep
  // the gap from there.
  const spot = { x: 0, y: 0, a: 0 }
  const roomAt = (lane, s, self, gap = u.s0 * 2) =>
    !cars.some((o) => o !== self && o.active && overlap(laneSpot(lane, s, spot), o, u.length, u.width, gap, u.touch))

  // Where a car off the lanes (pose p, px) should head to rejoin traffic:
  // the nearest point on a lane that runs within CONFIG.recovery.maxTurnDeg
  // of its heading (so never a U-turn), clear of the junction boxes and
  // short of the line, with room for it. "Nearest" counts the turning as
  // well as the distance, a car length for each radian, and four more for a
  // lane that leads straight off the edge, so a car only rejoins traffic on
  // its way out when that's much the closest. fits(pose), if given, says
  // whether a car could sit there: drive/ uses it to keep landings inside
  // the hero's walls, since the ends of lanes to and from the edges are off
  // screen. { lane, s, hi, x, y, a, cost }: the pose is where the car would
  // sit with its nose at s, and hi is the furthest along the lane its nose
  // may join. Or null.
  function landing(p, self, fits = () => true) {
    let best = null
    for (const lane of g.lanes) {
      const turn = Math.abs(Math.atan2(Math.sin(lane.heading - p.a), Math.cos(lane.heading - p.a)))
      if (turn > (CONFIG.recovery.maxTurnDeg * Math.PI) / 180) continue
      // Room to join and settle: at least a car length of lane between the
      // box behind and the line.
      const [lo, hi] = landRange(lane)
      if (hi - lo < u.length) continue
      const along = (p.x - lane.p0.x) * lane.d.x + (p.y - lane.p0.y) * lane.d.y
      // A couple of car lengths on from level with the car, so there's room
      // to swing in.
      let s = clamp(along + u.length / 2 + 2 * u.length, lo, hi - u.length / 2)
      // Never behind the car's nose: getting there would take a U-turn.
      if (s < along + u.length / 2) continue
      const at = laneSpot(lane, s, {})
      // Somewhere it can actually be: further along if need be.
      while (!fits(at) && s < hi - u.length / 2) {
        s = Math.min(hi - u.length / 2, s + u.length / 2)
        laneSpot(lane, s, at)
      }
      if (!fits(at)) continue
      const cost =
        Math.hypot(p.x - at.x, p.y - at.y) + turn * u.length + (lane.to.portal ? 4 * u.length : 0)
      if (best && cost >= best.cost) continue
      if (!roomAt(lane, s, self)) continue
      best = { lane, s, hi, x: at.x, y: at.y, a: at.a, cost }
    }
    return best
  }

  // Where on a lane a car can join, as nose positions: clear of the box
  // behind, and short of the line or the lane's end.
  const landRange = (lane) => [u.need, lane.to.stop ? stopAt.get(lane) : lane.path.len - u.margin]

  // Back into traffic with its nose at s on `lane`, going v px/s, if
  // that's somewhere a car can join and there's room there now. What's
  // drawn is blended by drive/.
  function rejoin(car, lane, s, v) {
    const [lo, hi] = landRange(lane)
    if (s < lo || s > hi || !roomAt(lane, s, car, u.touch * 2)) return false
    seat(car, lane, s)
    occupy()
    car.v = Math.min(Math.max(0, v), safeSpeed(car))
    return true
  }

  // ---------- Public --------------------------------------------------------

  function step(dt) {
    time += dt
    occupy()
    grant(dt)
    for (const car of cars) if (car.active && !car.driven) drive(car, dt)
    for (const car of cars) if (car.active && !car.driven) advance(car, dt)
    occupy()
    respawn()
    for (const car of cars) if (car.active && !car.driven) pose(car)
  }

  index(graph)
  for (let i = 0; i < count; i++) cars.push(makeCar(i))
  start()

  return {
    cars,
    units: u,
    step,
    rescale,
    get time() {
      return time
    },
    get target() {
      return target
    },
    // For the tests and the development hook.
    stopAt: (lane) => stopAt.get(lane),
    // Whether a car could ever be let onto `lane` from the junction behind
    // it, with the map empty.
    canEnter: (lane) => {
      occupy()
      return roomOn(lane, needOn(lane)) >= needOn(lane) && (!lane.to.stop || stopAt.get(lane) >= u.length)
    },
    junctions: () => [...junctions.values()],

    // Play mode (above).
    takeOut,
    sendOff,
    seatInside,
    landing,
    rejoin,
    setBodies(list) {
      bodies = list
    },
  }
}
