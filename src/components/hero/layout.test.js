// The two maps against the rules in docs/spec/hero-drive.md §Road layout,
// at every screen size in __fixtures__/copy-rects.json. Run with `npm test`.
//
// The clearance test is the brief's "no road enters the headline region":
// at 1280, 1440 and 1920px wide nothing comes within 48px of the copy, and
// at every other recorded size the test prints what the runtime rule hides.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CONFIG } from './config.js'
import { buildGraph, checkGraph, roadsFor, segmentsOf } from './graph.js'
import { SEAM, hideRule, laneMinimum, offenders, pieceRect, resolveClearance, resolveMap, roadPieces } from './layout.js'

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const wide = read('./layouts/wide.json')
const medium = read('./layouts/medium.json')
const rects = read('./__fixtures__/copy-rects.json')

// A car's length and one tick with its gap, px, on a given map. Both shrink
// with the map's zoom.
const carOn = (layout) => CONFIG.car.length * CONFIG.world.pxPerM * roadsFor(layout).zoom
const tileOn = (layout) => {
  const { tick } = roadsFor(layout)
  return tick.length + tick.gap
}

// Which layout a recorded size gets. From 768px a map covers the whole
// hero: the wide one from 1200px, the medium one below. Phones have none
// (October 14).
const HERO_FROM = 768
const WIDE_FROM = 1200
const heroSizes = rects.sizes.filter((s) => s.viewport[0] >= HERO_FROM)
const mapFor = (s) => (s.viewport[0] >= WIDE_FROM ? wide : medium)
const HERO_MAPS = [wide, medium]
const boxes = heroSizes.map((s) => ({ layout: mapFor(s), width: s.hero[0], height: s.hero[1], label: s.viewport.join('×') }))

const copyOf = (s) => ({ x0: s.copy[0], y0: s.copy[1], x1: s.copy[2], y1: s.copy[3] })
const required = (s) =>
  rects.required.widths.includes(s.viewport[0]) && s.viewport[1] >= rects.required.minViewportHeight

test('each map starts where CSS switches to it', () => {
  assert.equal(CONFIG.layout.heroQuery, `(min-width: ${HERO_FROM}px)`)
  assert.equal(CONFIG.layout.wideQuery, `(min-width: ${WIDE_FROM}px)`)
  assert.equal(wide.media, CONFIG.layout.wideQuery)
  assert.equal(medium.media, `${CONFIG.layout.heroQuery} and (max-width: ${WIDE_FROM - 1}px)`)
  // Hero.css shows each whole-hero map's road layer under the map's own query.
  const css = readFileSync(new URL('../home/Hero.css', import.meta.url), 'utf8')
  for (const layout of HERO_MAPS) assert.ok(css.includes(`@media ${layout.media} {`), `Hero.css has no @media ${layout.media}`)
})

test('every road is the same width, side streets included', () => {
  assert.equal(CONFIG.roads.side, CONFIG.roads.main)
})

test('every map works at every recorded size', () => {
  for (const b of boxes) {
    const graph = buildGraph(b.layout, b)
    assert.deepEqual(checkGraph(graph, b.layout), [], b.label)
  }
})

test('every lane is long enough to hold a car', () => {
  for (const b of boxes) {
    for (const lane of buildGraph(b.layout, b).lanes) {
      assert.ok(lane.path.len >= carOn(b.layout), `${b.label}: ${lane.id} is ${lane.path.len.toFixed(1)}px`)
    }
  }
})

test('parallel roads leave at least a car length of red between them', (t) => {
  let tightest = { gap: Infinity }
  for (const b of boxes) {
    const segs = buildGraph(b.layout, b).segments
    for (let i = 0; i < segs.length; i++) {
      for (let j = i + 1; j < segs.length; j++) {
        const [s, u] = [segs[i], segs[j]]
        if (s.axis !== u.axis) continue
        const along = s.axis === 'h' ? 'x' : 'y'
        const across = s.axis === 'h' ? 'y' : 'x'
        const overlap =
          Math.min(Math.max(s.a[along], s.b[along]), Math.max(u.a[along], u.b[along])) -
          Math.max(Math.min(s.a[along], s.b[along]), Math.min(u.a[along], u.b[along]))
        const apart = Math.abs(s.a[across] - u.a[across])
        if (overlap <= 0 || apart === 0) continue
        const gap = apart - s.width / 2 - u.width / 2
        if (gap < tightest.gap) tightest = { gap, where: `${b.label}: ${s.id} / ${u.id}` }
        assert.ok(gap >= carOn(b.layout), `${b.label}: ${s.id} and ${u.id} are ${gap.toFixed(1)}px apart`)
      }
    }
  }
  t.diagnostic(`tightest: ${tightest.gap.toFixed(1)}px at ${tightest.where}`)
})

