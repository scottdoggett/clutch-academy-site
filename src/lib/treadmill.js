// The reviews strip as a treadmill for the hero's black car
// (docs/spec/hero-drive.md §The treadmill).
//
// The strip (ReviewsMarquee.jsx) drifts left on its own. While the car is
// on it, the car's wheels push it: drive right and the reviews run left
// under the car, faster the faster it goes; drive left and they turn round
// and run right. The strip carries the car and its tyre marks along with
// it, so a car sitting still rides with the reviews, and one driving
// against them mostly runs on the spot.
//
// This module is the meeting point, and holds no DOM of its own. The
// marquee registers its viewport, moves the strip by beltSpeed() and
// publishes how fast it's going and how far it has gone. The hero engine
// reads those, and tells it how fast the car is going across it.

export const TREADMILL = {
  // How much of the car's own speed across the strip it pushes back into
  // the strip. At 1 the car would never get anywhere; at 0.7 it gains a
  // little against the drift above about 120 km/h and mostly holds its
  // place below.
  coupling: 0.7,
  grab: 0.3, // s the strip takes to answer the wheels
  coast: 1.2, // s it takes to settle back to its drift once the car is off
  max: 600, // px/s either way, however hard it's pushed
}

export const treadmill = {
  el: null, // the strip's viewport while it's moving, null otherwise
  speed: 0, // px/s the cards are moving now, + right
  travel: 0, // px they've moved in all, + right, never wrapped
  car: null, // px/s the black car is going across the strip, + right, or null when it's off
}

// The strip's speed after dt seconds. rest: its own drift, px/s. car: the
// car's speed across it, or null. It eases towards what the wheels ask for
// quickly, and back to its drift slowly, like a heavy belt.
export function beltSpeed(speed, rest, car, dt, cfg = TREADMILL) {
  const on = car !== null && car !== undefined
  const want = on ? Math.max(-cfg.max, Math.min(cfg.max, rest - cfg.coupling * car)) : rest
  return speed + (want - speed) * (1 - Math.exp(-dt / (on ? cfg.grab : cfg.coast)))
}
