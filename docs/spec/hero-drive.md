# Hero drive

The homepage hero rebuilt as a small city seen from above: white roads on the
brand red, blue traffic that obeys all-way stops, and one black car that a
visitor can take over and drive, with a manual gearbox or an automatic one.
The headline, subtext
and both CTAs stay as they are, in HTML. Everything behind and around them is
new.

✅ **Reviewed and approved**, September 24, 2026. Every recommendation in the
first draft was accepted, and the open questions were answered the same day
(§Decisions). **Phases 1 and 2 are done, committed and pushed**: the road
layouts, the road graph, the server-rendered road layer, the headline check,
and their tests. **Phase 3, ambient traffic, is built and its roads
reviewed and approved. Phase 4, the Drive button and a drivable black car,
is built and was retuned after Scott's first drive. Phase 5, the gearbox
(manual and automatic, with a switch between them) and the gear display,
is built and waiting for review.** Since then the car can be driven over
the whole page, with the page scrolling after it (§Driving the whole page),
which Scott tried and liked. Phases 3 to 5 and the whole-page drive are
committed and pushed to `origin/overhaul`. If you're picking this up, read
§Handoff first.

Legend as in `README.md`: ✅ decided, 🟡 recommended, ❓ open, 📎 pending asset.
Anything the brief states outright is ✅. What was 🟡 in the draft is now ✅
unless it's marked otherwise. Where the brief conflicts with the code, the
measurements, or another doc, it's flagged rather than silently resolved.

## Handoff

Written September 24, 2026, at the end of Phase 5, for whoever picks it up
after Scott's review.

### Where it is

- **Phase 1** (this spec) and **Phase 2** (the roads) are done. Commits
  `8bd1a72` (code) and `f922e2e` (docs) are on `overhaul` and were pushed to
  `origin/overhaul` the same day, which deploys to the review Vercel project,
  not the live site.
- **Phase 3** (ambient traffic) is built. Its review changed the roads: fewer
  of them, every road one width, and the phone band fixed at 240px. Scott
  approved the roads, and the traffic was then fixed for the short blocks and
  short windows those changes exposed (§Decisions 14 to 17).
- **Phase 4** (the Drive button and a drivable black car) is built. Scott
  drove it and found it slow and clunky; the handling was retuned
  (§Decisions 18) and he was happy with it.
- **Phase 5** (the gearbox and the gear display) is built and waiting for
  Scott's review in the dev server. He asked for the automatic to stay
  alongside the manual, with a way to switch (§Decisions 19). Don't start
  Phase 6 until he says so.
- **After Phase 5, the whole page.** Scott asked for the car to drive over
  the entire site, with the page scrolling after it near the bottom of the
  window, with momentum (§Decisions 20). It's built, and Scott tried it and
  liked it (§Driving the whole page, and §After Phase 5 below).
- Phases 3 to 5 and the whole-page drive are committed and pushed to
  `origin/overhaul`, September 24, so the review deployment has them.
  Scott usually pushes himself; the HTTPS push command, for when he asks
  for a push from here, is below.
- What exists: `src/components/hero/`, which holds `config.js`, `graph.js`,
  `layout.js`, `layouts/wide.json` and `compact.json`, `RoadLayer.jsx`,
  `HeroStage.jsx`, `DriveButton.jsx`, `Hud.jsx` and `Hud.css`,
  `GearGate.jsx` and `gate.js`, `ControlsHint.jsx`, `engine/` (`traffic.js`,
  `render.js`, `index.js`), `drive/` (`player.js`, `gearbox.js`, `input.js`,
  `follow.js`, `index.js`), the tests and the fixture. The hero markup and
  CSS are in `src/components/home/Hero.jsx` and `Hero.css`. `npm test` runs
  77 tests, all passing. Lint and build are clean.
- planck.js 1.5.0 is installed, and only `drive/` imports it.
- The first prototype of this feature, a different design, is gone: saved
  to a local branch and then deleted, never pushed (§Where this started).
  Everything worth keeping from it is either in `graph.js` or described in
  this spec.
- The questions still open for Scott are in §Open questions, below.

### Phase 3 as built

Blue cars drive both maps. They follow their lanes, keep their distance,
stop just behind each zebra crossing, take every cross and T one at a time,
turn on the graph's arcs, leave by the portals and come back in at another,
and never overlap. The black car drives as ordinary traffic until Phase 4.
Under reduced motion the cars are drawn parked and nothing moves.

- **`engine/traffic.js`** is pure, with no three.js or DOM. It takes a graph
  from `buildGraph()` and the layout, and exposes `step(dt)`, the cars'
  poses, and `rescale(graph, count)`. §Ambient traffic has the rules it
  follows, including the calls it made where the spec was silent.
- **`engine/render.js`** is one three.js instanced quad for every car, shaped
  in the fragment shader (§Car look), under an orthographic camera at one
  unit per CSS px that draws at -y.
- **`engine/index.js`** runs the loop at a fixed 1/120s, at most 8 steps a
  frame. It pauses when the hero is off screen or the tab is hidden, and
  restarts with a fresh clock. It disposes everything and then calls
  `forceContextLoss()`. In development it sets `window.__heroEngine`
  (below).
- **`HeroStage.jsx`** loads `engine/` with a dynamic import after the `load`
  event and an idle moment, only where WebGL2 exists, since three.js r186 is
  WebGL2 only. It hands the engine the map from its existing debounced
  resize check, including any segments the headline check hid. The canvas
  covers the hero on the wide map and `.hero__streets` on phones. The cars
  fade in once, over `DUR_BASE`, after the hero's entrance; under
  `gsap.matchMedia(MOTION_OK)` they play, and when reduced motion switches on
  they go back to the seeded start and stop.
- **The hero's "settled" signal** is new. `playHero()` in `src/lib/motion.js`
  calls `settleHero()` from its timeline's `onComplete`, which sets
  `data-hero-settled` on the hero root and dispatches `hero:settled`.
  `SiteMotion.jsx` calls it when it skips a late hero. HeroStage waits for
  either, with a 1.5s failsafe, the same as the CSS one. This replaces the
  handoff's first idea of timing from `data-motion-ready`, which carries no
  time.
- **Tokens and config:** `--car-traffic: #2457C5` in `tokens.css`, and
  `traffic`, `render`, `world.step`, `world.maxSteps` and `car.wheelbase` in
  `config.js` (§Config).
- **Checked:** the headless test (§Tests). Beyond it, ten simulated minutes
  at all 32 recorded sizes plus a short window where the headline check hides
  three segments had no overlaps, never two cars in one junction box, and no
  car still for more than 12.5s. At double the normal density, the longest
  wait was 20s and nothing locked up. In Chrome at 390, 768, 1440, 1728 and
  1920px, by stepping the engine by hand (below), with no console errors.
  A client-side trip to /about and back leaves one canvas and one engine.
- **Weight:** the `engine/` chunk, three.js included, is 136KB gzipped,
  under the 170KB budget. The homepage's first-load JS grew 1.2KB gzipped,
  under the 5KB one. Measured against a build of `d4805e0`.

### Phase 4 as built

Press Drive (or Tab to it and press Enter) and the black car is yours:
W drives, S brakes and then reverses, A and D or the arrow keys steer, Esc
or the × stops. The car drives anywhere inside the hero, over the headline
too, bumps off its edges and off traffic, and traffic stops for it. When
you stop, it drives itself back to the nearest lane and blends into
traffic.

- **`drive/player.js`** is the car (§The player car): a planck body with two
  virtual axles whose sideways slip is cancelled up to a grip limit; a
  drift above 45 km/h at hard lock, capped so it never spins; steering lock
  that shrinks with speed; 14 m/s² brakes; drag; and the rear losing grip
  under hard braking. Retuned after Scott's first drive (§Decisions 18).
  Through Phase 4 a stand-in automatic drove it (W pulled away, S braked
  and, held at a standstill, reversed); Phase 5's gearbox replaced it.
