// Where each gear sits in the gear display's H-pattern (GearGate.jsx), and
// the route the knob takes between two of them. Pure, so the tests can walk
// it: the rule is the About page's shift gate's (ShiftGate.jsx), back onto
// the neutral plane, across, into the slot, never straight across the gate.

// In the SVG's own units. N is on the plane, level with 3 and 4, where a
// real lever rests. R is a fourth slot, top left, so the gate reads R 1 2 3
// 4 5 6 left to right.
export const X = { R: 12, 1: 34, 2: 34, 3: 56, 4: 56, 5: 78, 6: 78, N: 56 }
export const TOP = 14
export const PLANE = 31
export const BOTTOM = 48
export const Y = { R: TOP, 1: TOP, 3: TOP, 5: TOP, 2: BOTTOM, 4: BOTTOM, 6: BOTTOM, N: PLANE }

export const spot = (gear) => ({ x: X[gear] ?? X.N, y: Y[gear] ?? PLANE })

// From a point (wherever the knob has got to) to a gear: { legs, total }.
export function route(from, gear) {
  const to = spot(gear)
  const points = [from]
  if (Math.abs(from.x - to.x) > 0.5) {
    if (Math.abs(from.y - PLANE) > 0.5) points.push({ x: from.x, y: PLANE })
    points.push({ x: to.x, y: PLANE })
  }
  points.push(to)
  const legs = []
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const len = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
    if (len < 0.5) continue
    legs.push({ a: points[i - 1], b: points[i], len })
    total += len
  }
  return { legs, total, to }
}

// The point `d` units along a route.
export function along({ legs, to }, d) {
  for (const { a, b, len } of legs) {
    if (d <= len) return { x: a.x + ((b.x - a.x) * d) / len, y: a.y + ((b.y - a.y) * d) / len }
    d -= len
  }
  return to
}
