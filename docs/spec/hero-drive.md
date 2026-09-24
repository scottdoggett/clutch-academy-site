# Hero drive

The homepage hero rebuilt as a small city seen from above: white roads on the
brand red, blue traffic that obeys all-way stops, and one black car that a
visitor can take over and drive with a manual gearbox. The headline, subtext
and both CTAs stay as they are, in HTML. Everything behind and around them is
new.

✅ **Reviewed and approved**, September 24, 2026. Every recommendation in the
first draft was accepted, and the open questions were answered the same day
(§Decisions). **Phase 2 is built**: the road layouts, the road graph, the
server-rendered road layer, the headline check, and their tests. Phases 3–7
are still to come.

Legend as in `README.md`: ✅ decided, 🟡 recommended, ❓ open, 📎 pending asset.
Anything the brief states outright is ✅. What was 🟡 in the draft is now ✅
unless it's marked otherwise. Where the brief conflicts with the code, the
measurements, or another doc, it's flagged rather than silently resolved.

## Where this started

Three uncommitted things were in the tree when this spec was written.

1. **A prototype of this feature** in `src/components/home/drive/`: 7 files,
   2,233 lines, never mounted. It was a different design: roads laid out
   procedurally around the measured copy on every resize, road widths that
   scaled, a hand-rolled physics solver instead of planck.js, a five-speed box
   with an automatic clutch, a red player car, a handbrake on Space. ✅ Saved
   as one commit on the local branch **`prototype/hero-drive-v0`** (not
   pushed) and deleted from `overhaul` on September 24. Its arc-length Bézier
   turns live on in `graph.js`. Its keyboard guards, observer wiring and
   instanced tyre-mark shader are worth reading again in Phases 3–6.
2. **`Hero.jsx` and `Hero.css` edits** that dropped the photo. ✅ Kept. With no
   photo, the `h1` is the LCP element at every width.
3. **`three@^0.186.0` in `package.json`.** ✅ Kept. planck.js 1.5.0 gets added
   in Phase 4.

✅ **The headline is the working tree's "Finally learn manual, without the
stress".** The committed version read "Learn to drive manual without the
stress." The brief said to keep the existing headline without saying which,
and the working tree is what's been on screen during review. The eyebrow,
"Toronto · Manual Transmission Lessons", stays.

## Conflicts with existing docs and rules

- **`08-motion.md` rule 7, "No new loops."** Ambient traffic is a new loop that
  runs on its own. ✅ The brief is the sign-off, and the motion rules can bend
  for this. Rule 7 gets the hero traffic added to its list when Phase 3 lands.
- **`08-motion.md` rule 8, "Reduced motion means none."** The Drive button
  keeps working under reduced motion. That matches the About page's shift
  gate, which follows a pointer under reduced motion but never cycles on its
  own. Motion the visitor starts by pressing a button is allowed. Motion that
  starts itself isn't. ✅ A line gets added to rule 8 in Phase 3.
- **`08-motion.md` §The hero** described the photo, its Settle scale and the
  caption. ✅ Updated in Phase 2.
- **The Drive pill at 60% opacity fails contrast.** White at 60% over
  `--red-primary` blends to about 2.8:1. That fails 4.5:1 for text, and it
  breaks the CLAUDE.md rule that muted text on the red is solid `--cream`,
  never faded white. ✅ Its look is my call (§Entry). It stays quiet without
  fading its label below AA.
- **The `frontend-design` plugin** is installed as of September 24 and gets
  used for the Drive button, controls hint and HUD in Phases 4 and 5.

## Measured: where the copy lands

The whole road-layout problem turns on this, so it's measured, not guessed.

**Before the rework**, with the copy capped at 700px on the site column, one
normalised map couldn't match it. In normalised terms the copy's left edge
moved from 0.04 to 0.27 as the screen widened. Its right edge sat at 0.54 to
0.59 from 1280px up but reached 0.72 at 1024px and 0.95 on a portrait tablet.
Phones had no room at all: at 390px the copy came within 20px of the hero's
sides and 40px of its bottom, inside the brief's 48px clearance.

**The rework** (✅, from review):

- **From 768px up, the copy keeps to the left half of the hero** and the right
  half is open for the city. The column is centred, so capping the copy at 50%
  of it puts its right edge exactly on the hero's centre line at every width.
  The headline comes down to fit: `clamp(2.25rem, 4.4vw, 4.5rem)`, two lines
  up to about 1500px and three above. At 1920px that's 72px, down from 96px.
- **Below 768px, the hero grows a street band under the CTAs** and the roads
  live there. On phones the copy is a size smaller and the two buttons share
  a row (revised September 24), which roughly halves the copy's height and
  gives the band the room. Headline `clamp(2.25rem, 10.5vw, 3.25rem)`, 41px at
  390px; subhead 16px; eyebrow 12px, one line from 360px up.

After the rework, in Chrome on the dev server, after fonts loaded. The full
set is 32 sizes in `src/components/hero/__fixtures__/copy-rects.json`, eight
of them phones.

| Viewport | Hero | Copy box, px (L T R B) | Copy right edge |
|---|---|---|---|
| 390×844 | 390×780 | 20 88 370 389 | Street band below, 343px |
| 768×1024 | 768×960 | 31 325 384 684 | 0.50 |
| 1024×768 | 1024×704 | 41 229 512 519 | 0.50 |
| 1280×680 | 1280×616 | 51 183 640 469 | 0.50 |
| 1280×800 | 1280×736 | 51 243 640 529 | 0.50 |
| 1440×780 | 1440×716 | 120 224 720 524 | 0.50 |
| 1536×730 | 1536×666 | 168 163 768 535 | 0.50 |
| 1920×950 | 1920×886 | 360 267 960 651 | 0.50 |
| 1920×1080 | 1920×1016 | 360 332 960 716 | 0.50 |
| 2560×1440 | 2560×1376 | 680 512 1280 896 | 0.50 |

The viewports include real browser heights, not just screen sizes. A 1440×900
MacBook shows about 1440×780 once the browser's own toolbars are drawn, and a
1920×1080 Windows laptop at 125% scaling shows about 1536×730.

Re-record the fixture whenever the hero's copy, CSS or fonts change. The
steps are in `__fixtures__/record.md`.

## Layers

✅ Two drawing layers, generated from the same layout data so they line up
exactly.

| z (inside `.hero`) | Layer | Notes |
|---|---|---|
| 0 | Road layer, positioned elements | Under the text. Server-rendered, so the roads are there at first paint with no JavaScript. |
| 1 | The copy | Unchanged markup: eyebrow, `h1`, subhead, CTAs. |
| 2 | Car canvas, three.js | Over the text. Transparent, `pointer-events: none`. Cars, tyre marks, smoke. |
| 3 | Drive button, controls hint, HUD | Real HTML controls. |

- ✅ `.hero` has `position: relative; isolation: isolate; overflow: clip`, so
  the layers stack inside it and nothing leaks into the next section.
- The fixed nav at z 100, the consent banner at z 1100 and the Calendly popup
  all stay above the hero. The nav is 85% opaque, so roads and cars under it show
  through faintly. That's fine.
- ✅ Background is the current red, `--red-primary`, inherited from `body`. No
  new red.