- **`drive/index.js`** is the driver. It makes the planck world the first
  time Drive is pressed, the walls (a chain around the hero, with the top
  one at the nav's bottom, moved as the page scrolls), and the traffic as
  kinematic bodies whose velocity is set every step so they arrive where the
  traffic code puts them. A drive goes waiting, driving, returning, done.
  Pressed while the black car is off screen, it waits for the car to come
  fully inside; under reduced motion, where nothing would bring it in, the
  car is parked on a street instead.
- **`drive/input.js`** hears keys on the hero only, ignores them with Cmd,
  Ctrl or Alt held, keeps WASD, the arrows and Space from scrolling, clears
  held keys on window blur, ends the drive when focus leaves the hero, and
  keeps focus put when you click the hero anywhere but a control.
- **`engine/traffic.js`** learned play mode: taking the black car out and
  putting it back, stopping for a car off the lanes (it walks its own route
  ahead two px at a time and stops short of any off-lane car its body would
  meet, and a junction with an off-lane car in or touching its box isn't
  given out), and finding a landing spot to rejoin.
- **`engine/index.js`** runs the driver's step in place of the traffic's,
  and keeps the loop running while driving even under reduced motion, where
  only the visitor's car moves (§Phones, touch and reduced motion).
- **`engine/render.js`** draws the takeover ring: one more quad, a black ring
  growing from 16px to 40px and fading over a second. Under reduced motion
  it holds its size for the second instead.
- **`HeroStage.jsx`** shows the Drive pill once the cars are showing, on
  screens with a fine pointer that can hover and the wide map, watched live.
  Hover or focus starts loading the drive chunk; a press sends one GA4
  `hero_drive` event and hands the car over. Focus moves to the driving
  panel in the same commit that swaps the pill for it, and comes back to
  the pill after Esc or the ×, but not if focus had already left the hero.
- **The UI** (§Entry, §HUD), designed with the `frontend-design` plugin: the
  pill is hero red with a hairline border, a steering wheel in the site's
  24px line-icon idiom and "Drive" in sentence case, quieter than the CTAs'
  capitals; it fades in with the cars. The driving panel is the same pill,
  in the same spot, reading "Driving" with a × to stop. The controls hint
  sits on a small plate above it, with the keys as keycaps, for four
  seconds.
- **Checked:** 11 new headless tests (§Tests). Beyond them, 200 random
  drives at five sizes, a fifth under reduced motion: no car ever touched a
  traffic car or left the walls, 199 drove back into traffic (median 4.8s,
  95% within 12s) and one, pinned into a corner, went off at an edge and came
  back in, and traffic flowed normally afterwards every time. In Chrome: Tab
  from See Packages reaches Drive; Enter starts a drive with focus on the
  panel and the hint showing; W, D and the arrows drive and steer; Tab
  reaches the ×; focus moving out of the hero ends the drive and stays where
  it went; Esc and the × end it with focus back on Drive; one GA4 event per
  press; the ring shows.
- **Weight:** the drive chunk, planck included, is 48.7KB gzipped, under its
  60KB budget. The ambient chunk is 138KB (170KB budget). The homepage's
  first-load JS is 2.9KB above `d4805e0`, for Phases 3 and 4 together (5KB
  budget).

**Changed from the spec, for review** (each also where it lives):

1. **How a car gets back to traffic** (§Recovery). The spec's pure pursuit
   through the tyre model failed a quarter of test drives: from the middle
   of a block or at a steep angle it swung wide, ran parallel to the lane,
   and missed short lanes. Now it plans a curve from where it is to a landing
   spot on the lane and follows it with its velocity and turn rate set
   directly, still a solid body. It drives at up to 30 km/h while the landing
   is far and 10 km/h for the last few car lengths, stops at the line if it
   gets there, keeps a stopped car's gap from traffic, and backs off and
   replans if it's blocked or not getting anywhere.
2. **Where it rejoins.** Lanes up to 120° off its heading count, not 90°; a
   lane leading off the edge costs four car lengths instead of being left
   out; the landing spot has to be inside the walls and ahead of the car's
   nose. Blending starts within 1m and 20° of the lane, not 0.3m and 10°.
3. **The safety net** gives a car 8s from reaching its landing, and 20s in
   all, instead of 8s from the start: a drive can end a long way from any
   road. A car that runs out goes off at an edge and straight back in; the
   fade-out the spec describes waits for Phase 6's knocked cars.
4. **Phase 4 stand-ins,** all replaced in Phase 5: the stand-in automatic,
   a hint with only WASD and Esc, and a bare "Driving ×" panel. The panel's
   exit fade is still to do (§Exit).

### Phase 5 as built

The black car has a real engine and a six-speed gearbox, in two modes, and
the "Driving" panel has grown into a gear display.

- **`drive/gearbox.js`** is the spec's module (§Gearbox and engine, §Shape
  of the module), pure and tested: R N 1 to 6 on the real ratios, rpm from
  wheel speed, idle 900, a limiter that bounces at 7,000. In manual, every
  shift needs the clutch or it grinds and stays put; letting the clutch out
  below 600 rpm in 2nd or up stalls it (0.8s off, bogging down, then it
  restarts and waits, §The stall loop); 1st and R pull away with launch
  assist and creep at idle; a downshift past the redline brakes the car hard
  until the revs come down; R while rolling forward, or 1st rolling back,
  grinds and locks the rear to a stop first; and dropping the clutch at high
  revs in 1st or R spins the rear wheels. Off the throttle in gear the
  engine brakes the car, harder in low gears.
- **The automatic** is the same box on the same gears, changing itself: up
  at 2,800 to 6,600 rpm depending on the throttle, down below 1,800, a
  kickdown flat out, 0.09s with the drive cut per change. It never stalls or
  grinds, and at a standstill S held selects R and W selects 1st, as the
  Phase 4 stand-in did. It replaced the stand-in, tuned to feel the same:
  0 to 100 km/h in 1.9s, top speed about 207 km/h.
- **The engine is an arcade one.** Real ratios and a real 200 Nm curve,
  times `torqueScale` 5.5, capped at 18 m/s² of traction at the rear tyres,
  so 1st and 2nd launch as hard as the stand-in did and 6th still pulls past
  200 km/h. The drag is lighter than Phase 4's, and engine braking makes up
  the difference off the throttle.
- **Keys** (`drive/input.js`): ↑ and ↓ shift, either Shift is the clutch
  while held, M switches mode. A shift or a switch happens once per press;
  key repeat is ignored. In R, S drives and W brakes, in both modes.
- **Taking over** (§Entry): in manual the car starts in N if it's nearly
  stopped, otherwise the highest gear that keeps 2,000 rpm, clutch up (3rd
  at 40 km/h). The automatic starts in 1st at a standstill.
- **The gear display** (`Hud.jsx`, `GearGate.jsx`, `gate.js`), where the pill
  was, designed with the `frontend-design` plugin in the About page's shift
  gate language: a small H-pattern with R top left, a white knob that
  travels out of its slot, along the neutral plane and into the next on
  `EASE_SHIFT` (re-routing from wherever it is when changes come quickly;
  it jumps under reduced motion), the current gear's label lit; the gear as
  a big numeral, dimmed while stalled or waiting, black for a moment on a
  grind with a short sideways shake; a thin rev bar from 0 to 8,000 with the
  band past the 7,000 redline tinted and the mark flickering on the
  limiter; a clutch lamp in manual; an Auto / Manual switch (a real button,
  also M); and the ×. The panel rises in over 0.3s.
- **Per frame without React:** the engine calls `onFrame` with the driver's
  telemetry after every frame drawn; HeroStage writes the rev bar and the
  limiter flicker straight to the DOM and sets React state only when the
  gear, the mode, the clutch or the engine's state changes.
- **The hint** now shows the keys for the current mode, at the start of a
  drive and again whenever the mode changes. The mode a visitor last picked
  is remembered in `localStorage` (`clutch.hero.gearbox`); automatic until
  they pick.
- **Weight:** the gear display loads with the drive chunk, on the pill's
  hover or focus, not with the page. It isn't `React.lazy`, which suspends
  on its first render even once loaded, and the panel has to be there in the
  same commit that takes focus from the pill. Drive chunk 50.8KB gzipped
  (60KB budget), homepage first-load JS 3.7KB above `d4805e0` for Phases 3
  to 5 together (5KB budget).
- **Checked:** 12 gearbox tests, 2 for the knob's route, and a manual-mode
  driver test (§Tests). In Chrome: the automatic climbing 1st, 2nd, 3rd; M
  switching to manual, saved, with the manual hint; ↑ without the clutch
  grinding and the numeral flagging it; the clutch lamp; ↑ with the clutch
  into 4th; braking to a stop in 4th stalling at 600 rpm, then waiting, the
  numeral dimmed; the switch clicked back to automatic and saved; focus on
  the panel with or without hovering first. The knob's travel can't be seen
  there, since GSAP doesn't tick in the hidden tab; the route is tested.

**Changed from the spec, for review:**

1. **The automatic stays** (§Decisions 19), on the same gearbox, with a
   switch. The spec had the gearbox replace the stand-in outright.
2. **The HUD's layout and additions:** the mode switch, and the clutch lamp
   only in manual. The HUD fades in; it doesn't fade out yet, because it
   unmounts as focus goes back to the pill.
3. **An arcade engine**: `torqueScale` 5.5 on a 200 Nm curve, a traction cap,
   lighter drag (above).

### After Phase 5: the whole page

Scott asked for the car to drive over the whole website, and for the page to
scroll with it smoothly near the bottom of the screen, with velocity and
momentum, "so even if the car slows down the page keeps scrolling a bit".
§Driving the whole page has the design; in short:

- The canvas and the gear display move into a fixed `.drive-layer` over the
  window for the length of a drive, under the nav. The traffic stays
  clipped to the hero; the black car is drawn anywhere.
- The walls are the page's edges, down to the footer.
- `drive/follow.js` scrolls the page for a car heading into the bottom or
  top fifth of the window, with momentum, and never lets the car leave the
  window. The visitor's own scroll wins.
- A drive that ends away from the roads ends with the car driving off the
  nearer side and coming back in at a way in.
- Focus returns to the pill without scrolling the page back up.

**Changed from what was asked, for review:**

1. **The top follows too.** He asked for the bottom. Without the top, the
   only way back up the page would be the scroll wheel.
2. **A car standing near the bottom doesn't scroll the page.** It can be
   there when Drive is pressed, and the page moving on its own looked like a
   bug. Only a car heading for the edge moves it.
3. **Leaving by the side.** Driving back up the page to the roads would
   take a minute.

**Checked:** 7 follow tests and a drive down the page that ends off the side
(§Tests). In Chrome, in the iframe harness at 1440×900: the canvas and the
display move into the layer and focus lands on the display; driving down the
page at about 125 km/h, the page kept pace with the car at the zone's edge,
2,500px down; braking to a stop, the page carried on about 60px after the
car stopped; the black car drawn over the pricing cards; Esc sent it off the
right side in 5s at the old 45 km/h (now 60), the canvas went back into the
hero, and focus went back to the pill with the page left where it was. Once,
straight after a reload, the page jumped 378px between two steps with
nothing driving it; it didn't happen again, and the follow treated it as the
visitor's own scroll, as it should. Probably ScrollTrigger in the hidden tab.

### Open questions

1. **Which gearbox mode first?** Automatic, until a visitor picks. It's the
   easier start; manual is the school's whole point. One line in
   `config.js` (`gearbox.defaultMode`).
2. **The black car on phones and touch screens.** Drive doesn't exist there
   (§Phones, touch and reduced motion), but the black car still drives as
   one of the traffic, because the brief says it's ordinary traffic until
   taken over. Keep it, or make every car blue where Drive isn't offered?
   Open since Phase 3.
3. **The feel of the manual box.** Checked by numbers and tests, not by hand,
   since the automation tab can't run the loop. The automatic was tuned to
   match the Phase 4 drive Scott liked.
4. **The black car on the darkest cards.** Over the pricing cards' deep red
   it's hard to see. Fine over the hero, the beige bands and the photos.
   A light outline would fix it if it bothers him.
5. **The follow's feel**: the zone (a fifth of the window), the push and the
   coast are in `CONFIG.follow`, tuned by numbers, not by hand.
6. Settled, for the record: the side street's short blocks (§Decisions 17).
   In windows about 600 to 730px tall, a car stopped beside it still sits on
   the zebra crossing, and those blocks have no centre ticks.

### What's next

1. Scott's review of Phase 5 in the dev server, and any revisions. He has
   tried the whole-page drive and liked it. Record each one in §Decisions and in the section it
   changes.
2. Then Phase 6: kinematic-to-dynamic knocks, recovery for knocked cars,
   the anti-cascade rule, tyre marks and smoke (§Traffic as physical bodies,
   §Recovery, §Tyre marks, §Smoke). The gearbox's events (stall, over-rev,
   wheelspin, grind) are ready for the marks and smoke to hang off.

