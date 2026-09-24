// Every tunable for the hero's city: roads now, traffic, the car and the
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
    seed: 20260924, // same traffic, same turns, for every visitor
  },

  car: {
    length: 4.0, // m: 24px
    width: 1.83, // m: 11px
  },

  // Road sizes at full zoom, the wide map's. A map drawn at a smaller zoom
  // (layout.zoom) scales every one of these except the clearance.
  roads: {
    main: 40, // px: two 20px lanes, 6.7m of road
    side: 24, // px: 60% of a main road
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
}