- ✅ Camera is orthographic and looks straight down. One world unit is one CSS
  pixel, origin at the hero's top-left, x right, y down, so a DOM rect minus the
  hero's rect is a world rect. ✅ The simulation keeps DOM orientation and the
  renderer draws at `-y`, which is what the prototype did.

## Road layout

### Two layouts

✅ Two fixed layouts, chosen by the same media query in CSS and JS so the road
layer and the traffic never disagree. The query lives in `config.js` as
`layout.wideQuery`, and a test checks the JSON and the CSS agree with it.

| Layout | When | Drawn across |
|---|---|---|
| `wide` | `(min-width: 768px)` | The whole hero. The copy keeps to the left half. |
| `compact` | Below 768px, phones | A street band under the CTAs, not the whole hero |

JS reads `matchMedia` for the choice, not the hero's measured width. The media
query includes the scrollbar and the hero's width doesn't, so measuring would
disagree with CSS for about 15px either side of the breakpoint.

**`wide`.** One map from a 768px tablet to a 2560px monitor. It works because
the copy's right edge is on the centre line at every one of those widths
(§Measured). The first draft put the breakpoint at 1024px, with tablets on the
street band. In review that looked wrong: tablets didn't match either the wider
or the narrower views. Tablets now get the desktop treatment.

**`compact`.** ✅ The hero grows a street band, `.hero__streets`. On phones
the hero fills the first screen like it does on desktop, stacked as a column:
the copy, then the band, which takes whatever height the copy leaves, never
less than 240px. The band's top margin is the 48px clearance, so it starts
exactly 48px under the CTAs at every size, by construction, with no
measuring. It's full-bleed: its side margins cancel `.section`'s padding,
which is now published as `--section-pad-x` and `--section-pad-y` in
`globals.css` for this. The layout is normalised to the band, not the hero.
The road layer and, from Phase 3, the car canvas cover only the band, and
there's no driving. Measured band heights run from 240px, on anything
shorter than about 700px, to 419px on a 430×932 phone and 502px on a 600px
tablet.

### Data

✅ Authored once as data, normalised 0 to 1 across the layout's box, scaled at
runtime. Road widths are CSS pixels and don't scale. JSON, since the repo has
no TypeScript: `src/components/hero/layouts/wide.json` and `compact.json`.

```json
{
  "name": "wide",
  "media": "(min-width: 768px)",
  "baseGrid": { "xs": [0.595, 0.74, 0.895], "ys": [0.13, 0.3, 0.55, 0.715, 0.93] },
  "reserve": { "x0": 0, "y0": 0.2, "x1": 0.56, "y1": 0.85 },
  "nodes": [
    { "id": "t1", "x": 0.595, "y": -0.06 },
    { "id": "c11", "x": 0.595, "y": 0.13 }
  ],
  "roads": [
    { "id": "v1", "kind": "main", "nodes": ["t1", "c11", "c12", "j1", "c13", "c14", "c15", "b1"] },
    { "id": "ss1", "kind": "side", "nodes": ["j1", "j3"] }
  ]
}
```

- A road is a polyline through node ids. Consecutive pairs are segments, and
  every segment is horizontal or vertical. The grid is Toronto's, no diagonals.
  A segment's id is its road id and index, `v1.3`, stable at any size.
- A node outside 0–1 is a **portal**, an off-screen end where traffic leaves
  and enters. Every portal is at least a car length, 24px, off screen at every
  recorded size. In `wide` that's −0.06 and 1.06 vertically and −0.04 and 1.04
  horizontally. The compact band is short, so its bottom portals sit at 1.25.
- `baseGrid` records the main-road lines the map started from, so the tests can
  report how much was removed and how much spacing varies.
- `reserve` is the headline envelope in normalised terms. No node or segment
  may enter it. The real guarantee is the pixel check against the fixture.
- An `about` string in each file says what the map is and what was removed.

### The wide map

Downtown is everything east of x 0.595. Main roads cross the whole hero at
the top, y 0.13, and the bottom, y 0.93. The headline sits in one big open
block between them.

- **Base grid:** main roads at x 0.595, 0.74 and 0.895, and y 0.13, 0.30,
  0.55, 0.715 and 0.93. Vertical spacing varies from −17% to +25% of the mean.
- **Removed:** 6 of the 22 interior segments, 27%. V2 is gone between H2 and
  H3 and between H4 and H5, V3 between H4 and H5, and H2 and H3 between V2 and
  V3. H4 between V1 and V2 is a side street instead. The blocks merge into two
  L-shapes, a tall block the height of three, and a long one across the bottom.
- **Side streets, three:** across the merged middle block from V1 to V3, down
  the long bottom block, and the one that stands in for H4.
- **Left of the copy:** one street off the top road to the top edge, and two
  off the bottom road to the bottom edge. They fill the left side on wide
  screens without entering the block.
- **Junctions:** 4 crosses, 16 Ts and 2 corners. 16 portals, 42 segments,
  84 lanes.

A fourth, vertical side street was drawn and cut. At 768px the downtown is
only 311px across, and it left slivers of block 22px wide.

### The phone map

Revised September 24: the first phone map was one main road with three
evenly spaced streets off it, and read as too symmetrical.

- **Main roads:** one across the top of the band at y 0.16, and one across
  the lower right at y 0.74, from the second street to the right edge.
- **Streets down**, at uneven x: 0.13 and 0.43 run to the bottom edge; 0.87
  stops at the lower road; 0.64 is a side street from the top road that
  becomes a main road where it crosses the lower one and carries on off the
  bottom edge. So the grid jogs instead of repeating.
- **Side streets, two:** a short one across the left block at y 0.46, and the
  one at x 0.64.
- **Junctions:** 1 cross, 8 Ts. 6 portals.
- It has to work from a 320×240 band to a 767×502 one.
- **Drawn zoomed out, at 0.6** (`CONFIG.layout.zoom.compact`). At full size the
  roads crowded the band: the shortest block left 1.2px of road between its
  two crossings. So every road size on the phone map is 0.6 of the desktop
  one: 24px main roads, 14.4px side streets, the ticks and crossings to
  match, and from Phase 3 the cars. The map itself is unchanged. Now the
  shortest stretch between two crossings is 27.6px, every block has its
  ticks, and the tightest gap between parallel roads is 43px.

### Rules for the map

✅ From the brief, and asserted by tests where a test can check them:

- Main roads come from a base grid whose spacing varies by up to ±30% from the
  mean. Then 20–30% of interior segments are removed so blocks merge into larger,
  uneven shapes. The percentage counts the downtown grid, since everything west
  of it is removed for the headline anyway.
- Side streets are 60% of main-road width, the same white with the same ticks.
  They cut through blocks and end on another road at both ends. No side street
  runs off an edge.
- No dead ends anywhere. Every non-portal node has at least two roads.
- Junctions are 4-way crosses, T-junctions, or plain 90° corners. Traffic
  handles all three.
- The graph is fully connected, and drivable that way: from every way in, a
  car can reach every way out without a U-turn, and no lane is a trap.
- No road of any kind crosses the headline block, and every road edge stays at
  least 48px from it.
- Every lane holds at least one car, and parallel roads leave at least a car
  length of red between them, at every recorded size. The tightest is 34.9px,
  on the phone band.