### How Scott works

- **One phase at a time.** Stop after each phase, summarise what changed, and
  wait. He reviews in the running dev server and usually sends a round of
  visual revisions before moving on. Phase 2 had four: the tablet layout, the
  ticks and stop lines, the phone text and map, and the crossing stripes and
  phone zoom. Phase 3 had four more: fewer roads, one road width and one
  more stub, the phone band fixed at 240px, then approving the roads. Phase
  4 had one, the handling, and Phase 5 started with a change of scope, the
  automatic kept beside the manual (§Decisions 14 to 19). Record each
  revision in §Decisions and in the section it changes, including what was
  tried and replaced.
- **He test-drives.** Handling is judged by feel in the dev server. Measure
  it headlessly as well (the numbers are what the tests hold on to), but
  expect a round of feel changes after he's driven it. "Slow and clunky" in
  Phase 4 meant acceleration, turn rate and no drift, and the fix was
  arcade values, not realism.
- **Change only what he asks for.** When a revision says "don't change
  anything except X", take it literally.
- **Commit only when asked.** He pushes himself. He asked for one push on
  September 24 and then said he'd push later, so don't push unless he asks in
  that session.
- **Plain writing** in docs and messages: the `unslop` skill's rules, with no
  em dashes and few parentheses.
- **UI work** for the Drive button, controls hint and HUD uses the
  `frontend-design` plugin, which is installed.

### Checking it in a browser

Visual checks were done in Chrome through the extension, against Scott's dev
server on :3000. Load any page but the homepage (`/privacy`), clear its body,
and put the homepage in iframes at the sizes you want to see:

```js
const mk = (w, h, x, y, s) => {
  const wrap = document.createElement('div')
  wrap.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w * s}px;height:${h * s}px;overflow:hidden`
  const f = document.createElement('iframe')
  f.src = '/'
  f.style.cssText = `width:${w}px;height:${h}px;border:0;transform:scale(${s});transform-origin:0 0`
  f.onload = () => {
    const st = f.contentDocument.createElement('style')
    st.textContent = '[data-hero],[data-hero] > *{opacity:1!important;visibility:visible!important;transform:none!important} [class*=consent]{display:none!important} nextjs-portal{display:none!important} .hero__cars{opacity:1!important;visibility:visible!important}'
    f.contentDocument.head.appendChild(st)
  }
  wrap.appendChild(f)
  document.body.appendChild(wrap)
  return f
}
document.body.innerHTML = ''
const f = mk(1440, 780, 0, 0, 0.5)
// About 5s later, once the page has loaded, gone idle and fetched the engine:
f.contentWindow.__heroEngine.step(30) // 30 simulated seconds, then draw
```

Traps:

- **The automation tab is hidden** (`document.hidden` is true). So
  `requestAnimationFrame` never fires, the hero's entrance stalls halfway with
  the subhead and buttons invisible, and ResizeObserver callbacks don't run.
  The injected style above forces the entrance's end state, and the cars'
  fade-in, which stalls the same way. The traffic loop doesn't run there
  either, so `engine/index.js` sets `window.__heroEngine` in development:
  `step(seconds)` advances the simulation and draws it, `sim` and `map` are
  the live state, and `engine.park()` puts the cars back at the seeded start.
  The headless test is the real check on the simulation. A stalled entrance
  is a tab quirk, not a site bug.
- **Reduced motion can't be emulated there.** The extension can't reach
  DevTools' Rendering panel, and GSAP's `matchMedia` holds its own queries.
  Phase 3 checked `park()` directly and left the live toggle to Scott's
  review.
- **Keys from the extension stop arriving** once the hidden tab has sat for
  a while: Tab worked on a fresh load and then did nothing. Phase 4's
  run-through used script for the rest, which the drive code can't tell
  apart: `el.focus()` to move focus (a focus change fires the same
  `focusout` a real Tab does), the pill's `.click()`, and `KeyboardEvent`s
  dispatched on `document.activeElement`, which bubble to the hero. Step the
  engine with `window.__heroEngine.step()` in between; while driving it
  steps the driver too, and `__heroEngine.driver` is the live driver. A
  section further down the page that's still waiting for its scroll reveal
  is `visibility: hidden` and can't take focus, so "Tab out of the hero" is
  best done by focusing a nav link.
- **The automation viewport can be small** (500×667 on September 24), and
  screenshots can be device-scaled. View one frame at a time, and measure
  with `getBoundingClientRect()`, not `offsetWidth`, which rounds.
- **Long measurement scripts** can pass the tool's 45s limit. Start them
  unawaited, store results on `window`, and read them in a second call.

### Things that bit, and conventions to keep

- **Road sizes always come from `roadsFor(layout)`**, never `CONFIG.roads`
  directly, because the phone map is zoomed to 0.6. Car sizes and px speeds
  come from `unitsFor(layout)` in `traffic.js`, which builds on it.
- **The pure modules** (`graph.js`, `layout.js`, `config.js`,
  `engine/traffic.js`, `drive/gearbox.js` and `gate.js`) import each other with `.js`
  extensions and take layouts as arguments. Tests read JSON with
  `readFileSync`. Keep it that way, or Node's test runner breaks.
- **ESLint knows only browser globals.** `process` fails, so
  `engine/index.js` declares it with a `/* global process */` comment for
  its one `process.env.NODE_ENV` check. Watch for local names shadowing
  imports: a local `wide` shadowed the imported map once, and only lint
  caught it.
- **GLSL has reserved words JavaScript doesn't.** `half` is one. The shader
  failed to compile over it, and three.js only says so in the console.
- **Drawing at -y mirrors every triangle**, so the car quad is wound
  clockwise, or three.js culls it as a back face and draws nothing, with no
  error.
- **Rounding in the traffic's bookkeeping can leave a car a zero-length
  "body" on the junction it just left.** Two cars each waited for the
  other's ghost, in their boxes, for good. `occupy()` now ignores anything
  under 1e-6px. The density stress run found it; the normal test didn't.
- **A baseline build in a worktree** needs its own `node_modules`: Turbopack
  refuses a symlink that points outside the project. `cp -Rc` clones it on
  APFS in seconds without using real disk.
- **Swapping the focused Drive pill for the panel** removed the element with
  focus, which reads as focus leaving the hero and ended the drive the moment
  it started. Focus moves in a `useLayoutEffect`, in the same commit.
- **The React lint rules** (`react-hooks` 7) reject writing a ref during
  render and calling setState straight from an effect body. Stable handlers
  go in `useCallback` with no dependencies; a media query's first value comes
  from a lazy `useState` initialiser, and the effect only subscribes.
- **The traffic kept stopping for a car that was gone** when a returning car
  hit its safety net: nothing cleared `sim.setBodies()`. The driver clears
  it whenever a drive ends. The 200-drive check caught it by running plain
  traffic for 20s after each drive.
- **Getting a car back into traffic took five goes.** The drives that failed
  were each diagnosed from a trace of one run (§Recovery has the result):
  pursuit through the tyre model ran parallel to the lane; a car stopped by
  a traffic car that was stopped for it waited for good; landing spots sat
  off screen or behind the car. Test it with many random drives, not one.
- **Any change to the hero's copy, CSS or fonts** means re-recording
  `__fixtures__/copy-rects.json` (`__fixtures__/record.md`), then running
  `npm test`.
- **Road markup is in the page twice**, once as HTML and once in Next's
  hydration payload. Keep pieces lean; zero offsets are already left out.
- **Tick runs** are CSS `background-repeat: space` on a `::before`, hidden by
  a container query `(width < 1em)` whose em is the strip's own font size,
  set to one tile. That's how the threshold follows the zoom without a number
  in the CSS.
- **The dev server** is usually already running on :3000 from Scott's own
  session. Reuse it. `npm run build` is safe alongside it, because dev builds
  into `.next/dev`.
- **Pushing over SSH fails**: this Mac's key isn't registered on GitHub. The
  GitHub CLI is logged in, so if Scott asks for a push, this works without
  changing any config: `git -c remote.origin.pushurl=https://github.com/scottdoggett/clutch-academy-site.git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push origin overhaul`.

## Where this started

Three uncommitted things were in the tree when this spec was written.

1. **A prototype of this feature** in `src/components/home/drive/`: 7 files,
   2,233 lines, never mounted. It was a different design: roads laid out
   procedurally around the measured copy on every resize, road widths that
   scaled, a hand-rolled physics solver instead of planck.js, a five-speed box
   with an automatic clutch, a red player car, a handbrake on Space. ✅ Saved
   as one commit on a local branch, `prototype/hero-drive-v0`, and deleted
   from `overhaul` on September 24. The branch was never pushed, and Scott
   had it deleted at the end of the same day, so the prototype no longer
   exists. Its arc-length Bézier turns live on in `graph.js`. The rest of
   what it did well is written into this spec: keyboard guards (§Keys),
   observer wiring (§Pausing, §Resize) and an instanced tyre-mark shader
   (§Tyre marks).
2. **`Hero.jsx` and `Hero.css` edits** that dropped the photo. ✅ Kept. With no
   photo, the `h1` is the LCP element at every width.
3. **`three@^0.186.0` in `package.json`.** ✅ Kept. planck.js 1.5.0 was added
   in Phase 4.

✅ **The headline is the working tree's "Finally learn manual, without the
stress".** The committed version read "Learn to drive manual without the
stress." The brief said to keep the existing headline without saying which,
and the working tree is what's been on screen during review. The eyebrow,
"Toronto · Manual Transmission Lessons", stays.

## Conflicts with existing docs and rules

- **`08-motion.md` rule 7, "No new loops."** Ambient traffic is a new loop that
  runs on its own. ✅ The brief is the sign-off, and the motion rules can bend
  for this. ✅ Rule 7 got the hero traffic added to its list in Phase 3.
- **`08-motion.md` rule 8, "Reduced motion means none."** The Drive button
  keeps working under reduced motion. That matches the About page's shift
  gate, which follows a pointer under reduced motion but never cycles on its
  own. Motion the visitor starts by pressing a button is allowed. Motion that
  starts itself isn't. ✅ Rule 8 got that line in Phase 3.
- **`08-motion.md` §The hero** described the photo, its Settle scale and the
  caption. ✅ Updated in Phase 2.
