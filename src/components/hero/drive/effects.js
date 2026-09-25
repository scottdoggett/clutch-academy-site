// What the driving throws off (docs/spec/hero-drive.md §Smoke, §Effects):
// smoke from a stall, an over-rev and sliding tyres, and sparks where cars
// hit. Which particles, where, which way and for how long. Pure, no DOM and no
// three.js: the driver calls these as things happen and hands each particle
// to the engine, which draws it (engine/particles.js).
//
// Every emitter takes emit(particle), a random source (mulberry32 from
// traffic.js, so the tests are repeatable), and px. A particle is
// { kind: 'smoke' | 'glow', x, y, vx, vy, life, from, to, color, alpha,
// drag, stretch, delay }: smoke is soft and round and thins as it grows;
// glow adds light, for sparks, and cools to red as it dies.

import { CONFIG } from '../config.js'

const GREY = [0.86, 0.85, 0.84]
const SPARK = [1, 0.93, 0.7]

const between = (rnd, lo, hi) => lo + (hi - lo) * rnd()

// A point on a car, px: `along` forward of its centre and `across` to its
// right, as fractions of its length and width.
function onCar(car, u, along, across, out = {}) {
  const c = Math.cos(car.a)
  const s = Math.sin(car.a)
  const l = along * u.length
  const w = across * u.width
  out.x = car.x + c * l - s * w
  out.y = car.y + s * l + c * w
  return out
}

// A stall: six grey puffs out of the exhaust, at the back.
export function stallSmoke(emit, car, u, rnd) {
  const at = onCar(car, u, -0.5, 0.25)
  const back = car.a + Math.PI
  for (let i = 0; i < 6; i++) {
    const a = back + between(rnd, -0.5, 0.5)
    const v = between(rnd, 12, 30)
    emit({
      kind: 'smoke',
      x: at.x,
      y: at.y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      life: between(rnd, 0.8, 1.1),
      from: 6,
      to: 22,
      color: GREY,
      alpha: 0.5,
      drag: 1.5,
      delay: i * 0.04,
    })
  }
}

// A tyre sliding (a drift, a skid, wheelspin, an over-rev or a locked rear):
// a light puff where the wheel is, left behind as the car goes on.
export function tyreSmoke(emit, x, y, strength, rnd) {
  const a = between(rnd, 0, Math.PI * 2)
  const v = between(rnd, 4, 14)
  emit({
    kind: 'smoke',
    x: x + between(rnd, -2, 2),
    y: y + between(rnd, -2, 2),
    vx: Math.cos(a) * v,
    vy: Math.sin(a) * v,
    life: between(rnd, 0.7, 1.1),
    from: 5,
    to: between(rnd, 16, 24),
    color: GREY,
    alpha: 0.18 + 0.2 * strength,
    drag: 1.2,
  })
}

// Four puffs from each rear wheel over 0.3s: an over-rev downshift, or
// grinding into the wrong direction.
export function rearBurst(emit, wheels, rnd) {
  for (const w of [wheels[2], wheels[3]]) {
    for (let i = 0; i < 4; i++) {
      emit({
        kind: 'smoke',
        x: w.x,
        y: w.y,
        vx: between(rnd, -10, 10),
        vy: between(rnd, -10, 10),
        life: 0.9,
        from: 5,
        to: 20,
        color: GREY,
        alpha: 0.4,
        drag: 1.2,
        delay: i * 0.075,
      })
    }
  }
}

// A crash at (x, y), px, closing at `speed` m/s along the normal (nx, ny):
// sparks flying off along the contact, more and further the harder it is.
export function crash(emit, x, y, nx, ny, speed, rnd, fx = CONFIG.effects) {
  const kmh = speed * 3.6
  if (kmh < fx.sparksKmh) return
  const n = Math.round(Math.min(22, 4 + kmh / 4))
  for (let i = 0; i < n; i++) {
    // Mostly along the contact, either way, some thrown back off it.
    const along = rnd() < 0.5 ? 1 : -1
    const tx = -ny * along
    const ty = nx * along
    const out = between(rnd, -0.6, 0.6)
    let vx = tx + nx * out
    let vy = ty + ny * out
    const m = Math.hypot(vx, vy) || 1
    const v = between(rnd, 90, 260) * Math.min(1.6, 0.6 + kmh / 60)
    vx = (vx / m) * v
    vy = (vy / m) * v
    emit({
      kind: 'glow',
      x,
      y,
      vx,
      vy,
      life: between(rnd, 0.2, 0.45),
      from: 2.2,
      to: 1,
      color: SPARK,
      alpha: 1,
      drag: 5,
      stretch: 1,
    })
  }
}

// A rate, per second, turned into whole particles this step: the fraction
// carries over in `acc` so a low rate still comes out right.
export function due(acc, rate, dt) {
  acc.n = (acc.n ?? 0) + rate * dt
  const whole = Math.floor(acc.n)
  acc.n -= whole
  return whole
}