- Every visitor sees the same map on every load. The map keeps its shape on
  resize and never regenerates.

✅ Values:

| | Value |
|---|---|
| Main road | 40px, two 20px lanes. At 6px per metre that's 6.7m, two 3.3m lanes. 24px on the phone map (zoom 0.6). |
| Side street | 24px, two 12px lanes. 14.4px on the phone map. |
| Centre ticks | Black, 2px wide, 8px long, 10px gaps, on both kinds of road |
| Zebra crossings | ✅ Added in review: on every road into a cross or a T, a stack of black stripes across the full width of the road, 3px clear of the junction box and 10px long, each stripe running the way the road does. Stripes are 2px with 6px between, so a main road takes 5 and a side street 3. They started at 4px with 4px between and were thinned in review as too heavy; 2px matches the centre ticks. Corners have none, since traffic doesn't stop there. Cars stop behind them from Phase 3. They replaced grey stop lines across the right-hand half of the road, which were tried first the same day. |

### Keeping clear of the headline

**The block.** ✅ The reserved block is the `.hero__copy` box: eyebrow, `h1`,
subhead and CTAs together, measured as a box even where the text inside is
narrower. A white road behind cream or white type would make it unreadable, so
the CTAs need the same clearance as the headline.

**The limits.** From the fixture, at every width from 768px and every
recorded height:

| | Limit, normalised | Map | Tightest case |
|---|---|---|---|
| First road east of the copy | ≥ 0.5 + 68px ÷ width | 0.595 | 768px: needs 0.589 |
| Top main road centre | ≤ (copy top − 68px) ÷ height | 0.13 | 1280×600: needs 0.140 |
| Bottom main road centre | ≥ (copy bottom + 68px) ÷ height | 0.93 | 1280×600: needs 0.927 |

68px is the 48px clearance plus half a main road.

**The runtime check.** ✅ `HeroStage.jsx` measures the copy box after mount,
after fonts load, and on every resize, debounced 150ms. `resolveClearance()` in
`layout.js` tests each segment's band, widened by 48px, against it. A segment
that overlaps is hidden in the road layer, and from Phase 3 in the traffic
graph, but only if the map still passes every check in `checkGraph()` without
it. Otherwise it stays and the console gets a warning naming it, once per
change. `hideRule()` in `layout.js` decides the knock-on pieces: a junction box
left on a straight run goes, and so do the crossings at a node that's no
longer a stop, like a T that's lost its stem.

✅ To make hiding safe, `wide` follows one more rule: **no junction inside
`reserve`.** A segment that could cross the copy then runs from junction to
junction across it, and hiding it turns a cross into a T or a T into a corner.
It never leaves a stub.

**When it fires.** At none of the 27 recorded sizes. The first version of the
map put the bottom road at 0.92, which came 4px inside the clearance at a
1280×600 window, so it moved to 0.93. The check still covers what the fixture
can't: shorter windows, zoomed type, and font changes. Tried live at a
1100×520 window, it hid three segments and a junction square.

✅ Nothing is ever hidden before JavaScript runs. The server-rendered road
layer shows the full map, which is correct at every recorded size.

### Drawing the roads

✅ **One road layer per map, rendered on the server** by `RoadLayer.jsx` as
plain positioned elements. Both are in the HTML, and CSS shows the one that
matches the media query.

Every piece sits at a fraction of its box plus a pixel offset, from custom
properties: `left: calc(var(--x) * 100% + var(--dx) * 1px)`, and the same for
top, width and height. So a 40px road is 40px and a crossing sits 3px clear
of its junction at any size, CSS rescales everything for free, and no
JavaScript is involved. Four kinds of piece, painted in this order:

| Piece | What it is |
|---|---|
| Road | A white band from junction centre to junction centre |
| Junction box | White, as big as the junction really is: 24×40 where a side street meets a main road. Mostly it lands on road that's already white; at a corner it fills the outside of the bend. |
| Centre ticks | One strip per segment, from the crossing (or box edge) at one end to the other. Each tile is one 8px tick with 5px of gap either side, and `background-repeat: space` draws only whole tiles and spreads them evenly. A tick is never cut short, and every run starts and ends the same way. A run too short for even one whole tick, as between two crossings on the shortest blocks, draws none: the strip is a size container, and a container query hides the `::before` the ticks are drawn on. The query is "narrower than 1em", with the strip's font size set to one tile, because a container query can't read a custom property but does measure em against the container. So it follows the map's zoom with no number repeated in the CSS. |
| Zebra crossing | See §Rules for the map. Drawn the same way as the ticks, one stripe per tile. |

Tested at every recorded size: no tick touches a junction box or crossing,
and no crossing touches another. 24 of the 1,144 tick runs across all those
sizes are too short for a whole tick and draw none, all of them on the
desktop map's two shortest blocks at tablet widths. Every phone block has
ticks. In Chrome, all 241 pieces
render within 0.007px of the geometry the tests check.

**Why not the SVG.** The first build drew the roads as one inline SVG,
stretched to the hero with `preserveAspectRatio="none"` and non-scaling
strokes. It kept widths right, but it put each road's ticks on one long dashed
line from junction centre to junction centre, with white squares painted over
the junctions. Wherever a square's edge fell, it cut a tick at an arbitrary
point. Review caught it. A stretched SVG can't place anything at "this far
across, minus 12px", so neither exact tick runs nor crossings were possible.
The rebuild also removes the one Safari risk the SVG had, dash lengths under
non-scaling strokes. `background-repeat: space` has been in Safari for years.

**Weight.** The two layers are 241 elements, 33KB of HTML, 2.2KB gzipped. Next
also embeds a server component's output in the hydration payload, so the
homepage grew about 4.8KB gzipped in all. Zero terms are left out of each
piece's style to keep that down.

The layer is `aria-hidden` and not an LCP candidate.

### Resize

✅ The road layer needs nothing, because CSS rescales it on every frame. The headline
check re-runs 150ms after resizing stops. From Phase 3, the three.js world
rescales on the same debounce:

- Lanes and junctions are recomputed in pixels from the same normalised data.
- Each traffic car keeps its lane and its fraction along it, so it stays on its
  road.
- The player car keeps its normalised position, clamped inside the walls.
- Tyre marks and smoke are cleared. They'd no longer line up with the roads,
  and resizes are rare.
- The renderer resizes, with device pixel ratio capped at 2.

While a resize is being dragged, cars can sit off their roads for up to 150ms.
Acceptable.

## Road graph

✅ Built from the layout data at runtime, in `graph.js`, pure and without
three.js:

- Nodes are road nodes. A node's **kind** comes from its degree and shape:
  cross, T, corner, or portal.
- Each road segment becomes two **lanes**, one per direction, offset to the
  right of travel by a quarter of the road's width. Right-hand traffic. A lane
  starts and ends at the edge of the junction box, or at the portal.
- The **junction box** at each cross or T is a rectangle as wide as the crossing
  road and as long as the through road is wide.
- **Movements**: for each lane arriving at a junction, the lanes it may leave
  by. Straight, left or right, whichever exist. Never the reverse lane of the
  same road, so no U-turns anywhere.
- **Turn paths** through the box are arcs walked by arc length, so speed along a
  turn is real speed. ✅ The prototype's quadratic Bézier through the corner
  point, with 16-sample arc-length tables, built once per movement.