- **The Drive pill at 60% opacity fails contrast.** White at 60% over
  `--red-primary` blends to about 2.8:1. That fails 4.5:1 for text, and it
  breaks the CLAUDE.md rule that muted text on the red is solid `--cream`,
  never faded white. ✅ Its look was my call (§Entry). Built in Phase 4 with a
  solid `--chrome` label and icon, 4.64:1, and full white on hover and
  focus, so it stays quiet without fading below AA.
- **`08-motion.md` rule 6, no scroll-jacking.** Driving the whole page
  scrolls the page for the visitor (§Decisions 20), which the rule bans. I
  raised it before building, and Scott asked for it anyway. ✅ Rule 6 now
  carries the exception: only during a drive the visitor started, which
  only desktop-class screens with a keyboard offer (never iOS Safari, the
  rule's worry), and the visitor's own scroll always wins.
- **The `frontend-design` plugin** is installed as of September 24. ✅ Used
  for the Drive button and controls hint in Phase 4 and the gear display in
  Phase 5.

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
| 390×844 | 390×677 | 20 88 370 389 | Street band below, 240px |
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
- ✅ While someone drives, the car canvas and the HUD move out of the hero
  into the driving layer, `.drive-layer`, fixed over the window at z 90
  (§Driving the whole page). The hero's isolation would otherwise keep the
  car under every later section.
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

**`compact`.** ✅ The hero grows a street band, `.hero__streets`, stacked as
a column: the copy, then the band, always 240px tall (`--hero-band` in
`Hero.css`). The hero is exactly that tall and no taller, so on phones it
doesn't fill the first screen the way it does on desktop. The band's top
margin is the 48px clearance, so it starts exactly 48px under the CTAs at
every size, by construction, with no measuring. It's full-bleed: its side
margins cancel `.section`'s padding, which is now published as
`--section-pad-x` and `--section-pad-y` in `globals.css` for this. The
layout is normalised to the band, not the hero. The road layer and the car
canvas cover only the band, and there's no driving.

✅ **Fixed at 240px in review, September 24.** At first the hero filled the
first screen and the band took whatever height the copy left, never less
than 240px. That ran from 240px on anything shorter than about 700px to
419px on a 430×932 phone and 502px on a 600px tablet. Scott liked the band
at its smallest and not how long it got, so it's that height always.

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
  H3 and between H4 and H5, V3 between H4 and H5, H2 and H3 between V2 and
  V3, and H4 between V1 and V2. The blocks merge into two L-shapes, a tall
  block the height of three, and a long one across the bottom.
- **Side streets, one:** across the merged middle block from V1 to V3.
- **Off V3 to the right edge:** two short roads, at y 0.3 and 0.715.
- **Left of the copy:** one street off the top road to the top edge, and one
  off the bottom road to the bottom edge, at x 0.29 and 0.17 so they don't
  line up. They fill the left side on wide screens without entering the
  block.
- **Junctions:** 4 crosses, 9 Ts and 3 corners. 13 portals, 31 segments,
  62 lanes.

✅ **Thinned in review, September 24:** the first version read as slightly
too busy, and four roads came out. They were all side streets or stubs, not
base-grid roads, so the grid is still 27% removed and inside the brief's 20
to 30%. One more base-grid segment would have taken it to 32%. The four:

- the side street that stood in for H4 between V1 and V2, which leaves V1 one
  long run from H3 to the bottom road;
- the side street down the long bottom block, between V2 and V3, whose short
  blocks at tablet widths couldn't hold a stopped car behind its crossings;
- V2's stub below the bottom road;
- the second street off the bottom road left of the copy, at x 0.38.

Then a fifth, in the second revision (§Decisions 15): the middle one of the
three short roads off V3 to the right edge, at y 0.55. The first version had
3 side streets, 16 Ts and 2 corners, 16 portals and 42 segments.

A fourth, vertical side street was drawn and cut. At 768px the downtown is
only 311px across, and it left slivers of block 22px wide.

### The phone map

Revised September 24: the first phone map was one main road with three
evenly spaced streets off it, and read as too symmetrical.

- **Main roads:** one across the top of the band at y 0.16, and one across
  the lower right at y 0.74, from the second street to the right edge.
- **Streets down**, at uneven x: 0.13 and 0.43 run to the bottom edge; 0.64
  is a side street from the top road that becomes a main road where it
  crosses the lower one and carries on off the bottom edge. So the grid jogs
  instead of repeating.
- **Side streets, one:** the one at x 0.64.
- **Junctions:** 1 cross, 4 Ts. 6 portals, 11 segments.
- ✅ **Thinned in review, September 24,** as slightly too busy. Two roads
  came out: the street at x 0.87, which ran from the top road to the lower
  one, and the short side street across the left block at y 0.46. The street
  at x 0.64 stays, because it's the jog, and because without it the map
  would have no cross. The first version had 8 Ts.
- It has to work from a 320×240 band to a 767×240 one.
- **Drawn zoomed out, at 0.6** (`CONFIG.layout.zoom.compact`). At full size the
  roads crowded the band: the shortest block left 1.2px of road between its
  two crossings. So every road size on the phone map is 0.6 of the desktop
  one: 24px roads, the ticks and crossings to match, and from Phase 3 the
  cars. Side streets were 14.4px until every road became one width
  (§Decisions 15). The map itself is unchanged. Now the
  shortest stretch between two crossings is 27.6px, every block has its
  ticks, and the tightest gap between parallel roads is 43px.

### Rules for the map

✅ From the brief, and asserted by tests where a test can check them:

- Main roads come from a base grid whose spacing varies by up to ±30% from the
  mean. Then 20–30% of interior segments are removed so blocks merge into larger,
  uneven shapes. The percentage counts the downtown grid, since everything west
  of it is removed for the headline anyway.
- Side streets cut through blocks and end on another road at both ends. No
  side street runs off an edge. The brief made them 60% of main-road width;
  ✅ since review on September 24 every road is one width (§Decisions 15),
  so a side street is the same white, the same width and the same ticks as
  any other road, and only the map data still calls it one.
- No dead ends anywhere. Every non-portal node has at least two roads.
- Junctions are 4-way crosses, T-junctions, or plain 90° corners. Traffic
  handles all three.
- The graph is fully connected, and drivable that way: from every way in, a
  car can reach every way out without a U-turn, and no lane is a trap.
- No road of any kind crosses the headline block, and every road edge stays at
  least 48px from it.
- Every lane holds at least one car, and parallel roads leave at least a car
  length of red between them, at every recorded size. The tightest is 27px,
  between H2 and the side street in a 1280×600 window.
- Every visitor sees the same map on every load. The map keeps its shape on
  resize and never regenerates.

✅ Values:

| | Value |
|---|---|
| Main road | 40px, two 20px lanes. At 6px per metre that's 6.7m, two 3.3m lanes. 24px on the phone map (zoom 0.6). |
| Side street | 40px, the same as a main road, since review (§Decisions 15). It was 24px, two 12px lanes. |
| Centre ticks | Black, 2px wide, 8px long, 10px gaps, on both kinds of road |
| Zebra crossings | ✅ Added in review: on every road into a cross or a T, a stack of black stripes across the full width of the road, 3px clear of the junction box and 10px long, each stripe running the way the road does. Stripes are 2px with 6px between, so every road takes 5. They started at 4px with 4px between and were thinned in review as too heavy; 2px matches the centre ticks. Corners have none, since traffic doesn't stop there. Cars stop behind them from Phase 3. They replaced grey stop lines across the right-hand half of the road, which were tried first the same day. |

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

### Room for a car

✅ Added September 24, after the roads were approved. In a window too short
for the whole wide map, the blocks either side of the side street get
shorter than a car. That happens below about 600px of window height, which
includes phones on their side: they're over 768px wide, so they get this
map, and an 844×390 phone has a 488px hero. There the two crossings at
either end of a block run into each other, and the traffic jams. A car let
into a lane shorter than itself stops with its tail in the junction behind
and holds it for good.

So a second runtime rule runs after the headline check, in the same pass
(`resolveMap()` in `layout.js`). While any lane is shorter than a car plus
its half-metre clearance (27px), it hides one road: first a side street
meeting a short lane, since that turns its junctions into plain straight
road, then the short segment itself. It hides a road only if the map still
passes `checkGraph()` and has fewer short lanes. At every recorded size it
hides nothing. In the three short windows in the fixture (`short.sizes`:
844×390, 932×430 and 1100×520) it hides the side street, on top of the two
segments the headline check hides. The road layer drops its pieces the same
way, which leaves a gap in the centre ticks where its junction was. Anything
still too short goes to the console as a warning.

The traffic has a safety net as well: it never lets a car into a lane it
can't stop in with its tail clear of the box behind, and never lets one car
hold two boxes.

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
| Junction box | White, as big as the junction really is. With every road one width that's always a square, 40×40, or 24×24 on the phone map; while side streets were narrower it was 24×40 where one met a main road. Mostly it lands on road that's already white; at a corner it fills the outside of the bend. |
| Centre ticks | One strip per segment, from the crossing (or box edge) at one end to the other. Each tile is one 8px tick with 5px of gap either side, and `background-repeat: space` draws only whole tiles and spreads them evenly. A tick is never cut short, and every run starts and ends the same way. A run too short for even one whole tick, as between two crossings on the shortest blocks, draws none: the strip is a size container, and a container query hides the `::before` the ticks are drawn on. The query is "narrower than 1em", with the strip's font size set to one tile, because a container query can't read a custom property but does measure em against the container. So it follows the map's zoom with no number repeated in the CSS. |
| Zebra crossing | See §Rules for the map. Drawn the same way as the ticks, one stripe per tile. |

Tested at every recorded size: no tick touches a junction box or crossing,
and no crossing touches another. 21 of the 832 tick runs across all those
sizes are too short for a whole tick and draw none. They're all on the
blocks either side of the side street between H2 and H3, on V1 above and
below it and on V3 above it, in every window up to about 730px tall:
900×700, 1000×700, 1280×600, 1280×680, 1280×720, 1366×660 and 1536×730.
Every phone block has ticks. Before the maps were thinned (§Decisions 14)
it was 24 of 1,144, and between the thinning and the side street's
widening (§Decisions 15) it was 8 of 880. In Chrome, the first version's 241
pieces rendered within 0.007px of the geometry the tests check.

**Why not the SVG.** The first build drew the roads as one inline SVG,
stretched to the hero with `preserveAspectRatio="none"` and non-scaling
strokes. It kept widths right, but it put each road's ticks on one long dashed
line from junction centre to junction centre, with white squares painted over
the junctions. Wherever a square's edge fell, it cut a tick at an arbitrary
point. Review caught it. A stretched SVG can't place anything at "this far
across, minus 12px", so neither exact tick runs nor crossings were possible.
The rebuild also removes the one Safari risk the SVG had, dash lengths under
non-scaling strokes. `background-repeat: space` has been in Safari for years.

**Weight.** The two layers are 164 elements, 24KB of HTML, 1.7KB gzipped,
down from 241 elements and 33KB before the maps were thinned. Next also
embeds a server component's output in the hydration payload, so the first
version grew the homepage about 4.8KB gzipped in all. Zero terms are left out of each
piece's style to keep that down.

The layer is `aria-hidden` and not an LCP candidate.

### Resize

✅ The road layer needs nothing, because CSS rescales it on every frame. The headline
check re-runs 150ms after resizing stops. The three.js world rescales on the
same debounce, from the same check: HeroStage's one ResizeObserver, which
now watches the street band too, hands the engine the new box and hidden
segments. The handoff had suggested a second observer inside the engine;
one is simpler and can't disagree with the headline check.

- Lanes and junctions are recomputed in pixels from the same normalised data.
- Each traffic car keeps its lane and its fraction along it, so it stays on its
  road. A car waiting at a junction stays at the line. A car whose segment
  the headline check has just hidden, or that now overlaps another, leaves
  and comes back in at a portal.
- The car count follows the new size. Extra cars leave at the next portal
  instead of vanishing; missing ones come in at the portals.
- Crossing the 768px line swaps maps, and the new map starts from its
  seeded start.
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
  density constant lives in config. The layout's box is the hero on the wide
  map and the street band on phones.

🟡 How that works in practice:

| | |
|---|---|
| Scale | Everything physical is in metres and converts at `CONFIG.world.pxPerM × roadsFor(layout).zoom` px per metre: 6 on the wide map, 3.6 on phones. So phone cars are 0.6 size and cover 0.6 as many px per second, like the phone roads. |
| Speeds | Cruise 36–44 km/h per car, which is 60–73px/s on the wide map. Turns at 15 km/h. Accelerate at 2.5 m/s², brake at 3.5 m/s², emergency up to 8 m/s². |
| Following | 1.2s time gap plus 1.5m, so about 9px bumper to bumper when stopped on the wide map. |
| Stopping | Only at crosses and Ts (`lane.to.stop`); corners and straight runs flow. A full stop just behind the zebra crossing, not at the box edge: `lane.p1` is at the box edge, so the stop point is `crosswalk.gap + crosswalk.depth` (from `roadsFor(layout)`) plus about 1px back from it. 0.4s dwell, then join the queue. |
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

### Built, Phase 3

`engine/traffic.js` follows the table above. Where the spec was silent, it
made these calls, all waiting for review:

- **Following** uses the intelligent driver model with the table's values:
  2.5 m/s² to accelerate, 3.5 m/s² to brake, a 1.2s time gap and a 1.5m
  standstill gap. Lines and turns get plain even braking instead: a car
  brakes as late as it can at 3.5 m/s² and arrives exactly on the line, or at
  15 km/h at the turn. Under both sit two limits nothing overrides. A car's
  nose never gets within 0.375m of the car ahead, and never passes a line it
  hasn't been given.
- **The body.** A car is its nose on a lane or a movement, and its body is
  the car length behind that along the same route. Both axles, 2.5m apart
  (`car.wheelbase`), sit on the path, and the body lies on the line between
  them. So a car cuts a turn a little, like a real one, and no corner of it
  leaves the road by more than 0.3px. The first version kept the bumpers on
  the path instead, and cut the tightest right turns by 6.5px.
- **Short blocks.** Where a block is too short to stop behind the crossing
  with the tail clear of the junction behind, the car stops with its tail
  half a metre (`traffic.boxClear`) past that junction, which puts its nose
  on the crossing. Open question 2 in §Handoff.
- **Don't block the box** means the exit has room for the whole car to stop
  at least `boxClear` past the box: up to the rear of the car ahead less the
  1.5m gap, or up to the exit's own line. Through a corner, where there's
  only one way on, the check carries on along the next lane.
- **Looking ahead.** A car looks 50m along its route (`traffic.lookahead`),
  choosing its turns as it goes, and stops looking at the first line it
  hasn't been given.
- **Rerouting** after 6s picks an exit with room if there is one, and any
  other exit if not.
- **Spawning.** A car comes in with its nose one car length in from the
  portal, so it starts fully off screen, at the fastest speed that can still
  stop for whatever is ahead. It picks a cruise speed from 36–44 km/h each
  time. The black car comes back first.
- **The start** puts the black car on a street with no portal at either end,
  so it begins in view. Every car starts at the fastest speed that can stop
  for what's ahead of it.
- **The count** includes the black car, and it drives on both maps. Open
  question 1 in §Handoff.
- **The black car** takes exits that don't lead straight to a portal
  whenever there is one. In the tests it's in view about 98% of the time.

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
- 🟡 Built in Phase 3, not yet reviewed: the body's corners are rounded to
  0.3 of its width, with a windscreen just ahead of the middle, a narrower
  rear window, and a headlight in each front corner, all as fractions of the
  car's size so phone cars keep the shape. Traffic glass is the blue mixed
  55% towards `--black`, and the black car's glass is `--black` mixed 30%
  towards white (`CONFIG.render.glass`). The shader writes the token values
  as they are, so the canvas shows the tokens' exact colours.

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

✅ Built in Phase 4 as above (`DriveButton.jsx`): a 36px pill with a 44px hit
area, "Drive" in sentence case, quieter than the CTAs' capitals, and a
steering wheel of rim, hub and three spokes. It shows once the cars are
showing, only with a fine pointer that can hover and the wide map, watched
live, and fades in with the cars.

✅ On press, the black car leaves traffic and is under your control from
wherever it is.

- 🟡 A ring pulses once around it, about 1s, so you can find it.
- 🟡 Starting gear: N if it's nearly stopped, otherwise the highest gear that
  keeps the engine at 2,000 rpm or more, clutch engaged. At a 40 km/h cruise
  that's 3rd.
- ✅ A controls hint appears for about 4s and then fades: **WASD drive · ↑↓ shift
  · Shift clutch · Esc exit**. 🟡 It sits just above the HUD in an
  `aria-live="polite"` region, so a screen reader hears it once.

✅ Built: the ring is black, 2.5px, growing from 16px to 40px radius and fading
over a second; under reduced motion it holds its full size for the second
instead. The starting gear is as above in manual; the automatic starts in 1st
at a standstill (§Gearbox and engine). The hint shows the keys as keycaps,
for the mode in use: the automatic's **WASD drive · M manual · Esc exit**, and
the manual's list above with **M automatic** added. It shows at the start of
a drive and again whenever the mode changes. A line only breaks between a key
and the next key's word, never inside a pair.

### Keys

| Key | Action |
|---|---|
| W | Throttle |
| S | Brake. In R, see below. |
| A / D | Steer. 🟡 ← and → do the same. |
| ↑ / ↓ | Shift up or down one step through R N 1 2 3 4 5 6. Key repeat is ignored. Manual only; the automatic ignores the lever. |
| Shift, either one, held | Clutch. Manual only. |
| M | ✅ Switch between the automatic and the manual box (§Decisions 19). Key repeat is ignored. The gear display has the same switch as a button. |
| Esc | Exit |

- ✅ **Reverse.** The brief reads "S brake (and reverse throttle when in R)".
  In R, S is the throttle and drives backwards, and W is the brake. The same
  in both modes. In the automatic, S held at a standstill selects R, and W at
  a standstill selects 1st.
- ✅ While driving, `preventDefault` on the arrows, WASD and Space so the page
  doesn't scroll. Space does nothing else. Released on exit.
- 🟡 Pedals and steering ease in and out over about 150ms. Keys are on or off,
  and a car that snaps to full lock reads as broken. ✅ Built at 0.06s for the
  steering and 0.08s for the pedals and clutch after Scott's first drive
  (§Decisions 18): 150ms read as lag.
- 🟡 Keys are ignored while Cmd, Ctrl or Alt is held, so browser shortcuts still
  work. Held keys clear on window blur, since a key released elsewhere never
  sends its keyup.
- ✅ All of this is built in `drive/input.js`: WASD, the arrows and M in
  Phase 4 and 5, heard on the hero only, never the window.

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

✅ Built in Phase 4 as above, and checked in Chrome. Focus moves to the panel
in a layout effect, in the same commit that swaps the pill for it; a later
effect let the pill's removal read as focus leaving the hero, which ended the
drive at once. When driving ends, focus goes back to the pill only if it was
still in the hero; tabbing away leaves it where it went.

✅ Changed with §Decisions 20: the HUD is in the driving layer now, so keys
are heard there and focus leaving the layer ends the drive. A click anywhere
on the page that isn't a control keeps focus, since the whole page is the
game. Focus goes to the HUD and back to the pill with `preventScroll`.

### Exit

✅ Esc, or a small × beside the gear indicator.

- The black car rejoins traffic at the nearest lane, by the same recovery path
  as a knocked car, described in §Driving and physics.
- Focus returns to the Drive button.
- Tyre marks carry on fading as normal. The prototype wiped them on exit; this
  doesn't.
- The HUD fades out and the pill comes back.

✅ Built in Phase 4, with two differences. The black car's way back is the
revised one in §Recovery. And the HUD doesn't fade out yet: it unmounts as
focus goes back to the pill, and the pill comes back at once.

✅ Since §Decisions 20, a drive that ends below the hero ends with the car
driving off the nearer side instead (§Driving the whole page).

### Pausing

✅ Pause the simulation when the hero scrolls out of view, and when the tab is
hidden. 🟡 Paused means the animation loop stops, not that it runs and skips
work. Resuming clears held keys and restarts the clock, so there's no jump.
✅ Built in Phase 3 for the traffic and Phase 4 for driving. Since §Decisions
20 the loop keeps running during a drive with the hero off screen.

## Driving the whole page

✅ **Added after Phase 5, September 24, at Scott's request** (§Decisions 20).
The black car isn't kept in the hero. A visitor can drive it over every
section of the homepage, down to the footer, and the page scrolls after it.

- **The layer.** For the length of a drive, the car canvas and the HUD move
  into `.drive-layer`, fixed over the window at z-index 90: over every
  section, under the nav (100) and the consent banner (1100). The canvas
  covers the window, and the camera follows the hero as the page scrolls.
  The traffic is clipped to the hero with a scissor, so cars leaving by a
  portal still vanish at its edge. The black car has its own instanced mesh
  and is drawn anywhere, one more draw call. When the car is back in
  traffic, the canvas goes back into the hero.
- **Walls.** The page's edges: its sides, its top (the nav's bottom when it's
  scrolled to the top) and the bottom of the footer. Only traffic cars inside
  the hero are solid. Past its edges they're out of sight, and the car
  mustn't hit what it can't see.