test('portals are off screen by at least a car length', () => {
  for (const b of boxes) {
    for (const n of buildGraph(b.layout, b).nodes.filter((n) => n.portal)) {
      const out = Math.max(-n.x, n.x - b.width, -n.y, n.y - b.height)
      assert.ok(out >= carOn(b.layout), `${b.label}: ${n.id} is only ${out.toFixed(1)}px off screen`)
    }
  }
})

test('no road and no junction inside the headline envelope', () => {
  for (const layout of HERO_MAPS) {
    const r = layout.reserve
    const inside = (x, y) => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1
    for (const n of layout.nodes) assert.ok(!inside(n.x, n.y), `${layout.name}: ${n.id} is inside the reserve`)
    const at = Object.fromEntries(layout.nodes.map((n) => [n.id, n]))
    for (const s of segmentsOf(layout)) {
      const [a, b] = [at[s.a], at[s.b]]
      const crosses =
        Math.min(a.x, b.x) < r.x1 && Math.max(a.x, b.x) > r.x0 && Math.min(a.y, b.y) < r.y1 && Math.max(a.y, b.y) > r.y0
      assert.ok(!crosses, `${layout.name}: ${s.id} runs through the reserve`)
    }
  }
})

test('no road comes within 48px of the headline at 1280, 1440 or 1920px wide', () => {
  const sizes = heroSizes.filter(required)
  assert.ok(sizes.length >= 6, 'the fixture is missing required sizes')
  for (const s of sizes) {
    const graph = buildGraph(mapFor(s), { width: s.hero[0], height: s.hero[1] })
    const bad = offenders(graph, copyOf(s)).map((seg) => seg.id)
    assert.deepEqual(bad, [], `${s.viewport.join('×')}`)
  }
})

test('everywhere else, the runtime rule only hides what the map can lose', (t) => {
  const report = []
  for (const s of heroSizes) {
    const { hidden, blocked, graph } = resolveClearance(mapFor(s), {
      width: s.hero[0],
      height: s.hero[1],
      copy: copyOf(s),
    })
    assert.deepEqual(checkGraph(graph, mapFor(s)), [], s.viewport.join('×'))
    if (hidden.length || blocked.length) {
      report.push(
        `${s.viewport.join('×')}: hidden [${hidden.join(', ')}]` +
          (blocked.length ? `, still too close [${blocked.join(', ')}]` : ''),
      )
    }
  }
  t.diagnostic(report.length ? report.join('\n') : 'no size needs anything hidden')
})

// Whether road segments on a grid line cover all of it from `from` to
// `to`, in a layout's normalised terms.
const coverage = (layout) => {
  const at = Object.fromEntries(layout.nodes.map((n) => [n.id, n]))
  const segs = segmentsOf(layout).map((s) => [at[s.a], at[s.b]])
  return (axis, line, from, to) => {
    const along = axis === 'h' ? 'x' : 'y'
    const across = axis === 'h' ? 'y' : 'x'
    const spans = segs
      .filter(([a, b]) => a[across] === line && b[across] === line)
      .map(([a, b]) => [Math.min(a[along], b[along]), Math.max(a[along], b[along])])
      .sort((p, q) => p[0] - q[0])
    let reach = from
    for (const [lo, hi] of spans) if (lo <= reach + 1e-9 && hi > reach) reach = hi
    return reach >= to - 1e-9
  }
}

const evenlySpaced = (lines) => {
  const gaps = lines.slice(1).map((v, i) => v - lines[i])
  for (const g of gaps) assert.ok(Math.abs(g - gaps[0]) < 1e-4, `spacing ${g} vs ${gaps[0]}`)
}

// Sam asked for a uniform grid on October 8, 2026, in place of the brief's
// merged, uneven one (a base grid varying by up to ±30%, with 20–30% of its
// segments removed and a side street cut through).
test('the wide and medium maps are uniform grids, with the headline in one open block', () => {
  for (const layout of HERO_MAPS) uniformHeroGrid(layout)
  // The medium map is the same rows with fewer, wider columns.
  assert.deepEqual(medium.grid.ys, wide.grid.ys)
  assert.ok(medium.grid.xs.length < wide.grid.xs.length)
})

