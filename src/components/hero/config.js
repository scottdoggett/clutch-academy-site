// Every tunable for the hero's city: roads and traffic now, the car and the
// gearbox as those phases land (docs/spec/hero-drive.md §Config). Nothing
// else in src/components/hero/ picks its own number.
//
// Units: anything physical is SI (metres, seconds, m/s) and anything drawn
// is CSS pixels. world.pxPerM is the one conversion between them.
//
// Plain data with no imports, so Node's test runner, the server-rendered road
// layer and the client engine can all read it.

export const CONFIG = {
  world: {
    pxPerM: 6, // a 24px car is 4m long
    step: 1 / 120, // s, the fixed simulation step
    maxSteps: 8, // per frame, so a slow frame can't snowball
    seed: 20260924, // same traffic, same turns, for every visitor
  },

  car: {
    length: 4.0, // m: 24px
    width: 1.83, // m: 11px
    wheelbase: 2.5, // m: traffic keeps both axles on its path through a turn
  },

  // Road sizes at full zoom, the wide map's. A map drawn at a smaller zoom
  // (layout.zoom) scales every one of these except the clearance.
  roads: {
    main: 40, // px: two 20px lanes, 6.7m of road
    // Every road is one width since the September 24 review; the brief's
    // side streets at 60% read as too busy. Side streets stay their own
    // kind because they cut through blocks rather than being part of the
    // base grid (layouts/wide.json), and must end on a road at both ends.
    side: 40, // px
    tick: { width: 2, length: 8, gap: 10 }, // the black centre line, px
    // The zebra crossing on every road into a cross or a T, px: black
    // stripes `stripe` wide with `space` between, `depth` long, starting
    // `gap` clear of the junction box. Road widths are whole numbers of
    // stripe + space, so a 40px road takes 5 stripes and a 24px one takes 3.
    crosswalk: { gap: 3, depth: 10, stripe: 2, space: 6 },
    clearance: 48, // px from any road's edge to the headline block
  },

  layout: {
    // The wide map covers the whole hero, with the copy in its left half.
    // Below this (phones) the roads move to a band under the CTAs
    // (Hero.css). CSS and JS share this query, so the map on screen and the
    // map the traffic drives never disagree.
    wideQuery: '(min-width: 768px)',
    // How long the hero has to stop resizing before the city re-measures.
    resizeDebounce: 150, // ms
    // How far each map is zoomed out: every road size above, and from Phase
    // 3 the cars, times this. The phone band is small enough that full-size
    // roads left almost no road between one junction and the next.
    zoom: { wide: 1, compact: 0.6 },
  },

  // Ambient traffic (engine/traffic.js). Speeds, accelerations and gaps are
  // SI; the engine converts them at pxPerM times the map's zoom, so phone
  // cars cover 0.6 as many px per second, like their roads.
  traffic: {
    pxPerCar: 90_000, // one car per this many px² of the layout's box
    min: 6,
    max: 16,
    compactMin: 4, // six cars in a 360×240 band is a jam
    cruiseKmh: [36, 44], // each car picks its own cruise from this range
    turnKmh: 15,
    accel: 2.5, // m/s²
    decel: 3.5, // m/s², a normal stop
    maxDecel: 8, // m/s², the most a car will ever brake
    headway: 1.2, // s of time gap to the car ahead
    stopGap: 1.5, // m bumper to bumper when stopped in a queue
    dwell: 0.4, // s stopped at the line before joining the junction's queue
    reroute: 6, // s waiting for room on an exit before picking another
    // Smaller rules the spec leaves to the code.
    lineGap: 1, // px at full zoom between a stopped car's nose and the crossing
    boxClear: 0.5, // m: a car enters a junction only if it can stop this far past it
    lookahead: 50, // m: how far ahead a car looks for a car or a line to stop for
    // The black car starts on a street in the top part of the map, this
    // share of its height down, so it's there to be found on load rather
    // than tucked in a bottom corner.
    blackTop: 0.35,
  },

  // The black car under a visitor's control (drive/). Everything SI. Phase 4
  // drives it with a stand-in automatic (`auto`), which Phase 5's gearbox
  // replaces.
  player: {
    mass: 1200, // kg
    maxSteerDeg: 38, // front wheels' lock at walking pace
    steerAtTop: 0.65, // the lock at topKmh, as a share of maxSteerDeg
    topKmh: 160, // where the lock stops shrinking
    // Sideways acceleration each axle holds before it slides, m/s². Three
    // or four times a real car's: at 6px a metre the hero is a 240m city
    // block, and realistic grip made every turn a slow arc. The rear holds
    // a little less than the front, so it's the tail that lets go first.
    grip: 40,
    rearGrip: 0.9, // as a share of grip
    // The drift: above `fromKmh`, with the steering past `steer`, the rear
    // loses grip (to `rearGrip` of its own) over `ease` seconds and the tail
    // swings out. Ease off the steering and it catches again. Past
    // `maxSlipDeg` of slide the rear grips back in, fully by `spinDeg`, so a
    // held drift stays a drift instead of a spin.
    drift: { fromKmh: 45, steer: 0.7, rearGrip: 0.45, ease: 0.2, maxSlipDeg: 30, spinDeg: 50 },
    spinDamping: 2.5, // 1/s of yaw damping, light enough to leave turning quick
    brake: 14, // m/s²
    hardBrake: 0.8, // brake pedal past this is hard braking
    rearGripBraking: 0.75, // rear grip under hard braking, as a share
    rearGripSpin: 0.55, // rear grip while the wheels spin or lock, as a share
    // The most the rear tyres can push, m/s². The engine can ask for more in
    // 1st; this is what reaches the road.
    traction: 18,
    // Drag that grows with speed, so the car tapers near the top: linear in
    // 1/s, quadratic in 1/m. Lighter than the Phase 4 stand-in's, so 6th can
    // pull past 200 km/h; engine braking in gear makes up the difference
    // off the throttle.
    drag: { linear: 0.08, quad: 0.0014 },
    ease: { steer: 0.06, pedal: 0.08 }, // s from nothing to full
    wallRestitution: 0.35,
  },

  // The engine and gearbox (drive/gearbox.js, §Gearbox and engine). Real
  // ratios from a six-speed hatchback; the engine is an arcade one, several
  // times a real hatchback's torque, so the car keeps the pull Scott liked
  // in the Phase 4 stand-in. Two modes on the same gears: manual, where the
  // visitor shifts and works the clutch, and automatic, which does both.
  gearbox: {
    order: ['R', 'N', '1', '2', '3', '4', '5', '6'],
    ratios: { R: 3.45, 1: 3.36, 2: 2.09, 3: 1.47, 4: 1.1, 5: 0.87, 6: 0.73 },
    finalDrive: 4.1,
    tyreRadius: 0.31, // m
    peakTorque: 200, // Nm, a real hatchback's
    torqueScale: 5.5, // how many times that the arcade engine makes
    idle: 900,
    redline: 7000,
    limiterDrop: 300, // rpm the limiter cuts back by before firing again
    revRate: 12000, // rpm/s the engine picks up free, clutch in or in N
    stallBelow: 600, // rpm: the clutch engaging below this stalls 2nd and up
    stallTime: 0.8, // s the engine is off after a stall
    stallDecel: 6, // m/s²: bogging down while stalled
    overrevDecel: 9, // m/s²: engine braking after a downshift past the redline
    lockDecel: 8, // m/s²: rear wheels locked, grinding into the wrong direction
    engineBrake: 3, // m/s² at the redline in 1st, off the throttle; less in taller gears
    wheelspinAbove: 4500, // rpm, clutch out in 1st or R with half throttle or more
    wheelspinTime: 0.6, // s the rear wheels spin for
    creep: 0.1, // the throttle 1st and R creep on at idle, off both pedals
    startGearRpm: 2000, // taking the car over at speed: the highest gear above this
    // The automatic: when to change up, from light to full throttle, when to
    // change down, and how long a change takes with the drive cut.
    auto: { upLight: 2800, upFull: 6600, down: 1800, kickdown: 5800, shiftTime: 0.09 },
    defaultMode: 'auto', // until the visitor picks, and then remembered
  },

  // A car that has left the lanes finding its way back (drive/): for now
  // the black car when driving ends. Phase 6 adds knocked cars.
  recovery: {
    rejoinKmh: 10, // for the last few car lengths into its lane
    // Further off, up to this, so a car left in the middle of a block or
    // over the headline isn't a minute crawling back at 10 km/h.
    approachKmh: 30,
    // Car lengths ahead along the way back that it steers for: 1 at 10 km/h,
    // which holds the line tightly, rising to the spec's 1.5 at speed.
    lead: [1, 1.5],
    // Close enough to blend in: this far from the lane's centre line, and
    // this close to its heading. The spec's first values, 0.3 m and 10°,
    // were rarely both true at once: pure pursuit reaches the line at an
    // angle and settles slowly. The half-second blend absorbs the rest.
    near: 1, // m
    nearDeg: 20,
    blend: 0.5, // s to ease from where it is into its lane pose
    // The most a lane may point away from the car's heading and still be
    // joined. The spec's 90° ruled out the nearest road for a car pointing
    // straight across it, which then drove to one a long way off.
    maxTurnDeg: 120,
    // Not back in traffic within giveUp seconds of reaching its landing
    // spot, or within giveUpMax at all, it goes off and comes back in at an
    // edge. A safety net for a car pinned against a wall; the clock waits for
    // the landing because a car can end a drive a long way from any road.
    giveUp: 8, // s
    giveUpMax: 20, // s
    // Driving ended: the car turns for the nearer side of the window and
    // drives off it at this speed, then comes back in at the top. Held up
    // for leaveHeld, it stops being solid. leaveMax is a guard that can't
    // be reached; it only ever goes once it's out of sight.
    leaveKmh: 150,
    leaveAccel: 30, // m/s²: it's leaving, not being driven, so harder than the car can
    leaveHeld: 0.4, // s
    leaveMax: 20, // s
  },

  // A traffic car the black car hits (§Traffic as physical bodies): it
  // stops following its lane and takes the knock as a real body, sliding
  // and spinning with its brakes locked, then finds its own way back
  // (§Recovery). Everything SI.
  knock: {
    touch: 0.2, // m/s the black car has to be closing at to knock a car at all
    nudge: 1, // m/s a knocked or recovering car needs to knock another: gentle touches don't spread
    friction: 7, // m/s² its locked wheels slow it by
    spin: 1.6, // how quickly its spinning dies away (angular damping)
    settleSpeed: 0.5, // m/s: slower than this...
    settleSpin: 0.3, // rad/s ...and turning slower than this, it has settled
    settleMax: 2, // s after the knock it starts back regardless
  },

  // What the driving throws off (§Smoke, §Effects): smoke, and sparks where
  // cars hit. A crash bumps the other car and throws sparks; nothing more
  // happens to it.
  effects: {
    fade: 0.8, // s a knocked car that's off the roads or lost takes to fade away
    sparksKmh: 8, // closing speed for sparks
    tyreSmoke: 0.55, // how hard a tyre has to slide to smoke (of a full skid)
    tyreRate: 24, // puffs a second from a sliding axle, at a full skid
    pools: { smoke: 400, glow: 300 },
  },

  // The page following the car while it's driven (§Driving the whole
  // page). Near the bottom or top of the window the page scrolls with it,
  // and keeps going for a moment after the car slows.
  follow: {
    zone: 0.2, // of the window below the nav, at each end, where it follows
    push: 360, // px/s more at the very edge of the window, on top of the car's own speed
    rise: 0.15, // s: how fast the scroll picks up
    coast: 0.8, // s: how slowly it dies away, the momentum
    edge: 8, // px: however fast the car, it never gets closer than this to either end
    hold: 0.5, // s it leaves the page alone after the visitor scrolls it
  },

  // Tyre marks behind the black car while it's driven (§Tyre marks). Faint
  // whenever it rolls, darker and wider when a tyre slides: a drift, a
  // skid, hard braking, wheelspin.
  marks: {
    pool: 6000, // segments, recycled oldest first: 10s of sliding at speed
    every: 3, // px a wheel rolls between segments, so a strip is continuous
    jump: 40, // px: a wheel that moved further in one go jumped; no mark
    alpha: 0.55, // --black at this, for a full skid
    roll: 0.15, // how strong a plain rolling mark is, of a full skid
    width: [1.2, 2.2], // px, rolling to a full skid
    fade: 10, // s a full skid mark takes to fade
    rollFade: 4, // s a rolling mark takes
    // Sideways sliding at an axle, m/s past what its grip cancels: marks
    // start at `slip` and are full strength by `slipFull`.
    slip: 0.3,
    slipFull: 3,
    release: 0.2, // s a skid mark takes to fade back to a rolling one as the tyre grips
    brakeAbove: 0.8, // brake pedal past this...
    brakeFromKmh: 15, // ...above this speed marks all four wheels
    brake: 0.8, // that strongly
    track: 1.5, // m between the left and right wheels
  },

  render: {
    maxDpr: 2,
    // Window glass, mixed from the body colour: traffic glass towards
    // --black, the black car's towards white, or its windows would vanish.
    glass: { traffic: 0.55, black: 0.3 },
    // The ring that pulses once around the black car when a visitor takes
    // it over, so they can find it: px, growing from `from` to `to` radius.
    ring: { life: 1, from: 16, to: 40, width: 2.5 },
  },
}