- **The follow** (`drive/follow.js`, pure and tested). In the bottom fifth
  of the window below the nav, a car heading down moves the page. The scroll
  wants the car's own speed plus a push that grows the deeper it is into
  the zone, 360 px/s at the very edge, so the car rides at the zone's edge.
  The push comes in with the car's speed, full from 30 px/s. The scroll
  picks up over about 0.15s and dies away over about 0.8s, so when the car
  slows or stops the page carries on for a moment. A car that stops dead
  from 120 km/h leaves the page gliding about 150px further; braking
  normally, less. The same at the top, for a car heading up.
- **A car standing near the bottom doesn't move the page.** It can be there
  when Drive is pressed. Only a car heading for an edge does.
- **The car never leaves the window.** However fast it goes, the page keeps
  it at least 8px from either end. The page stops at its own ends.
- **The visitor's own scroll wins.** A wheel, trackpad or scrollbar scroll
  holds the follow off for 0.5s, and a car scrolled out of view is left
  alone until it's back in view.
- **Reduced motion:** no momentum. The page moves with the car only as far
  as the car moves into the zone, and stops when it does.
- **Focus.** Keys are heard on the layer, where the HUD is. Tabbing away, or
  clicking a link or button anywhere on the page, ends the drive, and the
  link or button works. A click anywhere else keeps focus. Focus moves to
  the HUD and back to the pill with `preventScroll`, so ending a drive at the
  footer doesn't jump the page back to the hero.
