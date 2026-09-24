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
import { hideRule, laneMinimum, offenders, pieceRect, resolveClearance, resolveMap, roadPieces } from './layout.js'

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const wide = read('./layouts/wide.json')
const compact = read('./layouts/compact.json')
const rects = read('./__fixtures__/copy-rects.json')

// A car's length and one tick with its gap, px, on a given map. Both shrink
// with the map's zoom.
const carOn = (layout) => CONFIG.car.length * CONFIG.world.pxPerM * roadsFor(layout).zoom
const tileOn = (layout) => {
  const { tick } = roadsFor(layout)
  return tick.length + tick.gap
}

// Which layout a recorded size gets, and the box that layout is drawn in.
const WIDE_FROM = 768
const wideSizes = rects.sizes.filter((s) => s.viewport[0] >= WIDE_FROM)
const phoneSizes = rects.sizes.filter((s) => s.viewport[0] < WIDE_FROM)
const boxes = [
  ...wideSizes.map((s) => ({ layout: wide, width: s.hero[0], height: s.hero[1], label: s.viewport.join('×') })),
  ...phoneSizes.map((s) => ({
    layout: compact,
    width: s.band[2] - s.band[0],
    height: s.band[3] - s.band[1],
    label: `${s.viewport.join('×')} band`,
  })),
]

const copyOf = (s) => ({ x0: s.copy[0], y0: s.copy[1], x1: s.copy[2], y1: s.copy[3] })
const required = (s) =>
  rects.required.widths.includes(s.viewport[0]) && s.viewport[1] >= rects.required.minViewportHeight

test('the wide map starts where CSS switches to it', () => {
  assert.equal(CONFIG.layout.wideQuery, `(min-width: ${WIDE_FROM}px)`)
  assert.equal(wide.media, CONFIG.layout.wideQuery)
  assert.equal(compact.media, `(max-width: ${WIDE_FROM - 1}px)`)
})

test('on phones, the street band starts 48px under the copy and fills the hero to its edges', () => {
  assert.ok(phoneSizes.length >= 6)
  for (const s of phoneSizes) {
    const [l, t, r, b] = s.band
    assert.ok(t - s.copy[3] >= CONFIG.roads.clearance, `${s.viewport.join('×')}: band is ${t - s.copy[3]}px under the copy`)
    assert.deepEqual([l, r, b], [0, s.hero[0], s.hero[1]], s.viewport.join('×'))
  }
})

test('every road is the same width, side streets included', () => {
  assert.equal(CONFIG.roads.side, CONFIG.roads.main)
})

test('both maps work at every recorded size', () => {
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
  const r = wide.reserve
  const inside = (x, y) => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1
  for (const n of wide.nodes) assert.ok(!inside(n.x, n.y), `${n.id} is inside the reserve`)
  const at = Object.fromEntries(wide.nodes.map((n) => [n.id, n]))
  for (const s of segmentsOf(wide)) {
    const [a, b] = [at[s.a], at[s.b]]
    const crosses =
      Math.min(a.x, b.x) < r.x1 && Math.max(a.x, b.x) > r.x0 && Math.min(a.y, b.y) < r.y1 && Math.max(a.y, b.y) > r.y0
    assert.ok(!crosses, `${s.id} runs through the reserve`)
  }
})

test('no road comes within 48px of the headline at 1280, 1440 or 1920px wide', () => {
  const sizes = wideSizes.filter(required)
  assert.ok(sizes.length >= 6, 'the fixture is missing required sizes')
  for (const s of sizes) {
    const graph = buildGraph(wide, { width: s.hero[0], height: s.hero[1] })
    const bad = offenders(graph, copyOf(s)).map((seg) => seg.id)
    assert.deepEqual(bad, [], `${s.viewport.join('×')}`)
  }
})

test('everywhere else, the runtime rule only hides what the map can lose', (t) => {
  const report = []
  for (const s of wideSizes) {
    const { hidden, blocked, graph } = resolveClearance(wide, {
      width: s.hero[0],
      height: s.hero[1],
      copy: copyOf(s),
    })
    assert.deepEqual(checkGraph(graph, wide), [], s.viewport.join('×'))
    if (hidden.length || blocked.length) {
      report.push(
        `${s.viewport.join('×')}: hidden [${hidden.join(', ')}]` +
          (blocked.length ? `, still too close [${blocked.join(', ')}]` : ''),
      )
    }
  }
  t.diagnostic(report.length ? report.join('\n') : 'no size needs anything hidden')
})

test('the wide map is a merged grid, not graph paper', (t) => {
  const { xs, ys } = wide.baseGrid
  // Spacing between the base grid's main roads varies by no more than ±30%.
  for (const lines of [xs, ys]) {
    const gaps = lines.slice(1).map((v, i) => v - lines[i])
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length
    for (const g of gaps) assert.ok(Math.abs(g / mean - 1) <= 0.3, `spacing ${g} vs mean ${mean.toFixed(3)}`)
  }

  // 20–30% of the base grid's interior segments are gone. A base segment is
  // still there if main-road segments on its line cover all of it.
  const at = Object.fromEntries(wide.nodes.map((n) => [n.id, n]))
  const mains = segmentsOf(wide)
    .filter((s) => s.kind === 'main')
    .map((s) => [at[s.a], at[s.b]])
  const covered = (axis, line, from, to) => {
    const along = axis === 'h' ? 'x' : 'y'
    const across = axis === 'h' ? 'y' : 'x'
    const spans = mains
      .filter(([a, b]) => a[across] === line && b[across] === line)
      .map(([a, b]) => [Math.min(a[along], b[along]), Math.max(a[along], b[along])])
      .sort((p, q) => p[0] - q[0])
    let reach = from
    for (const [lo, hi] of spans) if (lo <= reach + 1e-9 && hi > reach) reach = hi
    return reach >= to - 1e-9
  }
  let total = 0
  let gone = 0
  for (const x of xs) {
    for (let i = 0; i + 1 < ys.length; i++, total++) if (!covered('v', x, ys[i], ys[i + 1])) gone++
  }
  for (const y of ys) {
    for (let i = 0; i + 1 < xs.length; i++, total++) if (!covered('h', y, xs[i], xs[i + 1])) gone++
  }
  const share = gone / total
  t.diagnostic(`${gone} of ${total} base segments removed (${Math.round(share * 100)}%)`)
  assert.ok(share >= 0.2 && share <= 0.3)

  // And a side street cutting through the blocks. There were three until
  // September 24, when review found the map too busy.
  assert.ok(wide.roads.filter((r) => r.kind === 'side').length >= 1)
})