- Corners get a turn path but no box reservation. Two lanes through a corner
  never cross. Neither do the two lanes of a **through** node, which only
  exists when the headline check has hidden a T's stem.
- `checkGraph()` holds every rule a map must pass: no dead ends, one piece,
  every way out reachable from every way in, no lane a car can't leave, side
  streets ending on roads, and no segment so short its junction boxes overlap.
  The tests run it on both maps at every recorded size, and the headline
  check runs it before hiding anything.

## Ambient traffic

### Behaviour

✅ From the brief:

- Cars follow their lane, keep a following distance from the car ahead, and slow
  to a stop at each junction.
- Crosses and Ts work as all-way stops with a reservation. A car enters the box
  only when it's clear, first come, first served. No two cars ever overlap in
  ambient mode.
- At each junction a car picks at random among the valid exits. No U-turns.
- A car that leaves by a portal despawns and respawns at a random portal
  entry, so the count stays constant.
- Car count is one per 90,000px² of the layout's box, clamped to 6–16. The
  density constant lives in config.

🟡 How that works in practice:

| | |
|---|---|
| Speeds | Cruise 36–44 km/h per car, which is 60–73px/s. Turns at 15 km/h. Accelerate at 2.5 m/s², brake at 3.5 m/s², emergency up to 8 m/s². |
| Following | 1.2s time gap plus 1.5m, so about 9px bumper to bumper when stopped. |
| Stopping | A full stop at the box edge, 0.4s dwell, then join the queue. |
| Reservation | A car enters when all three are true: the box is empty and unreserved, its chosen exit lane has room for its full length beyond the box, and it's first in arrival order. It holds the box until its rear clears. The second condition is "don't block the box", and it's what stops gridlock across neighbouring junctions. |
| Gridlock guard | A car that has waited 6s because its exit has no room picks another valid exit. |
| Spawning | Into a portal entry lane with at least two car lengths free. If none has room, try again next frame. |
| Start | Cars placed along lanes, never inside a box, from a seeded random generator, so the first frame is the same for everyone. |
| Randomness | Turn choices and respawns use the same seeded generator. Runs are reproducible in tests and in debugging. |
| Compact minimum | The compact band clamps at 4 cars, not 6. Six cars in a 360×240 band is a traffic jam. |

**Physical bodies in the way.** In play mode the player car and recovering cars
don't follow lanes. Traffic treats any body in its lane corridor ahead as the
car ahead, and any body touching a junction box as an occupied box. If you park
in a junction, traffic waits for you.

**The black car.** It's ordinary traffic until someone takes it over. 🟡 It
prefers exits that stay on screen, so it's almost always visible when Drive is
pressed. If it has to leave, it re-enters at once instead of waiting for a free
slot. If Drive is pressed while it's between portals, it enters at its next
portal and control starts there.

## Car look

✅ Flat, top-down, no lighting, no 3D models. A rounded-rectangle body, a darker
windscreen and rear window, two small headlights.

- 🟡 24×11px, which is 4.0×1.83m at 6px per metre, hatchback proportions.
  On the phone map, 0.6 of that, like its roads (`CONFIG.layout.zoom`).
- 🟡 Drawn in a fragment shader, not from textures. One instanced mesh for all
  cars, per-instance colour, anti-aliasing in the shader. It stays crisp at any
  pixel ratio with no image assets, in one draw call.
- ✅ Traffic blue goes in a token. 🟡 `--car-traffic` in `tokens.css`, starting at
  `#2457C5`. It reads on white road and separates from the red by hue, since
  the two are close in lightness. You're tuning it anyway.
- ✅ The player car is `--black`.
- 🟡 The black car's glass has to be *lighter* than its body, a dark grey, or the
  windows vanish. "Darker windscreen" can't work on a near-black car.
- Headlights are `--cream`.
- The engine reads colours from the computed tokens at start, so `tokens.css`
  stays the only source.

## Play mode

### Entry

✅ A quiet ghost pill in a hero corner with a steering-wheel icon and the word
"Drive". A real `<button>` with an `aria-label`, reachable by keyboard.

- 🟡 **Bottom-right** of the hero, inset 24px. That's where the HUD appears, so
  the pill hands over to the HUD in the same spot.
- 🟡 It sits on a hero-red fill, not a transparent one. On red it looks exactly
  like a ghost pill. Over a white road it stays legible.
- 🟡 Idle colours per §Conflicts: `--chrome` label and icon, faint border, full
  white on hover and focus. The hover and focus change is a CSS transition on
  `--transition-reduced`, as rule 11 of `08-motion.md` requires.
- Its hit area is at least 44px tall, even where the visible pill is smaller.
- It comes after the CTAs in DOM order, so Tab goes Book, See Packages, Drive.
- The steering-wheel icon is an inline SVG in the 24×24 line-icon style of the
  gear-lever bullet.
- 🟡 `aria-label="Drive the black car with your keyboard"`. WCAG 2.5.3 needs the
  accessible name to contain the visible word, and this one starts with it.

✅ On press, the black car leaves traffic and is under your control from
wherever it is.

- 🟡 A ring pulses once around it, about 1s, so you can find it.
- 🟡 Starting gear: N if it's nearly stopped, otherwise the highest gear that
  keeps the engine at 2,000 rpm or more, clutch engaged. At a 40 km/h cruise
  that's 3rd.
- ✅ A controls hint appears for about 4s and then fades: **WASD drive · ↑↓ shift
  · Shift clutch · Esc exit**. 🟡 It sits just above the HUD in an
  `aria-live="polite"` region, so a screen reader hears it once.

### Keys

| Key | Action |
|---|---|
| W | Throttle |
| S | Brake. In R, see below. |
| A / D | Steer. 🟡 ← and → do the same. |
| ↑ / ↓ | Shift up or down one step through R N 1 2 3 4 5 6. Key repeat is ignored. |
| Shift, either one, held | Clutch |
| Esc | Exit |

- ✅ **Reverse.** The brief reads "S brake (and reverse throttle when in R)".
  In R, S is the throttle and drives backwards, and W is the brake.
- ✅ While driving, `preventDefault` on the arrows, WASD and Space so the page
  doesn't scroll. Space does nothing else. Released on exit.
- 🟡 Pedals and steering ease in and out over about 150ms. Keys are on or off,
  and a car that snaps to full lock reads as broken.
- 🟡 Keys are ignored while Cmd, Ctrl or Alt is held, so browser shortcuts still
  work. Held keys clear on window blur, since a key released elsewhere never
  sends its keyup.

### Focus

🟡 Driving keys only work while focus is inside the hero. That's what makes
single-letter keys acceptable under WCAG 2.1.4.

- On Drive, focus moves to the HUD, a `tabindex="-1"` group labelled "Driving".
  Tab reaches the HUD's × button.
- If focus leaves the hero, driving ends as if Esc was pressed. That covers
  tabbing away, clicking the nav, and the Calendly popup opening, whose iframe
  takes focus.
- A click inside the hero that doesn't land on a control keeps focus on the HUD.
  People click a game area to focus it, and that shouldn't end the game.

### Exit

✅ Esc, or a small × beside the gear indicator.

- The black car rejoins traffic at the nearest lane, by the same recovery path
  as a knocked car, described in §Physics.