- **Ending a drive away from the roads.** From the hero, the car finds its
  way back as before (§Recovery). From further down the page, that would be
  a minute's drive back up with nothing following it. So it turns for the
  nearer side, the way it's already facing if it's roughly across the page,
  drives off at 60 km/h with the walls gone, and comes back in at a way in.
  Under reduced motion it's parked on a street instead. The safety net is
  6s.
- **The loop** keeps running with the hero off screen, as long as there's a
  driver.
- **The engine does the DOM, the driver the logic.** Each frame the engine
  measures the window and the hero's place on the page, hands the driver
  new walls if the page has changed size, and treats any scroll it didn't
  make as the visitor's. The driver runs the follow each step, and the
  engine writes the result with `scrollTo({ behavior: 'instant' })`, since
  `globals.css` smooth-scrolls to `#packages`.

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

✅ **Retuned after Scott's first drive, September 24** (§Decisions 18): it
felt slow and clunky, and he wanted faster acceleration, quicker turning
and a drift at speed. Measured before and after, with the Phase 4 stand-in
automatic:

| | First build | Now |
|---|---|---|
| 0 to 100 km/h | never; 35 km/h after 2s | 1.8s |
| Top speed | 98 km/h | about 205 km/h, 340px/s |
| 90° at full lock, from 60 km/h | 2.0s | 0.9s |
| Drift | none | above 45 km/h at hard lock; the tail holds a slide of about 45 to 55° and catches when you straighten up |

What changed, all in `CONFIG.player`: grip from 14 to 40 m/s², with the
rear at 90% of the front so it's the tail that lets go; a drift state, in
which the rear drops to 45% of its grip over 0.2s, and which gives the
grip back past 30° of slide so a held drift never spins; steering lock 38°,
falling only to 65% by 160 km/h; the steering easing in over 0.06s instead
of 0.15s, and the pedals over 0.08s; brakes 14 m/s²; drag that grows with
speed, so it launches hard and tapers near the top; the stand-in's pull 18
m/s², reversing at up to 25 km/h; and light yaw damping. Phase 5's gearbox
takes over the pull, with `torqueScale` tuned to match.

### Walls

✅ The hero's edges are soft walls. The car bounces off and loses some speed.
🟡 A static chain around the hero with restitution 0.35. The top wall is the
bottom of the fixed nav, not the hero's top edge, so the car can't hide under
the nav. Traffic passes through the walls to reach its portals, since walls only
touch dynamic bodies. ✅ Built in Phase 4. The top wall moves as the page
scrolls, since the nav is fixed and the hero isn't.

✅ Changed with §Decisions 20: the walls are the page's edges, from the top
of the page to the bottom of the footer, and they don't move. The follow
keeps the car below the nav instead (§Driving the whole page).

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

✅ Built in Phase 4: the world on the first press, and every traffic car a
kinematic body driven by velocity (teleported only when it jumps, coming back
in at a way in). Traffic also stops for a car off the lanes (§Phase 4 as
built). The knock itself, the switch to dynamic, is Phase 6; until then the
visitor's car bounces off traffic as off a wall.

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

🟡 **Built in Phase 4, for the black car, and changed from the table above
after testing** (`drive/index.js`, `sim.landing()` in `engine/traffic.js`,
`CONFIG.recovery`). The table's version brought back only about three
quarters of 60 random test drives: a drive can end anywhere, in the middle
of a block, over the headline, pinned to a wall, at a steep angle to the
road, while a knocked car in Phase 6 lands a few metres from its lane. What
replaced it, row by row:

| Step | As built |
|---|---|
| Target | The lane spot that costs least: distance, plus a car length per radian of turning, plus four car lengths for a lane that leads off the edge. Lanes up to 120° off the heading count, so a car pointing straight across the nearest road can still join it. The spot has to have a car length of lane to join on, be clear of other cars by a stopped car's gap, sit fully inside the walls, and be ahead of the car's nose, a couple of car lengths on. |
| Drive | A curve from where the car is, leaving along its heading, to the spot, arriving along the lane, then on down the lane to its line. The car follows it with velocity and turn rate set directly, still a solid body, at up to 30 km/h while the spot is far and 10 km/h for the last few car lengths. It stops at the line if it gets there, and keeps a stopped car's gap behind any car ahead. |
| Blocked | Standing still short of the line for a second, or getting no further along the curve for two, it backs off for a second and plans again. Usually it's waiting on a traffic car that's waiting on it. |
| Blend | Within 1m of the lane's centre line and 20° of its heading, with room to join (not touching anything; the following rules keep the gap from there), it rejoins and what's drawn eases into the lane pose over 0.5s. |
| Stuck | 8s after first reaching the spot, or 20s in all, it goes off at an edge and comes straight back in. The fade-out waits for Phase 6. |

In 200 random drives it made 199 back, median 4.8s, 95% within 12s.

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

✅ **Built in Phase 5, in two modes** (§Decisions 19). Scott kept the Phase 4
automatic and asked for the manual beside it, with a switch. Both are the
same box on the same six gears in `drive/gearbox.js`:

- **Manual** is everything above, built as written.
- **Automatic** changes gear and works the clutch itself. It changes up
  between 2,800 and 6,600 rpm, higher the harder the throttle, and down below
  1,800, with a kickdown flat out while the gear below stays under 5,800. A
  change cuts the drive for 0.09s. It never stalls or grinds. At a standstill
  S held selects R and W selects 1st.
- Switching mid-drive keeps the gear. Into the automatic, a stall or a wait
  is simply over, and N becomes whatever gear suits the speed.

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

✅ Tuned in Phase 5: a 200 Nm peak on that curve, times a `torqueScale` of 5.5,
capped at 18 m/s² of traction at the rear tyres. So 1st and 2nd launch as hard
as the Phase 4 stand-in Scott liked, and 3rd to 6th are torque-limited and
feel different. With the lighter drag (§The player car) the automatic does 0
to 100 km/h in 1.9s and tops out about 207 km/h, in 5th or 6th; in manual the
limiter stops each gear at the speeds in the table.

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

✅ **Built in Phase 5** (`Hud.jsx`, `GearGate.jsx`, `gate.js`), with the
`frontend-design` plugin, in the About page's shift-gate language: white
lines and a white, red-ringed knob on the hero red. Everything above, plus:

- **The layout,** a 14rem plate in the pill's corner: the gate and the
  numeral with the × beside them; the rev bar with the clutch lamp; and an
  Auto / Manual switch along the bottom.
- **The gate** labels its seven gears, the current one lit. N sits on the
  neutral plane level with 3 and 4. The knob travels at 180 units a second
  on `EASE_SHIFT`, 0.16s at the least.
- **The rev bar** tints the band past the redline in `--red-deep` as well as
  marking it.
- **The clutch lamp** shows in manual only.
- **The Auto / Manual switch** is a real button, also on M, with the mode in
  its label ("Automatic gearbox. Switch to manual"), and a 44px hit area. It
  and the × are what screen readers get; the rest is `aria-hidden`.
- **A grind** turns the numeral black for 0.4s, and when motion is allowed
  shakes the gate and numeral sideways for 0.3s as well.
- **Motion:** the plate rises 8px and fades in over `DUR_QUICK`. The fade is
  on opacity, not `autoAlpha`, because the plate already has focus and a
  hidden element can't keep it. It doesn't fade out yet (§Exit).
- **Per frame:** the engine calls `onFrame` with the driver's telemetry after
  each frame drawn; HeroStage writes the rev bar and the limiter flicker
  straight to the DOM and sets React state only on gear, mode, clutch or
  engine-state changes.
- **Loading:** the display loads with the drive chunk, on the pill's hover or
  focus, and is held in state once loaded rather than `React.lazy`, which
  suspends on its first render and would miss the focus handover.