test('the road layer has a road and ticks for every segment, a box for every junction, a crossing on every road into a cross or T', () => {
  for (const layout of [wide, compact]) {
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
  for (const layout of [wide, compact]) {
    const roads = roadsFor(layout)
    const { gap, depth, stripe, space } = roads.crosswalk
    for (const kind of ['main', 'side']) {
      const stripes = roads[kind] / (stripe + space)
      assert.ok(Math.abs(stripes - Math.round(stripes)) < 1e-9, `${layout.name} ${kind} road takes ${stripes} stripes`)
    }
    const size = layout === wide ? { width: 1440, height: 836 } : { width: 390, height: 240 }
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

test('phones draw the same map zoomed out: every road size scaled, the clearance not', () => {
  const k = CONFIG.layout.zoom.compact
  assert.ok(k > 0 && k < 1)
  assert.equal(roadsFor(wide).zoom, 1)
  const r = roadsFor(compact)
  assert.equal(r.main, CONFIG.roads.main * k)
  assert.equal(r.side, CONFIG.roads.side * k)
  assert.deepEqual(r.tick, { width: 2 * k, length: 8 * k, gap: 10 * k })
  assert.equal(r.crosswalk.depth, CONFIG.roads.crosswalk.depth * k)
  assert.equal(r.clearance, CONFIG.roads.clearance)
  // The drawing and the graph both use the zoomed sizes.
  const { bands } = roadPieces(compact)
  const sizes = (list) => [...new Set(list)].sort((a, b) => a - b)
  const widths = sizes(bands.map((p) => Math.max(p.w[1], p.h[1])))
  assert.deepEqual(widths, sizes([r.side, r.main]))
  const g = buildGraph(compact, { width: 390, height: 240 })
  assert.deepEqual(sizes(g.segments.map((sg) => sg.width)), sizes([r.side, r.main]))
})

test('the CSS that hides a too-short run of ticks follows the zoom instead of a fixed size', () => {
  const css = readFileSync(new URL('./RoadLayer.css', import.meta.url), 'utf8')
  assert.ok(css.includes('@container (width < 1em)'))
  assert.ok(css.includes('@container (height < 1em)'))
  assert.match(css, /\.roads__tick \{[^}]*font-size: var\(--tile\)/)
})

test('hiding a T\'s stem takes its crossings and its box with it', () => {
  // In the wide map, c12 is a T: v1 through, h2w leaving east. Hide h2w.
  const graph = buildGraph(wide, { width: 1440, height: 836, hidden: ['h2w.0'] })
  const hidden = hideRule(graph)
  const pieces = roadPieces(wide)
  const at = (kind, node) => [...pieces.walks, ...pieces.boxes].filter((p) => p.kind === kind && p.node === node)
  assert.equal(graph.nodes.find((n) => n.id === 'c12').kind, 'through')
  assert.ok(at('walk', 'c12').length === 3)
  for (const p of at('walk', 'c12')) assert.ok(hidden(p), 'a crossing survived on a straight run')
  for (const p of at('box', 'c12')) assert.ok(hidden(p))
  assert.ok(hidden({ kind: 'band', seg: 'h2w.0' }))
  assert.ok(hidden({ kind: 'tick', seg: 'h2w.0' }))
  // Everything elsewhere stays.
  assert.ok(!hidden({ kind: 'band', seg: 'h1.0' }))
  for (const p of at('walk', 'c11')) assert.ok(!hidden(p))
})

test('at every recorded size, every lane already has room for a car, so the room rule hides nothing', () => {
  for (const s of wideSizes) {
    const { hidden, tight } = resolveMap(wide, { width: s.hero[0], height: s.hero[1], copy: copyOf(s) })
    assert.deepEqual(hidden, [], s.viewport.join('×'))
    assert.deepEqual(tight, [], s.viewport.join('×'))
  }
  for (const b of boxes.filter((x) => x.layout === compact)) {
    assert.deepEqual(resolveMap(compact, b).hidden, [], b.label)
  }
})

test('in a window too short for the whole map, the room rule hides roads until every lane holds a car', (t) => {
  const report = []
  for (const s of rects.short.sizes) {
    const size = { width: s.hero[0], height: s.hero[1] }
    const full = buildGraph(wide, size)
    assert.ok(full.lanes.some((l) => l.path.len < laneMinimum(wide)), `${s.viewport.join('×')} isn't short`)
    const { hidden, tight, graph } = resolveMap(wide, { ...size, copy: copyOf(s) })
    assert.deepEqual(tight, [], s.viewport.join('×'))
    assert.deepEqual(checkGraph(graph, wide), [], s.viewport.join('×'))
    for (const lane of graph.lanes) assert.ok(lane.path.len >= laneMinimum(wide), `${s.viewport.join('×')}: ${lane.id}`)
    report.push(`${s.viewport.join('×')}: hidden [${hidden.join(', ')}]`)
  }
  t.diagnostic(report.join('\n'))
})