- Focus returns to the Drive button.
- Tyre marks carry on fading as normal. The prototype wiped them on exit; this
  doesn't.
- The HUD fades out and the pill comes back.

### Pausing

✅ Pause the simulation when the hero scrolls out of view, and when the tab is
hidden. 🟡 Paused means the animation loop stops, not that it runs and skips
work. Resuming clears held keys and restarts the clock, so there's no jump.

## Driving and physics

✅ planck.js with zero gravity for car bodies and collisions. Lateral friction
impulses every step give grip and a controlled drift, the standard top-down car
approach.

### Units

🟡 **planck runs in metres, not pixels.** planck caps how far a body moves per
step, and its tolerances assume objects 0.1–10 units across. A 24-unit car at
450 units a second is outside that range. Config holds `pxPerM: 6`. Everything
physical, including the gearbox, works in SI units. Everything drawn works in
pixels, and the conversion happens in one place.

🟡 Fixed 1/120s step, at most 8 steps per frame. Smooth on 120Hz screens, and
16 bodies cost nothing.

### The player car

✅ Drives anywhere in the hero: on roads, off them, across blocks, over the
headline. Lanes mean nothing to it. Grip is the same on and off road. Arcade
handling, not a simulation. It should drift a little under hard steering at
speed and under hard braking.

🟡 How:

- A dynamic box body, 4.0×1.83m, marked as a bullet so it can't tunnel through a
  car at top speed.
- Two virtual axles. At each one, work out the sideways velocity and apply an
  impulse to cancel it, capped at that axle's grip. Anything over the cap slides.
  That's the drift.
- Rear grip drops to 75% under hard braking, which is weight moving forward, and
  under wheelspin. The rear steps out. Front grip stays put, so it's recoverable.
- Steering lock is 32° at walking pace, falling to about 45% of that at top
  speed, so it's twitchy when slow and stable when fast.
- The drive force at the rear axle comes from the gearbox. Brakes oppose
  velocity, up to about 9 m/s².

### Walls

✅ The hero's edges are soft walls. The car bounces off and loses some speed.
🟡 A static chain around the hero with restitution 0.35. The top wall is the
bottom of the fixed nav, not the hero's top edge, so the car can't hide under
the nav. Traffic passes through the walls to reach its portals, since walls only
touch dynamic bodies.

### Traffic as physical bodies

✅ Ambient cars are kinematic while they follow lanes. When the player hits one,
it switches to dynamic and takes a real knock: it slides and spins according to
the impact.

🟡 Making that work in planck:

- The planck world is created the first time someone presses Drive. Ambient
  traffic before that is plain JavaScript with no physics, which is why phones
  never need planck.
- Each kinematic car gets its velocity set every step, so it arrives exactly at
  the pose the traffic code wants. Moving kinematic bodies by teleporting them
  breaks contact handling.
- The catch: a kinematic body has infinite mass, so the first contact would
  bounce the player off like a wall and leave the other car unmoved. So when the
  player or a recovering car first touches a kinematic car, the contact is
  disabled for that one step, and after the step the car switches to dynamic at
  its current lane velocity. The next step resolves the contact between two
  real masses. The overlap lasts about 8ms, too short to see.
- All cars have the same mass. A knocked car's brakes are locked and its grip
  reduced, so it slides and spins instead of rolling away.

### Recovery

✅ Once a hit car settles, or after about 2s, it straightens out, drives to the
nearest lane in a direction that needs no U-turn, rejoins traffic, and blends
smoothly back to kinematic lane following. No teleporting. Cars that are
recovering ignore junction reservations until they've rejoined, so a knock
can't turn into a pile-up that never clears.

🟡 Details:

| Step | Rule |
|---|---|
| Settled | Under 0.5 m/s and turning under 0.3 rad/s, or 2s after the impact, whichever comes first |
| Target | The nearest lane point where the lane runs within 90° of the car's heading, outside any junction box, with a gap long enough for the car |
| Drive | Pure pursuit toward a point 1.5 car lengths ahead along that lane, at 10 km/h |
| Blend | Within 0.3m of the lane centre and 10° of its heading, blend position and angle into the lane pose over 0.5s, then go kinematic |
| Nudges | A recovering car knocks another car only above 1 m/s of closing speed. Gentle touches don't spread the chaos. |
| Stuck | A car that hasn't rejoined after 8s fades out and respawns at a portal. It's a safety net for a car pinned against a wall, not a normal path. |

The same path brings the black car back into traffic when driving ends.

## Gearbox and engine

✅ This is the point. It's a manual school.

- Gears in order: R, N, 1, 2, 3, 4, 5, 6. ↑ shifts up one step, ↓ down one step.
  Shift is the clutch, held.
- With the clutch engaged, engine rpm comes from wheel speed and the gear ratio.
  Idle is 900, redline 7,000, and the rev limiter bounces at redline.
- With the clutch held, or in N, the throttle revs the engine freely.
- Shifting without the clutch grinds. The shift doesn't happen, the gear
  indicator shakes briefly, and the car keeps its gear. 🟡 Every shift, including
  into and out of N, needs the clutch. One rule is easier to learn than a rule
  with exceptions.
- If the clutch engages and the resulting rpm is below 600, the car stalls. It
  puffs grey smoke from the rear, bogs down and slows hard for about 0.8s, then
  the engine re-engages on its own in the same gear. No manual restart.
- 1st and R have launch assist. Letting the clutch out from a stop in 1st or R
  slips the clutch smoothly and doesn't stall. Starting in 2nd or higher from a
  stop stalls.
- Downshifting into a gear that would put rpm over redline is allowed. It hits
  the limiter and brakes the car hard, with a short puff of smoke from the rear
  tyres.
- Every ratio, threshold and timing is in one config object.

### Numbers

🟡 Real ratios from a typical six-speed hatchback. A driving school's gearbox
should behave like a real one, and at 6px per metre the speeds come out right
for the size of the hero.

| Gear | Ratio | Speed at 7,000 rpm | px/s | Stalls below, at 600 rpm |
|---|---|---|---|---|
| R | 3.45 | 58 km/h | 96 | Never, launch assist |
| 1 | 3.36 | 59 km/h | 99 | Never, launch assist |
| 2 | 2.09 | 95 km/h | 159 | 8 km/h |
| 3 | 1.47 | 136 km/h | 226 | 12 km/h |
| 4 | 1.10 | 181 km/h | 302 | 16 km/h |
| 5 | 0.87 | 229 km/h | 382 | 20 km/h |
| 6 | 0.73 | 273 km/h | 456 | 23 km/h |

Final drive 4.1, tyre radius 0.31m. Drag stops the car well short of 273 km/h.
It's arcade. Torque follows a simple curve, soft low down, flat through the
middle, tailing off towards redline, times a `torqueScale` tuned in Phase 5 so
pulling away feels lively instead of realistic.

### Rules the brief leaves open

🟡 **When the stall check runs.** At the moment the clutch engages, and on every
step while it stays engaged in 2nd or higher. Braking to a stop in 3rd without
the clutch stalls, as it would in a real car. That's worth learning.

🟡 **1st and R never stall.** The launch assist covers crawling as well as
pulling away. With no throttle the car creeps at idle, about 7.6 km/h in 1st,
the way a careful foot makes a real car creep.