- **Since §Decisions 20** it renders into the driving layer through a
  portal, so it sits in the window's bottom-right corner and stays there as
  the page scrolls.

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
button isn't rendered at all. ✅ Built in Phase 4, ahead of Phase 7: the pill
needs the wide map and a fine pointer that can hover, both watched live, and
driving ends if either stops being true mid-drive.

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
- The setting is watched live, like the reviews marquee. Built in Phase 3:
  HeroStage plays the traffic only inside `gsap.matchMedia(MOTION_OK)`, so
  with reduced motion the engine draws the seeded start once and never
  starts its loop. Turning reduced motion on mid-drive stops the loop and
  puts every car back at the seeded start.

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
- **Built in Phase 3:** the ambient chunk loads after `load`, then
  `requestIdleCallback` with a 2s timeout, or a 200ms timeout in Safari, and
  only where `WebGL2RenderingContext` exists. If the renderer still fails to
  start, the roads stay and nothing else happens. The chunk is 136KB
  gzipped, three.js included, and the homepage's first-load JS grew 1.2KB.
  Skipping it under save-data or when the hero was never on screen is still
  Phase 7, with the rest of the WebGL-failure handling.
- **Built in Phases 4 and 5:** the drive chunk (planck, `drive/`, and the gear
  display with it) starts loading on the pill's hover or focus, at the latest
  on the press, and phones and touch screens never load it. It's 50.8KB
  gzipped. The ambient chunk is 138KB. The homepage's first-load JS is 3.7KB
  above `d4805e0`, the commit before Phase 3, for Phases 3 to 5 together.
  Two draw calls so far, the cars and the ring; marks and smoke come in Phase
  6.

## Accessibility

- The road layer and car canvas are `aria-hidden`. The text underneath is ordinary
  HTML, selectable and read normally. A car driving over it doesn't change that.
- Keyboard: the Drive button is in the tab order. Driving keys work only while
  focus is in the hero. Esc and × both exit, and focus goes back to the button.
- Contrast: the Drive label passes AA at rest, solid `--chrome` at 4.64:1
  (§Conflicts). The hint uses solid `--cream`.
- Targets: the Drive pill, the × and the Auto / Manual switch are at least
  44px.
- The gear display is `aria-hidden` apart from the switch, the × and the
  hint's live region. The switch's name says the mode and what pressing it
  does. The hint is announced when a drive starts and when the mode changes.
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
  HeroStage.jsx       client: headline check, loads the ambient chunk and hands it the map;
                      later loads the drive chunk, owns play mode, renders Drive, hint, HUD
  HeroStage.css
  DriveButton.jsx
  ControlsHint.jsx
  Hud.jsx + Hud.css   the gear display, loaded with the drive chunk
  GearGate.jsx        its H-pattern and travelling knob
  gate.js             where the gears sit in it, and the knob's route        (pure)
  gate.test.js
  engine/             the ambient chunk
    index.js          loop, rescale, observers, pause and resume, the dev step hook
    render.js         three.js scene, camera, car instances, ring
    traffic.js        lane following, gaps, reservations, turns, portals          (pure)
    traffic.test.js   the headless traffic test
    marks.js
    smoke.js
  drive/              the drive chunk
    index.js          planck world, walls, contacts, recovery
    player.js         car forces, lateral grip, steering
    input.js          keyboard, focus, preventDefault
    gearbox.js        engine and gearbox model, manual and automatic         (pure)
    gearbox.test.js
    drive.test.js     the headless play-mode tests
  __fixtures__/
    copy-rects.json   where the copy lands at 32 sizes, and the phone band
    record.md         how to re-record it
  graph.test.js
  layout.test.js