function uniformHeroGrid(layout) {
  const { xs, ys } = layout.grid
  // Every column the same distance apart, and every row.
  evenlySpaced(xs)
  evenlySpaced(ys)

  // Every junction sits on the grid, and every road end off screen.
  const on = (v, lines) => lines.some((l) => Math.abs(v - l) < 1e-9)
  for (const n of layout.nodes) {
    const portal = n.x < 0 || n.x > 1 || n.y < 0 || n.y > 1
    if (!portal) assert.ok(on(n.x, xs) && on(n.y, ys), `${layout.name}: ${n.id} is off the grid`)
  }

  const covered = coverage(layout)
  const [top, bottom] = [ys[0], ys.at(-1)]
  // Downtown, east of the headline's envelope, nothing is missing: every
  // column runs off the top and the bottom, every row off the right edge.
  const downtown = xs.filter((x) => x > layout.reserve.x1)
  assert.ok(downtown.length >= 2, layout.name)
  for (const x of downtown) assert.ok(covered('v', x, 0, 1), `${layout.name}: column ${x} has a gap`)
  for (const y of ys) assert.ok(covered('h', y, downtown[0], 1), `${layout.name}: row ${y} has a gap downtown`)
  // The top and bottom rows cross the whole hero, and west of downtown each
  // column keeps the spacing above the top row and below the bottom one.
  for (const y of [top, bottom]) assert.ok(covered('h', y, 0, 1), `${layout.name}: row ${y} doesn't cross the hero`)
  for (const x of xs.filter((v) => !downtown.includes(v))) {
    assert.ok(covered('v', x, 0, top) && covered('v', x, bottom, 1), `${layout.name}: column ${x} is missing above or below the copy`)
  }

  // No side streets: every road is part of the grid.
  assert.equal(layout.roads.filter((r) => r.kind === 'side').length, 0)
}

// Scott, October 8: on a smaller screen the six columns were squeezed, so
// below 1200px the medium map has four. Its blocks at a 768px tablet are
// wider than the wide map's would be at 1200px.
const MIN_COLUMN_GAP = 165 // px, centre to centre

test('downtown blocks are never squeezed: at every recorded size, columns are 165px or more apart', (t) => {
  let tightest = { gap: Infinity }
  for (const s of [...heroSizes, ...rects.short.sizes]) {
    const { xs } = mapFor(s).grid
    const gap = (xs[1] - xs[0]) * s.hero[0]
    if (gap < tightest.gap) tightest = { gap, where: `${s.viewport.join('×')} (${mapFor(s).name})` }
    assert.ok(gap >= MIN_COLUMN_GAP, `${s.viewport.join('×')}: columns ${gap.toFixed(0)}px apart`)
  }
  t.diagnostic(`tightest: ${tightest.gap.toFixed(0)}px at ${tightest.where}`)
})

test('the road layer has a road and ticks for every segment, a box for every junction, a crossing on every road into a cross or T', () => {
  for (const layout of HERO_MAPS) {
    const { bands, boxes, ticks, walks } = roadPieces(layout)
    const graph = buildGraph(layout)
    const segs = graph.segments.length
    assert.equal(bands.length, segs)
    assert.equal(ticks.length, segs)
    assert.equal(boxes.length, graph.nodes.filter((n) => ['cross', 'tee', 'corner'].includes(n.kind)).length)
    // A cross has four roads in, a T three.
    const arms = graph.nodes.filter((n) => n.stop).reduce((sum, n) => sum + Object.keys(n.arms).length, 0)
    assert.equal(walks.length, arms, layout.name)
    // Only crosses and Ts get crossings; corners and portals don't.
    for (const w of walks) assert.ok(['cross', 'tee'].includes(graph.nodes.find((n) => n.id === w.node).kind))
  }
})

const overlaps = (a, b) => a.x0 < b.x1 - 1e-6 && a.x1 > b.x0 + 1e-6 && a.y0 < b.y1 - 1e-6 && a.y1 > b.y0 + 1e-6