✅ **The stall loop.** "Re-engages on its own in the same gear" loops if the car
has stalled at a standstill in 3rd. It restarts, re-engages at 0 rpm, stalls
again, every 0.8s, with smoke each time. So after a stall the engine restarts
with the drive disconnected, as if the clutch were in. It re-engages on its own
as soon as the gear can hold 600 rpm or more, or straight away in 1st and R. In
2nd and up at a standstill it waits until you press and release the clutch or
change gear. The HUD shows the gear dimmed while it waits.

🟡 **Wheelspin.** Letting the clutch out in 1st or R with the engine above 4,500
rpm and the throttle past halfway spins the rear wheels for a moment. Rear grip
drops and tyre marks draw.

🟡 **Engaging a gear against the direction of travel.** R while rolling forward
faster than 1 m/s, or 1st while rolling backward. It grinds, the rear wheels
lock and smoke to a stop, then the gear engages.

🟡 **Over-rev downshift.** The check runs when the clutch engages, not when the
lever moves, because the lever moves with the clutch held. The engine braking
is about 9 m/s² until wheel speed brings rpm back under 7,000, with rear tyre
marks for as long as it lasts.

### Shape of the module

✅ Pure logic, no three.js, no DOM, so it can be unit tested.

```js
const box = createGearbox(CONFIG.gearbox)
box.shift(+1)  // 'ok' | 'grind' | 'end' (already in 6th or R)
box.step(dt, { throttle, clutch, wheelSpeed })
// → { driveForce, brakeDecel, rpm, gear, state, events }
// state: 'running' | 'free' (clutch in or N) | 'stalled' | 'waiting' | 'overrev'
// events: 'grind' 'stall' 'restart' 'overrev' 'limiter' 'wheelspin'
```

Physics calls `step` every physics step and turns `events` into smoke, marks
and HUD reactions. The gearbox never knows they exist.

## HUD

✅ Only visible while driving, bottom-right of the hero. White and black on the
red, machined, not gamey, in the site's type.

- A small H-pattern: six forward gates plus reverse, with a dot at the current
  gear. The dot travels through neutral between gates, never straight across.
- The gear as a large numeral, R, N or 1–6.
- A thin rpm bar with a redline mark.
- A small clutch lamp that lights while Shift is held.
- The × to exit, next to the gear.

🟡 Choices:

- **Reverse gate.** A fourth slot at the top left, outboard of 1–2, so the
  pattern reads R 1 2 3 4 5 6 left to right. The About page's gate has no
  reverse, so there's nothing to match. Many six-speeds put R there. If the
  school's training car puts it somewhere else, it's a one-line change.
- **Dot routing.** The same route rule as `ShiftGate.jsx`: back to the neutral
  plane, across, into the slot. It travels on `EASE_SHIFT`, with the duration
  from path length and a short floor. When shifts come faster than the dot can
  travel, the dot re-routes from wherever it is.
- **Numeral** in `--font-display`, weight 800, tabular figures.
- **Rpm bar** from 0 to 8,000, with the redline mark at 7,000. The limiter shows
  as a flicker at the mark.
- **Stall** dims the numeral while the engine is off or waiting.
- **Grind** shakes the indicator: a short sideways shake on `power2`, no
  elastic or bounce eases.
- **Plate.** The HUD sits on a hero-red plate with a hairline border, so the roads
  and cars under it don't show through. It's above the car canvas.
- **Per-frame values skip React.** The rpm bar is written straight to a
  transform through a ref from the animation loop. React state changes only on
  gear, clutch, stall or grind, so the HUD never re-renders 60 times a second.
- **GSAP only for the HUD and UI transitions,** never for the simulation. That
  covers HUD in and out, the hint fade, the dot's travel and the grind shake.
  All of it goes under `gsap.matchMedia(MOTION_OK)`. Under reduced motion the dot
  jumps, and a grind shows a static state for 0.4s instead of the shake.
- `aria-hidden` apart from the × button and the hint's live region. Gear numbers
  read aloud 60 times a minute would help nobody.

## Tyre marks

✅ Marks draw on hard braking, wheelspin, drift, meaning sideways slip over a
threshold, and collisions. Two thin dark strips per axle, one per wheel, drawn over
everything including the text. Each mark fades to nothing over about 10s.
Segments live in an instanced mesh with a birth time per instance, and the
shader does the fade. A fixed pool size, recycling the oldest.

🟡 Values and mechanics:

| | |
|---|---|
| Strip | 1.5px wide, `--black` at 55% |
| When | Brake past 80% above 15 km/h, all four wheels. Wheelspin, rear. Sideways slip over 1.5 m/s at an axle, that axle. A knocked car sliding, same slip rule. |
| Emission | One segment per wheel every 3px travelled, so a strip is continuous at any frame rate |
| Pool | 6,000 segments, a ring buffer. About 300 segments a second while sliding, so 10s fits. |
| Fade | The shader computes alpha from `uTime` minus birth time. The CPU sets one uniform per frame and nothing per mark. |
| Upload | Only the ring slots written that frame, via `addUpdateRange` |

## Smoke

✅ Grey-white sprite particles that grow and fade over about 1s, for stalls,
over-rev downshifts and hard collisions. Pooled, capped.

🟡 Pool of 160. Each puff grows from 6px to 22px, starts at 50% opacity, lives
1s, and drifts a little. Soft round falloff drawn in the shader, no texture.

| Trigger | Puffs |
|---|---|
| Stall | 6 from the rear, at the exhaust |
| Over-rev downshift | 4 per rear wheel over 0.3s |
| Grinding into the wrong direction | Same as over-rev |
| Hard collision, impulse over threshold | 8 at the contact point |

## Phones, touch and reduced motion

✅ Touch devices and viewports under 768px get ambient traffic only. The Drive
button isn't rendered at all.

- ✅ "Touch" means not `(hover: hover) and (pointer: fine)`, the test the
  About gate uses. A touchscreen laptop with a trackpad still gets Drive. An iPad
  with a keyboard doesn't, because it reports a coarse pointer.
- ✅ **Drive's line is the brief's 768px.** The first draft hid it below 1024px,
  because tablets were on the street band. Tablets now get the wide map, so a
  mouse-and-keyboard window from 768px up can drive.

✅ With `prefers-reduced-motion`, the roads and parked cars are drawn and the
traffic doesn't move. Drive still works, since pressing it is an explicit
choice.

- 🟡 Parked means the seeded start positions, stopped in their lanes. The engine
  draws one frame and stops the loop.
- 🟡 While driving under reduced motion only your car moves, plus any car you
  knock. The rest stay parked, and knocked cars recover into a parked spot.
  Marks and smoke still show, since they're the result of what you did.
- The setting is watched live, like the reviews marquee.

## Loading and performance

✅ three.js and planck.js load lazily as separate chunks after first paint.
Before they arrive, the roads are already there, so the hero is never empty and
WebGL never delays LCP. All three.js code runs client-side, from a `useEffect`
with a dynamic import, so static generation is unaffected. The loop pauses off
screen and in hidden tabs. Device pixel ratio caps at 2. Target 60fps on a
mid-range laptop with 16 cars, a full mark pool and active smoke. Everything is
disposed on unmount.