```

- ✅ `Hero.jsx` stays in `src/components/home/` next to the other homepage
  sections. It renders both `RoadLayer`s and `HeroStage` inside the section.
- ✅ Built so far: `config.js` (the world, car, roads, layout, traffic and
  render sections; the rest arrive with their phases), `layouts/`,
  `graph.js`, `layout.js`, `RoadLayer`, `HeroStage`, in Phase 3
  `engine/index.js`, `render.js` and `traffic.js`, and in Phase 4
  `DriveButton`, `ControlsHint`, `Hud` and `drive/index.js`, `player.js` and
  `input.js`, and in Phase 5 `drive/gearbox.js`, `GearGate`, `gate.js` and
  the gear display, with the tests. `marks.js` and `smoke.js` are still to
  come. The pure
  modules import each other with `.js` extensions, which Node needs and the
  bundler accepts.
- ✅ Graph paths' `at(s, out)` fills `out` when given one, so the traffic loop
  reuses its pose objects instead of allocating two per car per step.
- ✅ GSAP comes from `src/lib/gsap.js`, and motion values from `src/lib/motion.js`.
- Anything marked "pure" imports neither three.js nor planck nor the DOM, so
  Node can run it.

### Config, starting values

🟡 All tunable. The shape matters more than the numbers. `world`, `car`,
`roads`, `layout`, `traffic`, `player`, `gearbox`, `recovery`, `follow` and
`render` exist in `config.js` today, with the values below; the other
sections are still to add, each with its phase. Driving the whole page
added `follow` and `recovery.leaveKmh` and `leaveMax`.
Road sizes are the wide map's; `roadsFor(layout)` scales them by
`layout.zoom`. Phase 3 added three traffic values the first draft didn't
have: `lineGap`, the px between a stopped car's nose and the crossing;
`boxClear`, how far past a junction a car must be able to stop before it
enters; and `lookahead`. It also added `render.glass`. Phase 5 added
`gearbox` (the arcade engine's `peakTorque` and `torqueScale`, rev rates,
decelerations, the automatic's shift points and `defaultMode`) and
`player.traction` and `rearGripSpin`, removed the stand-in's `auto`, and
lightened `player.drag`. Phase 4 filled in
`player` (mass, grip, the drift, drag, the ease on pedals and steering, and
`auto`, the stand-in automatic until the gearbox; retuned after Scott's
first drive, §Decisions 18) and the recovery values the
black car's return uses (§Recovery, as built), and added `render.ring`.
`roads.side` is 40 since every road became one width (§Decisions 15).

```js
export const CONFIG = {
  world:    { pxPerM: 6, step: 1 / 120, maxSteps: 8, seed: 20260924 },
  roads:    { main: 40, side: 40, tick: { width: 2, length: 8, gap: 10 },
              crosswalk: { gap: 3, depth: 10, stripe: 2, space: 6 }, clearance: 48 },
  layout:   { wideQuery: '(min-width: 768px)', resizeDebounce: 150,
              zoom: { wide: 1, compact: 0.6 } },
  traffic:  { pxPerCar: 90_000, min: 6, max: 16, compactMin: 4,
              cruiseKmh: [36, 44], turnKmh: 15, accel: 2.5, decel: 3.5, maxDecel: 8,
              headway: 1.2, stopGap: 1.5, dwell: 0.4, reroute: 6,
              lineGap: 1, boxClear: 0.5, lookahead: 50 },
  car:      { length: 4.0, width: 1.83, wheelbase: 2.5 },
  player:   { mass: 1200, maxSteerDeg: 38, steerAtTop: 0.65, topKmh: 160,
              grip: 40, rearGrip: 0.9, spinDamping: 2.5,
              drift: { fromKmh: 45, steer: 0.7, rearGrip: 0.45, ease: 0.2, maxSlipDeg: 30, spinDeg: 50 },
              brake: 14, hardBrake: 0.8, rearGripBraking: 0.75,
              rearGripSpin: 0.55, traction: 18,
              drag: { linear: 0.08, quad: 0.0014 }, ease: { steer: 0.06, pedal: 0.08 },
              wallRestitution: 0.35 },
  gearbox:  { order: ['R', 'N', '1', '2', '3', '4', '5', '6'],
              ratios: { R: 3.45, 1: 3.36, 2: 2.09, 3: 1.47, 4: 1.1, 5: 0.87, 6: 0.73 },
              finalDrive: 4.1, tyreRadius: 0.31, peakTorque: 200, torqueScale: 5.5,
              idle: 900, redline: 7000, limiterDrop: 300, revRate: 12000, stallBelow: 600,
              stallTime: 0.8, stallDecel: 6, overrevDecel: 9, lockDecel: 8, engineBrake: 3,
              wheelspinAbove: 4500, wheelspinTime: 0.6, creep: 0.1, startGearRpm: 2000,
              auto: { upLight: 2800, upFull: 6600, down: 1800, kickdown: 5800, shiftTime: 0.09 },
              defaultMode: 'auto' },
  recovery: { rejoinKmh: 10, approachKmh: 30, lead: [1, 1.5], near: 1, nearDeg: 20,
              blend: 0.5, maxTurnDeg: 120, giveUp: 8, giveUpMax: 20,
              leaveKmh: 60, leaveMax: 6,
              // Phase 6: settleSpeed: 0.5, settleSpin: 0.3, settleMax: 2, nudgeAbove: 1
            },
  follow:   { zone: 0.2, push: 360, rise: 0.15, coast: 0.8, edge: 8, hold: 0.5 },
  marks:    { pool: 6000, width: 1.5, every: 3, fade: 10, slip: 1.5, brakeAbove: 0.8 },
  smoke:    { pool: 160, life: 1, from: 6, to: 22, alpha: 0.5 },
  render:   { maxDpr: 2, glass: { traffic: 0.55, black: 0.3 },
              ring: { life: 1, from: 16, to: 40, width: 2.5 } },
}
```

## Tests

✅ Node's built-in runner, `node --test`, through `npm test`. Node 24 is
installed, the pure modules are plain ESM, and it adds no dependency. Tests
read the layout JSON with `readFileSync` rather than an import, which avoids
import-attribute differences between Node and the Next bundler. They lint
clean under the existing `eslint.config.js`.

**77 tests, all passing,** after the whole-page drive. `graph.test.js` has
13, `layout.test.js` 20, `engine/traffic.test.js` 12, `drive/drive.test.js`
11, `drive/gearbox.test.js` 12, `drive/follow.test.js` 7 and `gate.test.js`
2. The whole run takes about 3s, the traffic and drive tests in parallel.

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
  printed. At least one side street; it was three until the map was thinned
  in review.
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
- **Traffic, headless:** 5 simulated minutes at three sizes with a fixed seed,
  wide 1440×716, wide 768×960 and the phone band at 390×240. No two cars
  ever overlap, by an oriented-box test every step. The count stays constant
  apart from a pending respawn, and no respawn waits 2s. Every car moves at
  least once every 15s, so nothing is deadlocked; the longest wait printed
  is 9.1s. Never more than one car in a junction's box. A car waiting at a
  junction has its nose just behind the crossing, and the test prints the
  short blocks where it's on the crossing instead.
- **Traffic, beyond the brief:** the car count and its limits. Phone cars at
  0.6 size and speed. The same seed gives the same traffic, and another seed
  doesn't. Every car starts on a lane, clear of every box and every other
  car. Cars leave by the portals and come back, and the black car is in
  view over 90% of the time. No corner of any car leaves the road through a
  turn, by more than 0.5px. A resize keeps each car on its lane at the same
  fraction, overlaps nothing, and brings the count to the new size. In the
  three short windows, with the runtime rules hiding three segments, no car
  ever drives on one or gets stuck. At every recorded size, a car can be let
  onto every lane out of a junction.
- **Play mode, headless** (`drive/drive.test.js`, planck in Node, no
  keyboard): the car does 0 to 100 km/h inside 2.5s, tops out between 180
  and 230 km/h, and coasts down; the brakes stop it from 100 km/h in under
  30m and S held then reverses it; a quarter turn at full lock takes under
  1.2s from 30, 60 and 100 km/h; below 45 km/h full lock never drifts, and
  above it a held drift slides more than 20° and less than 80°, then catches
  within 1.5s of straightening up. In manual the driver shifts with the
  clutch and grinds without, and M hands over to the automatic, which never
  stalls.
  Pressing Drive takes the black car out of traffic and shows the ring;
  a minute's wandering drive at three sizes never leaves the walls or touches
  a traffic car. Parked in the road, traffic stops for it and never runs
  into it. When driving ends, 24 drives out of 24 find their way back, none
  touches traffic on the way, and traffic flows normally afterwards. Under
  reduced motion only the visitor's car moves. Pressed while the black car is
  off screen, control starts only once it's fully inside.
- **Gearbox** (`drive/gearbox.test.js`, with a one-line car moving the wheel
  speed): taken over at a standstill it's in N, at 40 km/h in 3rd with 2,000
  rpm or more, and the automatic starts in 1st; shifting without the clutch
  grinds and keeps the gear, and the grind reaches the next report; N and
  clutch-in rev freely, bounce off the limiter and settle back to idle; the
  clutch out in 2nd at a standstill stalls, and 1st and R pull away with
  launch assist; 1st creeps at 5 to 9 km/h; braking to a stop in 3rd stalls
  once and then waits instead of stalling again, until a change down to 1st;
  a downshift past the redline over-revs and brakes until the revs come
  down; dropping the clutch at high revs in 1st spins the wheels; R while
  rolling forward grinds, locks the rear to a stop, then reverses; the
  automatic climbs 1, 2, 3, 4 flat out with 0 to 100 km/h inside 2.6s, comes
  down through the gears, selects R on S at a standstill and never stalls
  or grinds; switching modes keeps the gear, the automatic ignores the
  lever, and a stall is simply over in the automatic.
- **The page following the car** (`drive/follow.test.js`, the window as
  numbers): in the middle of the window, or standing near the bottom, the
  page stays put; driving down at 100, 200 and 345 px/s it follows from the
  zone, keeps pace, and never lets the car within 8px of the bottom; when
  the car stops the page carries on more than 40px in half a second, then
  stops; driving up, it follows at the top and never lets the car under the
  nav; it stops at both ends of the page; a visitor's own scroll holds it
  off, and a car below the window is left alone; under reduced motion it
  moves only with the car. And in `drive/drive.test.js`, on the whole
  page's walls the car drives 400px below the hero without touching traffic
  or leaving the walls, and stopped there it leaves by the side inside the
  safety net and comes back in at a way in.
- **The knob's route** (`gate.test.js`): between any two gears, every leg
  runs along a slot or the neutral plane, never across the gate, and ends in
  the right slot; a change mid-travel sets off from where the knob has got
  to.
- **Room for a car:** at every recorded size the room rule hides nothing.
  In the short windows it hides roads until every lane holds a car, and the
  map still passes `checkGraph()`.

**Re-recording the fixture.** When the hero copy, CSS or fonts change,
follow `__fixtures__/record.md`: a console script that loads `/` in sized
iframes and prints the new `sizes` array.

## Phases

✅ The brief's seven phases. I stop after each one, summarise, and wait.

| # | Delivers | Done when |
|---|---|---|
| 1 | This file | ✅ Reviewed September 24 |
| 2 | ✅ Done, commits `8bd1a72` and `f922e2e`. Layout JSON for both layouts, `graph.js`, `layout.js`, `RoadLayer.jsx` server-rendered, the half-width copy and the phone street band, resize, the headline check, `npm test` with layout and graph tests, the fixture, prototype folder dealt with, `08-motion.md` §The hero updated | ✅ Built September 24, then revised the same day: the road layer rebuilt so ticks end cleanly, zebra crossings at every junction (then thinned), and a bigger, less regular phone map under smaller phone type, then drawn zoomed out. 31 tests pass, lint and build clean, checked in Chrome at 360, 390, 768 and 1440px. |
| 3 | **Built September 24; roads reviewed and approved (§Decisions 14 to 17).** `engine/`: renderer, cars, traffic, reservations, Ts and corners, turns, portals, respawn, stopping behind the crossings, fade-in, pause and resume, seeded start, on both maps. Pulled forward from Phase 7: the parked frame under reduced motion, and lazy loading. See §Handoff. | Headless traffic test passes. In Chrome at 390, 768, 1440 and 1920px: cars follow lanes, stop behind crossings, take junctions one at a time, respawn, never overlap; parked under reduced motion. `08-motion.md` rules 7 and 8 updated. All done, except that reduced motion was checked through `park()` rather than by toggling the setting (§Handoff). 42 tests, lint and build clean. |
| 4 | **Built September 24; retuned after Scott's first drive (§Decisions 18).** Drive button, `drive/` with planck, walls, player forces, input and focus, driving over text, exit and rejoin, controls hint, takeover ring. See §Handoff. | Keyboard-only run-through: enter, drive, Tab away, Esc, focus back on Drive. Done in Chrome (§Handoff, Phase 4 as built). Retuned after Scott's first drive (§Decisions 18). 54 tests, lint and build clean. |
| 5 | **Built September 24, waiting for review.** `gearbox.js` and tests, in manual and automatic with a switch (§Decisions 19), then the HUD. Then, at Scott's request, the car driving the whole page (§Decisions 20). See §Handoff. | Gearbox tests pass (12). The HUD checked in the browser in both modes; the whole-page drive checked in the browser, and Scott liked it; his review of the rest next. 77 tests, lint and build clean. |
| 6 | Kinematic-to-dynamic knocks, recovery, anti-cascade, tyre marks, smoke | A chain of knocks through a full 16-car hero clears on its own within 15s |
| 7 | Phones and touch (Drive hidden; done early, in Phase 4), finishing reduced motion and lazy loading, save-data, WebGL-failure handling, disposal, performance pass, bundle report (sizes so far in §Loading and performance) | 60fps with 16 cars, a full mark pool and smoke on a mid-range laptop. Reduced-motion and no-JS checks from `08-motion.md` pass. Chunk sizes reported. |

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
   `overhaul`. At the end of the day the branch was deleted too.
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

From the review of the built Phase 3:

14. **Fewer roads on both maps,** since both read as slightly too busy. Four
    came out of the wide map and two out of the phone map, all side streets
    or stubs, so the wide grid is still 27% removed (§The wide map, §The
    phone map). Scott reviews the roads next, and the traffic after that.
15. **Every road one width,** with no mix of sizes: side streets went from
    24px to 40px, the same as a main road, and 14.4px to 24px on phones. The
    brief's 60% is retired. And one more road off the wide map: the middle of
    the three short roads off V3 to the right edge, at y 0.55. Widening the
    last side street costs the blocks either side of it 16px; see §Handoff,
    open question 2.
16. **The phone band is always 240px,** its smallest height, and the hero on
    phones is just the copy and the band instead of the whole first screen
    (§Two layouts).
17. **Roads approved.** The side street across the middle block stays. Its
    short blocks are handled instead: the traffic lets a car onto a block
    as short as its stop point allows, which fixed the jam at 1280×600, and
    in windows too short for it the new room rule hides it (§Room for a
    car).

From Scott's first drive of the built Phase 4:

18. **Faster, quicker to turn, and a drift.** The car felt slow and clunky.
    It now does 0 to 100 km/h in 1.8s and tops out around 205 km/h, turns a
    quarter turn in about 0.9s, and drifts above 45 km/h at hard lock,
    holding the slide without spinning (§The player car).

Starting Phase 5:

19. **Both gearboxes, and a switch.** Scott liked the Phase 4 automatic and
    wanted the manual added, not swapped in, with a way to toggle between
    them and "a clever visual to show what gear we're in". The automatic is
    now a mode of the same gearbox, on the same six gears, so the gear
    display means something in both; the switch is a button on the display
    and the M key, and the choice is remembered (§Phase 5 as built).

After Phase 5:

20. **The whole page.** Scott wanted the car able to drive over the entire
    website, with the page scrolling after it smoothly when the car is near
    the bottom of the screen, "with some velocity and momentum, so even if
    the car slows down the page keeps scrolling a bit". I pointed out that
    `08-motion.md` rule 6 bans scroll-jacking; he asked for it anyway. Built
    as §Driving the whole page, with the top followed too, and rule 6 given
    the exception. He tried it and called it amazing.

The Safari question about SVG dash lengths went away with the SVG. The
questions still open are in §Handoff, §Open questions.

📎 No pending assets. The icon and the HUD are drawn in code.

## Docs to update as this lands

- ✅ `08-motion.md` §The hero: no photo, and the city behind the copy (Phase 2).
- ✅ `08-motion.md` rules 7 and 8: the hero traffic and the Drive opt-in, and
  §The hero's settled signal (Phase 3).
- ✅ `02-architecture.md`: component map and `src/components/hero/` (Phase 2),
  then `engine/` and the three.js chunk (Phase 3).
- ✅ `07-status.md`: the hero rebuild under recent work (Phase 2, then each
  phase).
- ✅ `README.md`: this file in the file table (Phase 2).
- ✅ `05-analytics.md`: the Drive event (Phase 4).
- ✅ `08-motion.md` §The hero: the Drive pill fades in with the cars (Phase
  4), and the gear display's motion (Phase 5).
- ✅ `02-architecture.md`: planck and `drive/` (Phase 4), the gearbox and the
  gear display (Phase 5).
- ✅ `08-motion.md` rule 6: the exception for driving the whole page, and
  §The hero: the follow under reduced motion (§Decisions 20).