test('every block corner at a junction is rounded, and each round sits in its corner, reaching only just under its two roads, at any recorded size', () => {
  const PAIRS = [['n', 'e'], ['e', 's'], ['s', 'w'], ['w', 'n']]
  for (const layout of HERO_MAPS) {
    const graph = buildGraph(layout)
    const corners = graph.nodes
      .filter((n) => ['cross', 'tee', 'corner'].includes(n.kind))
      .reduce((sum, n) => sum + PAIRS.filter(([a, b]) => n.arms[a] && n.arms[b]).length, 0)
    assert.equal(roadPieces(layout).fillets.length, corners, layout.name)
  }
  for (const b of boxes) {
    const { bands, boxes: junctions, fillets } = roadPieces(b.layout)
    const rect = (p) => pieceRect(p, b.width, b.height)
    const roads = [...bands, ...junctions].map(rect)
    const graph = buildGraph(b.layout, { width: b.width, height: b.height })
    const round = Math.round(roadsFor(b.layout).fillet)
    for (const f of fillets) {
      const full = rect(f)
      assert.ok(Math.abs(full.x1 - full.x0 - round - SEAM) < 1e-6 && Math.abs(full.y1 - full.y0 - round - SEAM) < 1e-6)
      // Less the strips it reaches under its roads by, on the junction's
      // sides, it's the round's square, on no road.
      const east = f.corner.endsWith('e')
      const south = f.corner.startsWith('s')
      const r = {
        x0: full.x0 + (east ? SEAM : 0),
        x1: full.x1 - (east ? 0 : SEAM),
        y0: full.y0 + (south ? SEAM : 0),
        y1: full.y1 - (south ? 0 : SEAM),
      }
      for (const q of roads) assert.ok(!overlaps(r, q), `${b.label}: the ${f.corner} round at ${f.node} is on a road`)
      // Its inner corner is the junction box's corner.
      const n = graph.nodes.find((m) => m.id === f.node)
      const x = east ? r.x0 - n.box.x1 : n.box.x0 - r.x1
      const y = south ? r.y0 - n.box.y1 : n.box.y0 - r.y1
      assert.ok(Math.abs(x) < 1e-6 && Math.abs(y) < 1e-6, `${b.label}: the ${f.corner} round at ${f.node} is off its corner`)
    }
  }
})

test('crossings and ticks never run into each other or into a junction, at any recorded size', (t) => {
  let shortest = { len: Infinity }
  let bare = 0
  let runs = 0
  for (const b of boxes) {
    const { bands, boxes: junctions, ticks, walks } = roadPieces(b.layout)
    const rect = (p) => pieceRect(p, b.width, b.height)
    const bandOf = Object.fromEntries(bands.map((p) => [p.seg, rect(p)]))
    const inside = (r, band) => r.x0 >= band.x0 - 1e-6 && r.x1 <= band.x1 + 1e-6 && r.y0 >= band.y0 - 1e-6 && r.y1 <= band.y1 + 1e-6
    const crossings = walks.map(rect)
    for (const [i, w] of walks.entries()) {
      assert.ok(inside(crossings[i], bandOf[w.seg]), `${b.label}: the crossing on ${w.seg} at ${w.node} leaves its road`)
      for (const j of junctions) assert.ok(!overlaps(crossings[i], rect(j)), `${b.label}: the crossing at ${w.node} is in a junction`)
      for (const [k, other] of crossings.entries()) {
        if (k !== i) assert.ok(!overlaps(crossings[i], other), `${b.label}: crossings at ${w.node} and ${walks[k].node} overlap`)
      }
    }
    const blocks = [...junctions.map(rect), ...crossings]
    for (const p of ticks) {
      const r = rect(p)
      const len = p.axis === 'h' ? r.x1 - r.x0 : r.y1 - r.y0
      runs++
      // Shorter than one tick and its gap, CSS draws no ticks at all
      // (RoadLayer.css), rather than a clipped one.
      if (len < tileOn(b.layout)) bare++
      if (len < shortest.len) shortest = { len, where: `${b.label}: ${p.seg}` }
      assert.ok(len >= 0, `${b.label}: ${p.seg}'s crossings overlap each other`)
      assert.ok(inside(r, bandOf[p.seg]))
      for (const q of blocks) assert.ok(!overlaps(r, q), `${b.label}: ${p.seg}'s ticks run into a junction or crossing`)
    }
  }
  t.diagnostic(`shortest run between crossings: ${shortest.len.toFixed(1)}px at ${shortest.where}`)
  t.diagnostic(`${bare} of ${runs} runs across all sizes are too short for a whole tick and draw none`)
})

test('each crossing spans its road, sits just clear of the junction, and has whole stripes', () => {
  for (const layout of HERO_MAPS) {
    const roads = roadsFor(layout)
    const { gap, depth, stripe, space } = roads.crosswalk
    for (const kind of ['main', 'side']) {
      const stripes = roads[kind] / (stripe + space)
      assert.ok(Math.abs(stripes - Math.round(stripes)) < 1e-9, `${layout.name} ${kind} road takes ${stripes} stripes`)
    }
    const size = { wide: { width: 1440, height: 836 }, medium: { width: 1024, height: 704 } }[layout.name]
    const graph = buildGraph(layout, size)
    for (const w of roadPieces(layout).walks) {
      const r = pieceRect(w, size.width, size.height)
      const n = graph.nodes.find((m) => m.id === w.node)
      const seg = graph.segments.find((s) => s.id === w.seg)
      const across = w.axis === 'h' ? r.y1 - r.y0 : r.x1 - r.x0
      const along = w.axis === 'h' ? r.x1 - r.x0 : r.y1 - r.y0
      assert.ok(Math.abs(across - seg.width) < 1e-6, `${layout.name}: crossing at ${n.id} is ${across}px across`)
      assert.ok(Math.abs(along - depth) < 1e-6)
      const clearOf = Math.max(n.box.x0 - r.x1, r.x0 - n.box.x1, n.box.y0 - r.y1, r.y0 - n.box.y1)
      assert.ok(Math.abs(clearOf - gap) < 1e-6, `${layout.name}: crossing at ${n.id} is ${clearOf}px from the box`)
    }
  }
})