🟡 How:

- **Two chunks.** `ambient` holds three.js, the traffic code, marks, smoke and
  the renderer. It loads after the `load` event, at the next idle moment with a
  2s ceiling. Safari has no `requestIdleCallback`, so it falls back to a
  timeout. `drive` holds planck, physics, input and the gearbox. It starts
  loading when the Drive button is hovered or focused, and at the latest when
  it's pressed. Phones and touch devices never download it.
- **Skip the ambient chunk** when WebGL isn't available, when
  `navigator.connection.saveData` is on, or when the hero was never on screen.
  The roads remain. If WebGL fails or the context is lost later, the
  canvas goes away, the roads stay, and the Drive button hides.
- **Cars fade in once,** over `DUR_BASE`, after the chunk is ready *and* the
  hero timeline has finished at 1.2s. One thing moving at a time, per rule 3.
  Under reduced motion they just appear.
- **Renderer:** `alpha: true`, `antialias: false` since the shaders do their own
  anti-aliasing, and `powerPreference: 'low-power'`. A decoration shouldn't
  wake a laptop's discrete GPU.
- **Draw calls:** four. Marks, cars, smoke, and the takeover ring. No per-frame
  allocations in the loop.
- **Disposal:** geometries, materials, the renderer, then `forceContextLoss()`
  so the WebGL context is freed at once. Browsers cap live contexts, and
  bouncing between routes creates new ones. Also the planck world, observers
  and listeners.
- **React StrictMode** mounts, unmounts and remounts in development. The
  import can resolve after the first cleanup, so setup has to check it hasn't
  been cancelled.
- 🟡 **Budget,** reported in Phase 7: `ambient` ≤ 170 KB gzipped, `drive` ≤ 60 KB
  gzipped, and the homepage's first-load JS up by less than 5 KB for the
  small client component that loads the rest. The road layers add about 4.8KB
  gzipped to the page (§Drawing the roads).
- **LCP and CLS:** the `h1` stays the LCP element. The road layer and canvas
  are absolutely positioned, and the phone band's height is set by CSS before
  first paint, so nothing shifts. The Lighthouse re-run owed before
  cutover (`07-status.md`) covers this.

## Accessibility

- The road layer and car canvas are `aria-hidden`. The text underneath is ordinary
  HTML, selectable and read normally. A car driving over it doesn't change that.
- Keyboard: the Drive button is in the tab order. Driving keys work only while
  focus is in the hero. Esc and × both exit, and focus goes back to the button.
- Contrast: the Drive label passes AA at rest, see question 5. The hint uses
  solid `--cream`.
- Targets: the Drive pill and × are at least 44px.
- Reduced motion: above.
- 🟡 Windows turns on Sticky Keys after Shift is pressed five times in a row,
  which is exactly what working a clutch looks like. A browser can't stop that.
  It's worth knowing about, not fixing.

## Code

✅ `src/components/hero/`, one module per concern. The gearbox is pure logic.

```
src/components/hero/
  config.js           every tunable: density, road sizes, speeds, gearbox, marks, smoke, physics
  layouts/
    wide.json
    compact.json
    index.js          both maps, for components (the pure modules take a layout as an argument)
  layout.js           pick a layout, scale to pixels, headline check and the hide rule   (pure)
  graph.js            nodes, lanes, junction kinds, movements, turn paths                (pure)
  RoadLayer.jsx       server component: one road layer per map, as positioned elements
  RoadLayer.css
  HeroStage.jsx       client: headline check; later loads the chunks, owns play mode,
                      renders Drive, hint, HUD
  HeroStage.css
  DriveButton.jsx
  ControlsHint.jsx
  Hud.jsx + Hud.css
  engine/             the ambient chunk
    index.js          loop, resize, observers, pause and resume
    render.js         three.js scene, camera, car instances, ring
    traffic.js        lane following, gaps, reservations, turns, portals          (pure)
    marks.js
    smoke.js
  drive/              the drive chunk
    index.js          planck world, walls, contacts, recovery
    player.js         car forces, lateral grip, steering
    input.js          keyboard, focus, preventDefault
    gearbox.js        engine and gearbox model                                   (pure)
  __fixtures__/
    copy-rects.json   where the copy lands at 27 sizes
    record.md         how to re-record it
  graph.test.js
  layout.test.js
```

- ✅ `Hero.jsx` stays in `src/components/home/` next to the other homepage
  sections. It renders both `RoadLayer`s and `HeroStage` inside the section.
- ✅ Built so far: `config.js` (world, car, roads and layout sections only; the
  rest arrive with their phases), `layouts/`, `graph.js`, `layout.js`,
  `RoadLayer`, `HeroStage` and the tests. The pure modules import each other
  with `.js` extensions, which Node needs and the bundler accepts.
- ✅ GSAP comes from `src/lib/gsap.js`, and motion values from `src/lib/motion.js`.
- Anything marked "pure" imports neither three.js nor planck nor the DOM, so
  Node can run it.

### Config, starting values

🟡 All tunable. The shape matters more than the numbers.

```js
export const CONFIG = {
  world:    { pxPerM: 6, step: 1 / 120, maxSteps: 8, seed: 20260924 },
  roads:    { main: 40, side: 24, tick: { width: 2, length: 8, gap: 10 }, clearance: 48 },
  traffic:  { pxPerCar: 90_000, min: 6, max: 16, compactMin: 4,
              cruiseKmh: [36, 44], turnKmh: 15, accel: 2.5, decel: 3.5, maxDecel: 8,
              headway: 1.2, stopGap: 1.5, dwell: 0.4, reroute: 6 },
  car:      { length: 4.0, width: 1.83, wheelbase: 2.5 },
  player:   { maxSteerDeg: 32, steerAtTop: 0.45, brake: 9, rearGripBraking: 0.75,
              wallRestitution: 0.35 },
  gearbox:  { order: ['R', 'N', '1', '2', '3', '4', '5', '6'],
              ratios: { R: 3.45, 1: 3.36, 2: 2.09, 3: 1.47, 4: 1.1, 5: 0.87, 6: 0.73 },
              finalDrive: 4.1, tyreRadius: 0.31, torqueScale: 1,
              idle: 900, redline: 7000, limiterDrop: 300, stallBelow: 600,
              stallTime: 0.8, stallDecel: 6, overrevDecel: 9, wheelspinAbove: 4500 },
  recovery: { settleSpeed: 0.5, settleSpin: 0.3, settleMax: 2, rejoinKmh: 10,
              blend: 0.5, nudgeAbove: 1, giveUp: 8 },
  marks:    { pool: 6000, width: 1.5, every: 3, fade: 10, slip: 1.5, brakeAbove: 0.8 },
  smoke:    { pool: 160, life: 1, from: 6, to: 22, alpha: 0.5 },
  render:   { maxDpr: 2 },
}
```

## Tests

✅ Node's built-in runner, `node --test`, through `npm test`. Node 24 is
installed, the pure modules are plain ESM, and it adds no dependency. Tests
read the layout JSON with `readFileSync` rather than an import, which avoids
import-attribute differences between Node and the Next bundler. They lint
clean under the existing `eslint.config.js`.

**Phase 2: 31 tests, all passing.** `graph.test.js` has 13 and
`layout.test.js` has 18.

✅ Required by the brief:

- **Gearbox:** grind without the clutch, stall below the threshold, launch assist
  in 1st and R, over-rev downshift.
- **Layout:** the graph is fully connected, has no dead ends, and no road enters
  the headline region.

Added, each checking something the brief requires:

- **Gearbox:** no stall loop at a standstill in 3rd. N and
  clutch-in rev freely and bounce off the limiter. 1st creeps at idle with no
  throttle.
- **Layout, both maps at every recorded size:** `checkGraph()` passes.
  Junctions are crosses, Ts or corners only, and each map has at least one
  cross and one T. Portals are at least a car length off screen. Every lane
  holds a car. Parallel roads leave at least a car length of red between them;
  the test prints the tightest. No node or segment enters `reserve`. The CSS
  breakpoint, the config query and the JSON agree.
- **Road layer:** a road and a tick run for every segment, a box for every
  junction, a crossing on every road into a cross or T and none at corners.
  At every recorded size, no crossing leaves its road or touches a junction or
  another crossing, and no tick touches any of them; the test prints the
  shortest run between crossings and how many runs are too short to draw a
  tick. Each crossing spans its road, is 3px clear of its junction, and road
  widths are whole numbers of stripes at every zoom. Stripes are a quarter of
  their tile. The phone map's road sizes are all the configured ones times its
  zoom, in both the drawing and the graph, and the clearance isn't scaled. The
  CSS that hides a short run of ticks follows the zoom. Car length, the tick
  tile and the minimum gaps are all measured at each map's own zoom. Hiding a
  T's stem takes its crossings and box with it and leaves everything else.
- **Phone band:** at all eight recorded phones it starts at least 48px under
  the copy and runs to the hero's sides and bottom.
- **Wide map:** 20–30% of the base grid removed and spacing within ±30%, both
  printed. At least three side streets.
- **Headline clearance, against `copy-rects.json`:** at 1280, 1440 and 1920px,
  from 680px of viewport height up, no road comes within 48px of the copy. At
  every other recorded size the runtime rule runs, the resulting map must still
  pass `checkGraph()`, and the test prints what it hid. That list is the brief's
  "report any size where this happens". Today it prints "no size needs
  anything hidden".
- **Graph, on small hand-built maps:** a cross offers straight, left and right,
  and right is south when heading east. A T gives the stem left or right and
  the through road straight or one turn. A T's box is side-street wide and
  main-road tall. Traffic keeps right. Right turns are tighter than lefts. No
  movement is a U-turn. Every turn starts on its lane and ends on the next with
  matching headings. The checks catch a dead end, a map in two pieces, and a
  side street running off the edge.
- **Traffic, headless:** 5 simulated minutes at three sizes with a fixed seed.
  No two cars ever overlap. The count stays constant apart from a pending
  respawn. Every car moves at least once every 15s, so nothing is deadlocked.

**Re-recording the fixture.** When the hero copy, CSS or fonts change,
follow `__fixtures__/record.md`: a console script that loads `/` in sized
iframes and prints the new `sizes` array.

## Phases

✅ The brief's seven phases. I stop after each one, summarise, and wait.

| # | Delivers | Done when |
|---|---|---|
| 1 | This file | ✅ Reviewed September 24 |
| 2 | Layout JSON for both layouts, `graph.js`, `layout.js`, `RoadLayer.jsx` server-rendered, the half-width copy and the phone street band, resize, the headline check, `npm test` with layout and graph tests, the fixture, prototype folder dealt with, `08-motion.md` §The hero updated | ✅ Built September 24, then revised the same day: the road layer rebuilt so ticks end cleanly, zebra crossings at every junction (then thinned), and a bigger, less regular phone map under smaller phone type, then drawn zoomed out. 31 tests pass, lint and build clean, checked in Chrome at 360, 390, 768 and 1440px. |
| 3 | `engine/`: renderer, cars, traffic, reservations, Ts and corners, turns, portals, respawn, fade-in, pause and resume, seeded start | Headless traffic test passes. No overlaps seen on screen. `08-motion.md` rule 7 updated. |
| 4 | Drive button, `drive/` with planck, walls, player forces, input and focus, driving over text, exit and rejoin, controls hint, takeover ring | Keyboard-only run-through: enter, drive, Tab away, Esc, focus back on Drive |
| 5 | `gearbox.js` and tests, then the HUD | Gearbox tests pass. The HUD reviewed in the browser. |
| 6 | Kinematic-to-dynamic knocks, recovery, anti-cascade, tyre marks, smoke | A chain of knocks through a full 16-car hero clears on its own within 15s |
| 7 | Phones, touch, reduced motion, lazy loading, save-data, disposal, performance pass, bundle report | 60fps with 16 cars, a full mark pool and smoke on a mid-range laptop. Reduced-motion and no-JS checks from `08-motion.md` pass. Chunk sizes reported. |

Phase 4 and 5 UI work uses the `frontend-design` plugin.

## Decisions, September 24

The first draft's open questions, as answered in review.

1. **Headline:** the working tree's "Finally learn manual, without the
   stress". The eyebrow stays.
2. **Phones:** the street band under the CTAs, with traffic in the band only.
3. **Tablets and small laptops:** from 768px the copy keeps to the left half
   and the right half is the city. This replaced the draft's `min(700px, 55vw)`
   cap from 1024px, and the street band on tablets, after tablets looked out of
   step with both the wider and narrower views.
4. **The prototype:** saved to `prototype/hero-drive-v0`, deleted from
   `overhaul`.
5. **The Drive pill:** my call, as long as its label passes AA.
6. **Reverse:** in R, S drives backwards and W brakes.
7. **Stall loop:** wait for a clutch press or a gear change at a standstill in
   2nd or higher.
8. **Analytics:** one GA4 event when someone presses Drive, through the
   existing consent-gated `gtag`, and nothing else.
9. **`frontend-design`:** installed.

From the review of the built Phase 2, the same day:

10. **Ticks at junctions** were cut at odd points. The road layer was rebuilt
    so each road's ticks run from junction to junction in whole ticks only.
11. **Crossings:** grey stop lines across the right-hand half of each road
    into a junction came first, then were replaced the same day by black
    zebra crossings across the full road, from a reference picture. Their
    stripes were then thinned from 4px to 2px as too jarring.
12. **Phones:** hero text a size smaller, the buttons side by side, and the
    freed space given to the street band, with more roads in a less regular
    map.
13. **Phone zoom:** the phone map was too crowded, with barely any road
    between junctions. Rather than add or move roads, it's drawn zoomed out:
    every road size times 0.6.

Nothing is open. The Safari question about SVG dash lengths went away with
the SVG.

📎 No pending assets. The icon and the HUD are drawn in code.

## Docs to update as this lands

- ✅ `08-motion.md` §The hero: no photo, and the city behind the copy (Phase 2).
- `08-motion.md` rules 7 and 8: the hero traffic and the Drive opt-in (Phase 3).
- ✅ `02-architecture.md`: component map and `src/components/hero/` (Phase 2).
- ✅ `07-status.md`: the hero rebuild under recent work (Phase 2, then each
  phase).
- ✅ `README.md`: this file in the file table (Phase 2).
- `05-analytics.md`: the Drive event (Phase 4).