test('the stripes are thin: a quarter of each stripe tile, and a road takes 5', () => {
  const { stripe, space } = CONFIG.roads.crosswalk
  assert.equal(stripe / (stripe + space), 0.25)
  assert.equal(CONFIG.roads.main / (stripe + space), 5)
  assert.equal(CONFIG.roads.side / (stripe + space), 5)
})

test('the CSS that hides a too-short run of ticks follows the zoom instead of a fixed size', () => {
  const css = readFileSync(new URL('./RoadLayer.css', import.meta.url), 'utf8')
  assert.ok(css.includes('@container (width < 1em)'))
  assert.ok(css.includes('@container (height < 1em)'))
  assert.match(css, /\.roads__tick \{[^}]*font-size: var\(--tile\)/)
})

test('hiding a T\'s stem takes its crossings, its box and its rounds with it', () => {
  // In the wide map, c42 is a T: v4 through, h2 leaving east. Hide h2's
  // first block.
  const graph = buildGraph(wide, { width: 1440, height: 836, hidden: ['h2.0'] })
  const hidden = hideRule(graph)
  const pieces = roadPieces(wide)
  const at = (kind, node) => [...pieces.walks, ...pieces.boxes].filter((p) => p.kind === kind && p.node === node)
  assert.equal(graph.nodes.find((n) => n.id === 'c42').kind, 'through')
  assert.ok(at('walk', 'c42').length === 3)
  for (const p of at('walk', 'c42')) assert.ok(hidden(p), 'a crossing survived on a straight run')
  for (const p of at('box', 'c42')) assert.ok(hidden(p))
  // Both of the T's rounds are on the stem's corners, so both go.
  const rounds = (node) => pieces.fillets.filter((p) => p.node === node)
  assert.equal(rounds('c42').length, 2)
  for (const p of rounds('c42')) assert.ok(hidden(p), 'a round survived on a straight run')
  assert.ok(hidden({ kind: 'band', seg: 'h2.0' }))
  assert.ok(hidden({ kind: 'tick', seg: 'h2.0' }))
  // Everything elsewhere stays.
  assert.ok(!hidden({ kind: 'band', seg: 'h1.0' }))
  for (const p of at('walk', 'c41')) assert.ok(!hidden(p))
  for (const p of rounds('c41')) assert.ok(!hidden(p))
})

test('at every recorded size, every lane already has room for a car, so the room rule hides nothing', () => {
  for (const s of heroSizes) {
    const { hidden, tight } = resolveMap(mapFor(s), { width: s.hero[0], height: s.hero[1], copy: copyOf(s) })
    assert.deepEqual(hidden, [], s.viewport.join('×'))
    assert.deepEqual(tight, [], s.viewport.join('×'))
  }
})

// The room rule (resolveMap) is a safety net now. The merged map's short
// blocks either side of its side street held no car in these windows, and
// the rule hid the side street; every block of the uniform grid holds one.
test('in a window too short for the whole map, every lane still holds a car', (t) => {
  const report = []
  for (const s of rects.short.sizes) {
    const size = { width: s.hero[0], height: s.hero[1] }
    const layout = mapFor(s)
    const full = buildGraph(layout, size)
    for (const lane of full.lanes) assert.ok(lane.path.len >= laneMinimum(layout), `${s.viewport.join('×')}: ${lane.id}`)
    const { hidden, blocked, tight, graph } = resolveMap(layout, { ...size, copy: copyOf(s) })
    assert.deepEqual(tight, [], s.viewport.join('×'))
    assert.deepEqual(checkGraph(graph, layout), [], s.viewport.join('×'))
    report.push(
      `${s.viewport.join('×')} (${layout.name}): hidden [${hidden.join(', ')}]` + (blocked.length ? `, still too close [${blocked.join(', ')}]` : ''),
    )
  }
  t.diagnostic(report.join('\n'))
})
