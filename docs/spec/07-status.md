# 07 — Status

**Last updated:** October 14, 2026.

Where the build actually is, and every question still waiting on a human. If
this file disagrees with another doc about current state, this file wins.

## In one paragraph

The Next.js rebuild is **complete and unmerged**. All 9 routes carry real
content, analytics and consent are wired, and the October winter pricing has
been applied to both branches. It is deployed to its own Vercel project for
review while `main` keeps serving customers the original Vite site. Three rounds
of client review — August 16 (copy and structure), August 18 (layout, mobile,
package cards) and August 20 (the hub's chooser) — have been applied, and in
September the homepage got a redesign pass: beige light sections, rewritten
copy, and GSAP motion. One piece is still being built: **the homepage hero is
being rebuilt as a small city with traffic and a car you can drive**
(`hero-drive.md`), in seven phases. Six are built, committed and pushed:
the roads, the traffic, a car you can drive over the whole page with a
manual or automatic gearbox, a dashboard along the bottom of the window,
tyre marks, and traffic that's bumped out of its lane when you hit it,
with sparks and smoke. Phase 7, performance and fallbacks, is left.
Everything else that remains before cutover is verification and client
sign-off. The other caveat: **the July QA pass no longer reflects
the build**, so re-running it is now a cutover requirement rather than a
formality.

## In progress — the hero rebuild (from September 24, 2026)

The homepage hero becomes a top-down city on the brand red: white roads,
blue traffic that stops at every junction, and one black car a visitor can
drive, with a real manual gearbox or an automatic one, anywhere on the
page. Phases 1 to 6 are built and pushed; the log below runs in order. The copy and both CTAs stay as they are, in
HTML. The spec is `hero-drive.md`; it was reviewed and every recommendation
accepted on September 24.

- **Phase 1, the spec:** ✅ done.
- **Phase 2, the roads:** ✅ done, and revised after review the same day.
  From 768px the copy keeps to the left half of the hero and a fixed downtown
  map fills the right. The headline comes down to fit, 72px at 1920px instead
  of 96px. On phones the hero is the copy, a size smaller with the two
  buttons on one row, then a street band 240px tall (fixed at that in the
  Phase 3 review; it used to grow to fill the first screen). Both maps
  became uniform grids on October 8, with the phone buttons moved inside the
  band (below). The roads are server-rendered
  positioned elements, so they're there with no JavaScript; centre ticks end
  in whole ticks at every junction, and every road into a cross or a T has a
  thin zebra crossing, black until October 8 and grey since, when the
  blocks' corners were rounded (below). The phone map is drawn zoomed out, every road
  size at 0.6, so the blocks have room. A client check hides any road that
  comes within 48px of the copy; at all 32 measured sizes nothing needs
  hiding. 31 tests (`npm test`). Committed as `8bd1a72` and `f922e2e`, and
  pushed to `origin/overhaul`, so it's on the review deployment.
- **Phase 3, ambient traffic:** built September 24. Blue cars drive both maps: they keep their lanes and
  their distance, stop just behind each zebra crossing, take every cross and
  T one at a time, and leave by the edges to come back in elsewhere. The
  black car drives with them until Phase 4 makes it drivable. It's three.js,
  loaded as its own 136KB chunk once the page is idle, and the homepage's
  first-load JS grew 1.2KB. Under reduced motion the cars are drawn parked
  and never move; `08-motion.md` rules 7 and 8 now say so. A headless test
  drives five simulated minutes on three sizes and checks that no two cars
  ever touch and nothing jams. 42 tests, lint and build clean. Two questions
  are open for Scott, in `hero-drive.md` §Handoff: whether the black car
  belongs on phones, where it can't be driven, and the few short blocks
  where a stopped car sits on the crossing.
- **First Phase 3 revision, the same day:** both maps read as slightly too
  busy, so four roads came out of the desktop map and two out of the phone
  map. All were side streets or short stubs, so the desktop grid still has
  the brief's 20 to 30% of its roads removed. Scott reviews the roads next,
  and the car logic after that.
- **Second revision, the same day:** every road is now one width, 40px on
  desktop and 24px on phones, where side streets used to be 60% of that.
  One more short road came off the desktop map's right edge. The wider side
  street leaves the blocks beside it too short in windows under about 730px
  tall, and at 1280×600 the traffic can jam there; `hero-drive.md` §Handoff
  has the options.
- **Third revision:** the phone street band is always 240px, its smallest
  height, so the hero on a tall phone no longer stretches to fill the
  screen.
- **Roads approved.** The side street stays. The traffic now copes with its
  short blocks, and a new runtime rule hides it in windows too short for it,
  including phones on their side.
- **Phase 4, the drivable car:** built September 24. On a desktop-class screen a small Drive pill sits in
  the hero's bottom-right corner. Press it and the black car is yours with
  WASD or the arrows until Esc or the ×; it drives anywhere in the hero,
  over the headline too, bounces off the edges and off traffic, and traffic
  stops for it. When you stop, it drives itself back into traffic. Physics is
  planck.js, loaded only when the pill is hovered or pressed, as a 49KB
  chunk. Until Phase 5, a stand-in automatic drove it.
  Pressing Drive sends one GA4 event, `hero_drive` (`05-analytics.md`).
  Keyboard and focus rules follow the spec, checked in Chrome. 54 tests, lint
  and build clean. A few recovery values were changed from the spec after
  testing; `hero-drive.md` §Handoff lists them for review.
- **First Phase 4 revision, the same day:** after Scott's test drive it felt
  slow and clunky. It's retuned: 0 to 100 km/h in 1.8s, top speed about 205
  km/h, a quarter turn in about 0.9s, and a drift above 45 km/h that holds
  without spinning.
- **Phase 5, the gearbox and gear display:** built September 24, and
  revised at Scott's request in the entries below. A real six-speed box
  with a clutch,
  in two modes: manual (↑ and ↓ shift, Shift is the clutch; it grinds,
  stalls and over-revs like a real one) and automatic (it shifts itself and
  feels like the Phase 4 car Scott liked). A button on the display, or M,
  switches between them, and the choice is remembered. The "Driving" panel
  became a gear display in the About page's shift-gate style: an H-pattern
  with a knob that travels through neutral, the gear as a big numeral, a rev
  bar with the redline, a clutch lamp, and the switch. Automatic is the
  default until a visitor picks; that's a question for Scott. 69 tests,
  lint and build clean.
- **Phases 3 to 5 and the whole-page drive are committed and pushed** to
  `origin/overhaul`, September 24, so the review deployment has them.
- **After Phase 5, the whole page:** at Scott's request the black car can
  now be driven over every section of the homepage, down to the footer.
  Near the bottom or top of the window the page scrolls after it, with
  momentum, so it carries on for a moment after the car slows. The visitor's
  own scroll always wins. A drive that ends below the hero ends with the car
  driving off the side and coming back in at a way in. This is an exception
  to `08-motion.md` rule 6 (no scroll-jacking), which now says so. Built
  September 24; Scott tried it and liked it. 77 tests, lint and build
  clean.
- **Tyre marks, September 25:** at Scott's request, pulled forward from
  Phase 6 on their own. The black car leaves marks whenever it's driven:
  faint while the wheels roll, darker and wider when a tyre slides, in a
  drift, a skid, hard braking or wheelspin. They fade over 5 to 10s, under
  the cars and anywhere on the page. The spec only marked skids; this is
  Scott's change, recorded as Decision 21. Also fixed: the gear display's
  knob went back to N before every change. 82 tests, lint and build
  clean.
- **The reviews strip as a treadmill, September 25:** at Scott's request.
  While the black car is on the moving reviews, the strip carries it and
  its tyre marks along, and the car's wheels push the strip back under it:
  drive right and the reviews run left, faster the faster the car goes;
  drive left and they turn round. With no car on it the strip drifts as
  before. 88 tests, lint and build clean. Which way it should run is a
  question for Scott (`hero-drive.md` §Open questions).
- **The September 25 work is committed and pushed** to `origin/overhaul`,
  all of it below, so the review deployment has it.
- **The driving display, redesigned, September 25:** at Scott's request,
  in four rounds the same day. The button says "Test drive". The display
  runs along the bottom of the window like a car's dash: a half-circle
  speedometer with a thin rev arc inside in the bottom-left corner; a dock
  in the middle with the keys when a drive starts, above the Auto / Manual
  switch and Stop; and a large gear shifter in the bottom-right corner, with
  a clutch lamp in manual. Each sits on a pod of dark, blurred glass shaped
  to it (a dome for the speedometer) rather than a box. Nothing rides above the car. The corner panel is
  gone. 88 tests, lint and build clean.
- **The black car starts up top, September 25:** on load it now starts on a
  street in the top part of the map instead of wherever the seed put it,
  which was often the bottom-left corner.
- **Ending a drive, September 25:** the car now always drives itself off
  the side of the window, fast (to 150 km/h, off in 2.5s at the median),
  is only handed back once it's out of sight, and comes back in at the top
  of the map. 89 tests, lint clean.
- **Phase 6, with effects, September 25:** at Scott's request. Traffic cars
  the black car hits are bumped out of their lanes as real bodies, slide
  and spin, bump others only above a nudge, and drive themselves back into
  their lanes; nothing else happens to them. Sparks where cars hit; smoke on
  a stall, an over-rev and sliding tyres. Fire was built and taken out the
  same day, at Scott's word. 92 tests, lint and build clean.
- **The gearbox switch, September 25, committed October 7:** at Scott's
  request ("i dont like the M its not very clear"), the dock's Auto / Manual
  toggle with an M keycap is now two buttons, Automatic and Manual, with a
  white thumb under the one in use, and the keys above name M in words.
  The session that built it ended before it was checked in a browser, so
  Scott hasn't seen it yet (`hero-drive.md` §Decisions 29, §Open
  questions 8). 92 tests, lint and build clean.
- **A uniform grid, October 8:** Sam doesn't like the random pattern, so the
  wide map (768px and up) is now evenly spaced columns and rows, every block
  the same size, with the headline in one open block and no side streets.
  It replaces the brief's merged, uneven grid, and the tests hold it to the
  new rule (`hero-drive.md` §The wide map, §Decisions 30).
- **On phones, the buttons inside the roads, October 8:** at Scott's
  request, and his pick of three layouts. The phone map is a uniform grid
  too, three columns and rows every 96px, and the two buttons each fill a
  block of its top row, with a road on every side and six cars (from four)
  going round them. The band is 260px (from 240) and starts 48px under the
  subhead; the hero is about 45px shorter. Below 480px both labels break
  onto two lines alike. The phone rows of the hero fixture are re-recorded
  with the buttons in them, and a test holds each button inside its own
  block (`hero-drive.md` §The phone map, §Decisions 31).
- **Fewer columns on smaller screens, one row less on phones, October 8:**
  in Scott's review of the two above. Below 1200px a new medium map has four
  columns instead of six, 0.22 of the width apart, so a 768px tablet's
  blocks are 169px across rather than 115 and nothing is squeezed; a test
  holds every recorded size to columns at least 165px apart. On phones the
  empty row of blocks under the buttons is gone: the band is 164px, and
  the hero 537px tall at 390×844 (677px before October 8). Awaiting
  Scott's next look (`hero-drive.md` §The medium map, §Decisions 32). 95
  tests, lint and build clean.
- **Cars back after a resize, October 8:** narrowing or widening the window
  across 768px or 1024px left the roads redrawn but the cars hidden until a
  reload. The cars' fade-in had been filed under the site motion's GSAP
  context, which reverts at those breakpoints; it's HeroStage's own now
  (`hero-drive.md` §Things that bit). Checked in headless Chrome through
  1440, 700, 1440, 1100, 900 and 1440px, and under reduced motion.
- **The roads' look, October 8:** Scott asked to see variations of the
  roads. Of five tried side by side, he picked rounded block corners with
  the centre line in grey and the zebra crossings in a lighter grey, on the
  same white roads (`hero-drive.md` §Decisions 33). The road layer grew by
  110 elements, about 1.1KB gzipped. 96 tests pass; checked in headless
  Chrome at 1440×900, 1100×520, 768×1024 and 390×844.
- **No hairline at the rounded corners, after October 8:** at 375px on a
  3x phone some rounds and their roads landed on different device pixels,
  with a red line between them. Every road edge now snaps to a whole pixel,
  the round is a whole number of px (7 on phones rather than 7.2), and each
  reaches a pixel under its roads (`hero-drive.md` §Things that bit). The
  test that keeps rounds off the roads allows that pixel. 96 tests.
- **The buttons' look, B1, October 14:** of ten looks tried in a
  development-only picker, Scott chose B1: sentence-case pills, each with
  a round chip riding after the last word, a red chip with an arrow on
  Book a Lesson and a white one pointing down on See Packages, which is
  outlined. It's in `Hero.css`; `CtaLooks.jsx` and `CtaLooks.css` are
  deleted. The pills are shorter than the old buttons, so from 768px the
  copy block is 9 to 12px shorter and `copy-rects.json` was re-recorded
  (headless Chrome, all 35 sizes): every copy box sits inside its old one,
  the phone rows are unchanged, and the short windows hide the same roads
  as before. 96 tests (`hero-drive.md` §Decisions 34).
- **No roads on phones, October 14:** Scott found the roads made the phone
  hero too busy. Below 768px the hero is now just the copy and its two
  buttons, side by side under the subhead as they were before October 8,
  in the B1 look, 44px tall with each label on one line from 320px. The
  traffic chunk never loads on phones, and a desktop window narrowed past
  768px clears its cars until it widens again. The phone map, its config,
  its five tests and the fixture's phone rows are deleted. Checked in
  Chrome at 320 to 767px, and through 1440, 390 and 1440px. 90 tests, lint
  and build clean. Pushed October 14 (`d3198d7`), not yet seen by Scott
  (`hero-drive.md` §Decisions 35).
- **Phase 7, still to build:** save-data, WebGL-failure handling,
  disposal, performance (now with particles and knocked cars in it) and
  the bundle report. Its phones and touch part was done early, in Phase 4:
  Drive isn't offered there.
- The first prototype of this feature, a different design that was never
  mounted, was kept on a local branch for the day and then deleted. It was
  never pushed; `hero-drive.md` §Where this started records what it was.

## Recently completed — October 14, 2026 (security headers, the rating)

- **Security headers.** securityheaders.com gave the live site a D: it sent
  none of Content-Security-Policy, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy and Permissions-Policy. All five are now on every
  response from `next.config.mjs` (`06-deployment.md` §Security headers).
  Tested on a production build, and on the live site's own pages served
  locally with the same headers, with every violation logged: the pages,
  the Google tag and Ads remarketing, the Meta and TikTok pixels after
  consent, Calendly's popup, and the hero's traffic and driving. The only
  blocks were the two meant ones, another site framing ours. The test
  caught two hosts the guides miss: Ads remarketing loads a script from
  `googleads.g.doubleclick.net`, and the Meta pixel sends a copy of each
  event through its own Conversions API Gateway.
- ⚠️ **Not on the live site yet.** That needs the same headers in
  `vercel.json` on `main`. The change is written and checked against `main`
  but not applied, since it changes what customers get: Scott's call.
- **The live domain now serves `clutchacademy.ca`, and `www` redirects to
  it.** Until October 14 it was the reverse: Vercel's domain settings sent
  `clutchacademy.ca` to `www` with a 307, against `next.config.mjs` and
  every canonical tag, and it would have looped at cutover. Scott flipped
  it that day: `clutchacademy.ca` connects to Production, and `www` 308s to
  it, keeping the path and query string (checked with curl). Visitors who
  answered the consent banner on `www` are asked once more, since the
  choice is stored per host.
- **The Google rating under the strip goes score first.** On a phone the
  score fell onto a line of its own and the button stopped three quarters
  across. Now a big 5.0 sits with the stars and "44 Google reviews"
  stacked beside it, and on phones the button runs the full width of the
  column underneath. Desktop keeps the score left and the button right.
  Scott picked it from three layouts (the others were one line with a text
  link, and everything centred).

## Recently completed — October 13, 2026 (stale files and references)

- **Removed from `public/`:** `hero-section.jpeg` and `.webp` (the homepage
  hero's photo until September 24), `headshot.webp` (the Vite site's
  `<picture>` fallback; `next/image` makes its own from `headshot.jpeg`) and
  `lessons-car.png` (the hub's intro-hero photo until August 16, which shows
  the car's make). Nothing referenced them; they're in git.
- **`Stuff Scott Needs.docx`**, Sam's April copy for the single-page site,
  moved to `archive/`.
- **Kept on purpose:** `logo2.svg` (the wide wordmark `og-image.png` was
  made from) and `icon.svg` (the favicon mark without its white backing).
  Nothing references either; they're the only vector copies.
- **Stale references fixed** across the spec, `seo.md`,
  `google-ads-mapping.md`, Sam's two SEO guides (winter prices, 44 reviews,
  the dropped guarantee) and code comments: archived-doc numbering ("08 §7"),
  `index.html` and the prerender, retired source tags, renamed files and
  classes, old prices. `seo.md`'s "no stale pricing" check was flagging
  today's prices; it now looks for the August ones.
- **Dead code:** `.gate__plate` (the hub's July hero) and five tokens from the
  gear-era design and the old rating badge. `booked.html`'s copy of
  `--chrome` was still `#d9d9d9`, which fails AA on the red; it's `#e4e4e4`
  like `tokens.css`.
- **The sitemap's `lastmod`** went from August 16 to October 9 on every
  route, after the October prices and copy pass.
- **Still open, not changed:** `llms.txt` links
  `calendly.com/clutchacademy-ibca` while every Book button opens
  `calendly.com/d/d3mm-v7p-mf9`; `privacy.html` says "Last updated:
  2026-05-12" though its wording changed October 9; and Sam's next-steps
  guide still has May to August ranking targets and a 90-day calendar.

## Recently completed — October 8–9, 2026 (phones and copy)

- **The fall-sale banner on phones** is two centred rows at every phone
  width: the flag and the pitch, then the price and the saving. Below
  440px the pitch goes. Estimated at 61px for first paint, from 76px at
  390px (`03-content-and-pricing.md` §The fall sale).
- **The reviews strip's cards fit their quotes.** One shared height, the
  fewest lines the longest quote needs, and each card only as wide as its
  quote then needs, so a long review makes a wide card, not a tall one.
  The reviewer and the stars share the top row (`02-architecture.md`).
  "Read more reviews on Google" now fits one line below 360px too.
- **The strip carries every review, October 9.** All 43 Google reviews
  with words (the 44th is five stars and no text), up from 15, copied
  verbatim and checked against the profile. Eleven long ones stop after a
  whole sentence, so no quote outruns the longest whole one and no card
  gets taller. Matthew Hartford's is the one four-star review, and its card
  shows four stars. Its second paragraph, a suggestion to get "a 'learning
  driver' sign" and "an emergency break installed", is left off: Sam's
  call whether it goes on. The strip's drift is now set per card, so it
  keeps its old pace (~60px/s) with nearly three times the cards.
- **How It Works lost its lead.** "Four steps, and you only have to think
  about the first two" was rewritten twice and then cut, at Scott's word.
- **A plain-language pass over the copy, October 9**, at Scott's asking:
  every em dash out of the body copy, bullets, FAQ answers, meta
  descriptions and alt text on all nine routes, `privacy.html`,
  `booked.html` and `llms.txt`, and the filler with them. The rule is
  `03-content-and-pricing.md` §Copy rules 6. Worth knowing:
  - The package pages' pull line is now "Most students arrive nervous. Sam
    expects that and goes at your pace." on Individual and Foundations, and
    "…Bringing a friend helps." on Group. Confidence's is "The package to
    take if you want to be confident wherever you drive."
  - The hub's chooser is still four plain sentences, now "If you've never
    touched a stick shift, start with the Manual Foundations Package."
  - "This summer" is gone from Individual's Europe line.
  - `llms.txt` said "Group Lesson (2 hours)"; it's "Group Manual Lessons"
    now. The October 7 rename had missed it.
  - Untouched: every customer quote, Sam's About story, the "why manual"
    line from the client brief, the cancellation answer (item 6), headings,
    titles and eyebrows, and the homepage hero's copy (its fixture).
  - Build, lint and 96 tests clean.

## Recently completed — October 7, 2026 (site review, first changes)

A walk through every page on localhost at 1440 and 390px produced a list of
suggestions. Scott took the top ones; the rest are under "Open from the
October 7 review" below.

- **The Google rating is on show.** The homepage reviews band showed five
  stars and kept "5.0 from 33 reviews" for screen readers only. It now reads
  "5.0 · 44 reviews". A rating beside the hero's buttons was built too and
  taken out the same day: Scott didn't want it in the hero. The profile had
  44 reviews on October 7, 43 of them
  five stars and one four (Google shows 5.0); `googleReviews.js` holds the
  numbers. Which review is the four-star one couldn't be checked, so the
  comments that said every review is five stars now say to check a review's
  own rating before quoting it.
- **Worth knowing for the hero:** in a short laptop window (1280×600,
  1536×730) its copy block sits within a few px of the roads' 48px
  clearance, so even one more line under the buttons hides two roads there
  and fails `npm test`. Anything added to the hero copy has to fit beside
  the buttons, or the map has to change.
- **One featured package.** Foundations is "Recommended" on the homepage,
  the hub and its own page. "Best Value" is gone (both packs are $80 a
  lesson), as are "Most Popular" (no booking data behind it) and every
  "flagship" and "premium". The cards' one-liners carry "$80 each"; the
  package heroes say "$80 a lesson, save $30" (or $50); the homepage's
  Confidence card has a "Save $50" badge, as on `main`.
- **Confidence says it starts from zero**, in its eyebrow, lead and skills
  note, and on the cards. Scott confirmed it: a beginner can book it.
- **One name per package**, on the cards, footer, About's links,
  breadcrumbs, cross-links, the Offer schema and `llms.txt`. The rules are
  in `03-content-and-pricing.md` §Names, labels and claims.
- **The footer** had to change for the full names. Explore now lists the
  pages in one column and the four packages in the other, each column as
  wide as its content, and on tablets (640–1023px) Explore takes a row of its
  own. No label wraps at any width from 640px.
- **The fall sale, ported from `main`.** The banner above the nav ("Fall
  sale … Save up to $70 on lesson packages"), sliding away on scroll, and the
  old price struck out with a Save tag beside every price: homepage and hub
  cards and the four package heroes. The savings against single lessons
  (Confidence's "Save $50" badge, the heroes' "save $30/$50") came off so
  each card shows one saving. `src/lib/sale.js` holds the old prices and the
  switch that ends it. The
  banner's height is estimated in CSS for first paint, so the nav isn't
  covered before hydration (`main` has that flash); the homepage hero starts
  under the banner and keeps its tested size, so the road map and
  `copy-rects.json` are unchanged. The per-hour catch in the old prices is
  in `03-content-and-pricing.md` §The fall sale.
- **A phone pass over every page** (320–430px, screenshots and a script
  for overflow, text size and tap targets). Nothing overflowed. Fixed:
  - The banner: the flag and the saving share its top row and the message
    runs full width under them, 76px tall instead of 93px (`main`'s phone
    layout gave the message a third of the width, and Inter took three
    lines there).
  - The footer: Contact and Follow side by side, Explore in two columns,
    pages and packages, so about half a screen instead of a screen and a
    half; the Contact column is as wide as the email, which overran
    Follow below 390px at an even split.
  - The reviews strip's edge fade is 1.25rem on phones, not 4rem, which
    washed out each quote's first words; the shortest quote (Hannah's) is
    no longer first, where it left the only card a phone shows half empty;
    "Read more reviews on Google" fits one line.
  - The card prices on phones: no gap between the price and the old one,
    and the unit straight under the price with the Save tag after it.
  - The package pages' "Quick answers" have the /faq page's +/× (at every
    width): the browser's marker hung outside the column at desktop and
    disappeared on phones, so nothing said the rows open.
  - Eyebrows, section headings and the leads under them balance or avoid a
    lone last word when they wrap ("…SAME / LESSONS", "low- / pressure",
    "…the first / two."); the homepage stat labels fit one line; the
    Foundations step titles line up (tabular numbers); Contact's small
    print is two sentences instead of one run-on.
  - Tap targets to 44px: the logo link, "Compare every lesson option",
    "How Clutch Academy started" (hit areas that don't move anything), the
    404's links and the cookie banner's buttons. The breadcrumbs stay at
    33px, the documented exception.
- **Section headings cap at 3rem**, down from 4rem, so no section heading
  is bigger than its page's title. The hub's title went up to the package
  pages' 3.5rem (it had been scaled down with its section headings), and
  Contact's to 3.25rem.

## Recently completed — October 5–6, 2026 (winter pricing)

- **Winter rates, back to one-hour lessons:** $90 / hour, $240 (3 lessons),
  $400 (5 lessons), $180 / 2-hour group, all + HST. Shipped to the live site
  on October 5 (`f8645c4` on `main`) and ported here on October 6, across
  every surface in `03-content-and-pricing.md`'s list. Savings lines are $30
  and $50. The 75-minute and 2.5-hour formats are gone, which settles the
  group-format question that was flagged `❓ BLOCKED` in the group page.
- **`main` has a banner** (`a82df9d`), renamed "Fall sale" (`75e2646`) and
  given "Save up to $70" and struck-out old prices with Save chips
  (`a1bd04b`, `4eff398`). Ported to `overhaul` October 7, without the chips
  (see below).
- **The 5-pack's badge differs between branches.** `main`'s homepage card
  reads "Save $70"; `overhaul`'s has no corner badge since October 7, and
  shows its $70 as a tag beside the struck-out $470 instead.
- Sam's Calendly event types still need the new prices and durations. That's
  where the charge is set.

## Recently completed — September 28, 2026 (beige bands sitewide)

At Scott's request, the homepage's red and beige bands were carried to the
hub, the four package pages, `/about`, `/faq` and `/contact`. The map is in
`02-architecture.md` §Styling. Then, the same day, the four package pages were
made one shape.

- **Every page opens on the red** and alternates from there. The package
  pages' reviews and every closing Book CTA except the hub's sit on beige, the
  CTA as the homepage's solid red `btn--on-light` button.
- **The package pages' quotes are the homepage's review cards** now: cream,
  red top rule, five gold stars, the reviewer's initial. The card's CSS moved
  out of `ReviewsMarquee.css` into a shared `ReviewCard.css`, and the four
  pages render their quotes through one `LessonQuotes` component instead of
  four copies of the markup.
- **The About shift gate was redrawn in red on beige**, then replaced the
  same day (next entry).
- **The `.lesson-page` wrapper is gone.** Only `/lessons/individual` had it,
  though `lessons.css` said all four did. It gave that one page tighter
  section padding (for one continuous red field; as bands, that thin a
  section read as a stripe) and smaller section headings. All four now use
  the global padding and the site's shared heading scale.
- **One shape for the four package pages**, at Scott's word to pick the most
  common option where they differed: hero → what's included (beige) → who
  it's for (red) → reviews → quick answers → next steps. What changed:
  - The hero's second line is the pull line (`.lesson-hero__pull`) on all
    four. Only Individual used it; the others set it as a second lead.
  - Individual had who it's for first, as four named cards with icons. It's
    now second, and a bullet list of the same four sentences, like the
    others. Its inclusions are red cards.
  - Group lost its option card, which repeated the hero's price and Book
    button, so the `packages_group_2hr` tag is retired (`05-analytics.md`).
    Its three bullets are now the what's-included cards, and it gained a
    who-it's-for section, whose three lines are new and need Sam's approval
    (open item 13).
  - Confidence's skills grid is the same width as the others' content (900px)
    instead of the full column.
- **Motion wasn't carried over.** The other routes' motion pass is still to
  do. The obstacle: on these pages the second section is on screen at load,
  so the scroll reveals would paint it, hide it at hydration and replay it,
  the flash `08-motion.md` §The hero warns about.
- ✅ **Heading order on the package pages:** the section `h2`s topped out
  at 4rem against the hero `h1`'s 3.5rem, so each section heading was larger
  than the page's title. Fixed October 7: section headings cap at 3rem
  sitewide.

## Recently completed — September 28–29, 2026 (About's reasons as road signs)

Scott disliked the shift gate that carried "Why Students Choose Clutch
Academy", so it's gone (`ShiftGate.jsx` deleted; it's in git). Two
replacements were built for him to choose between, a new car's window
sticker and a set of road signs; he chose the signs on September 29, and the
sticker was deleted.

- **`src/components/about/WhySigns.jsx`:** six Ontario-style signs, lettered
  in Overpass (loaded with `next/font`, on this page only): MANUAL ONLY,
  ONE-ON-ONE, MAXIMUM YOUR PACE, STALLS AHEAD, a no-parking sign, BOOK ONLINE
  24 HRS. Each has a short title and one of the gate's old lines.
- **From 1024px it's a street:** one row, every post running down to the
  bottom edge of the beige band (the section drops its bottom padding), each
  at a different height, alternating tall and short. Each sign's words sit
  above it, and the words over a tall sign spread wider than their column,
  over its shorter neighbours. Below 1024px each sign stands on a short post
  beside its words, two to a row, one on phones: six posts to one ground line
  left the words a few letters wide.
- **Motion:** the header takes Headline and Rise; the signs Stagger, and
  rise out of the ground rather than lifting off it (the posts run 24px past
  the band's edge and the row clips its bottom). The first motion on `/about`.
- `PENDING`: Sam hasn't approved the titles, and "Manual is all we teach" is
  a new claim.
- The quoted reviews moved out of `ReviewsMarquee.jsx` into
  `src/lib/reviews.js` for the sticker's count; they stay there.

## Recently completed — September 2026 (homepage)

- **Prices rounded up to the nearest $10** (Sept 21): $110 / $300 / $470 /
  $220 + HST, on both branches, including the Offer schema and the conversion
  values in `booked.html`. The savings lines follow: $30 and $80.
- **Beige light sections.** "What Students Are Saying" and pricing sit on
  `.section--light` (`--beige`, `#FBE9DF`) with red header type, alternating
  with the red sections. The Google-reviews button there is solid red with an
  inner white ring (`btn--on-light`). See `02-architecture.md` §Styling.
- **Review cards redesigned** (cream cards, red top rule, gold stars, the
  reviewer's initial), and the strip no longer reacts to page scroll: it
  drifts at one speed, and drag, touch swipe and sideways trackpad swipe still
  move it. It was rebuilt on GSAP (Sept 24), and Tailwind, `motion` and the
  Magic UI row were removed with it.
- **Homepage copy rewritten** in plainer language, keeping the original title
  casing. How It Works step 1 used to say "the single lesson or 3-pack" and now
  names all four packages. Review quotes, package names and prices are
  unchanged.
- **GSAP motion on the homepage** under the new `08-motion.md`: a hero
  timeline on load, and scroll reveals (Rise, Stagger, Headline, Draw, Settle)
  on every other section. The first version started too late on phones;
  triggers now fire at `top 95%`, and delays count from the section's start
  (see `08-motion.md` §Homepage map).

## Recently completed — August 20, 2026

- **The hub's chooser went back to plain text.** "Pick by where you are today"
  was four cards for two days — situation, package plaque, Book Now and See More
  each. For a signpost between the package cards above it and the closing Book
  CTA below it, that was too much furniture: three stacked card treatments in a
  row. It's four sentences again, each hanging off a **gear-lever bullet**, with
  the package as the inline link.
- **That bullet answers the "gear-shifter clip art" question** from the Site 2.0
  review, which had been stuck on the client supplying black-on-white raster art
  for a red section. It's an inline SVG in the same 24x24 line-icon idiom as the
  package pages — knob, shaft, and the gate slot — so it inherits `currentColor`
  and needs no asset. A flat H shift-pattern was drawn first, to echo the gate
  motif the hero and card chips use; at 20px it read as the letter H.
- **The four `lessons_overview_pick_*` source tags are retired** with the buttons
  that carried them (`05-analytics.md`). They never reached the live domain. The
  hub books through `lessons_overview_close` alone; the chooser routes to package
  pages, which book under their own tags.
- Section height, cards → text: **771px → 629px** at 320 and 729px → 557px at
  390. No overflow at 320 / 390 / 1280.

## Recently completed — August 18, 2026

A layout, mobile and card-design pass, driven by review on a real phone. Both
entries that stood under "Known bugs" are fixed, along with several defects
neither this file nor the August 16 pass had caught. **No content decisions were
made** — every open question below is untouched.

### Layout

- **One content column per page.** The old "known bugs" entry had half of it.
  Blocks capped *narrower* than the 1200px `.section__inner` inherit its
  `margin: 0 auto` and re-centre, landing ~150px right of the nav, the footer,
  and every full-width section on the same page — two competing left edges per
  page, which is what made the skew noticeable. `.section__inner` now publishes
  `--column-inset` and every narrower block uses
  `margin-inline: var(--column-inset) auto`; the blocks capped at 1100px inside
  the column were uncapped. Measured at 320 / 390 / 1024 / 1280 / 1440 / 1713:
  every route resolves to a single left edge.
- **Breadcrumbs rendered under the fixed nav on phones.** The `max-width: 639px`
  block replaced the bar's nav clearance with a flat `0.75rem`, on the reasoning
  that the hero below carries it — but `.breadcrumbs + .section--first`
  deliberately shrinks the hero's padding *because* the trail is meant to do the
  clearing. The trail sat at y=12–33 and the hero eyebrow at y=49–71, under a
  64px nav. The bar also had no horizontal padding, so it sat flush to the
  viewport edge.

### Mobile

- **The nav bar no longer wraps.** At 375px and below the row (logo 189px +
  toggle + Book Now) didn't fit; Book Now dropped to a second line and the bar
  grew to 113px while every page still reserved `--nav-height` (64px), so the
  fixed bar covered the first heading. 375 and 360 are the two most common phone
  widths. The bar is `nowrap`, the open menu is an absolutely positioned
  dropdown, and the logo shrinks to absorb the rest. One row from 320 to 767px.
- **The menu panel is opaque.** It inherited the bar's 0.85 alpha and the hero's
  display-size headline read straight through it.
- **Vertical scrolling works over the reviews marquee.** `touch-action: pan-x`
  declared horizontal panning to be the only gesture the element handles, so a
  vertical drag starting on the reviews was swallowed and the page didn't move.
  Measured before → after at 390px: 0px → 231px of page scroll, with the
  horizontal swipe still working (210px of strip travel).
- **Touch targets.** Nav toggle (37px), nav Book Now (34px), footer links (17px
  on a 25px pitch), FAQ rows (39px), contact tap-to-call/mail (29px) and
  `/about`'s "pick where to start" (27px) all clear 44px now; breadcrumbs sit at
  28px, past the 24px AA floor. Where width was scarce or padding would have
  detached an underline from its text, the hit area grows via an overlay.
- **Homepage About stats** sat on three different baselines, because two of the
  three labels wrap and one doesn't.

### Package cards

Both four-card sets — the homepage teasers and the hub's — were a column of
full-height cards below 768px, which made the packages band a long scroll. A 2×2
grid was tried and **reverted** as too busy. The shape that stuck is one card per
row, with each card much shorter:

- The hub card leads with a larger title and folds its feature bullets behind a
  native `<details>` ("What's included"), reusing the `/faq` accordion's
  +-rotates-to-× affordance. No JS.
- **The disclosure is phones-only.** Desktop was never the crowded case, so
  above 768px the summary is hidden and the content forced visible. See
  `02-architecture.md` for the mechanism and its one odd side effect.
- **The whole card is the toggle** on phones — an overlay on the summary covers
  the card. "See full details" is lifted above it and still navigates.
- Price and CTA share a row (`__foot`); at desktop that wrapper is
  `display: contents`, so the column layout is untouched.

Grid height, original → now: **1673px → 1002px** at 390px and 1782px → 1096px at
320px for the hub; 1039px → 792px and 1081px → 910px for the homepage.

### Content structure

- **`/manual-driving-lessons` has a closing Book CTA again.** It had none since
  the intro hero was removed, against `01-brief.md`, and it's a significant entry
  point. Tagged `lessons_overview_close`; the retired `lessons_overview` stays
  retired because it labelled the intro-hero placement.
- **The hub's chooser rows became cards.** ⚠️ **Reverted on August 20** — see
  above. Each card stated the situation, named the package in its own box, and
  offered Book Now and See More, with a per-row `lessons_overview_pick_*` source
  tag. The lookup that kept the package name from drifting survived the revert;
  the cards and the tags did not.
- **`/faq` lead** was missing a space: "Get in touch" ran into "and".

## Recently completed — August 16, 2026

A client review document ("Site 2.0") drove a round of changes on `overhaul`:

- **August-1 pricing switch ported from `main`.** Every surface: teasers, hub
  cards, all four package pages, homepage JSON-LD offers, `booked.html`
  conversion values, `llms.txt`, sitemap. Savings maths recomputed ($28 / $76).
  Includes the `booked.html` rule-ordering fix so a 2.5-hour group booking isn't
  priced as a five-pack.
- **The expired announcement banner was removed.** It rendered server-side and
  only hid after hydration, so non-JS crawlers were still reading "Effective
  Aug 1 — book before August 1 to lock in current rates" *next to* the new
  prices. The component and its stylesheet are deleted; recoverable from git if
  a future notice needs the pattern.
- **Group page collapsed to the single 2.5-hour option**, matching what the
  live site shipped.
- **Sam's origin story** replaced the drafted placeholder on `/about`.
- **Payment wording:** e-transfer and PayPal removed across all three surfaces;
  "All major credit and debit cards are accepted" added.
- **Breadcrumbs** added to the four package pages, with `BreadcrumbList` JSON-LD.
- **Nav active state** made section-aware so Lessons stays underlined on
  `/lessons/*`.
- **Review strip (`TrustBlock`) removed sitewide.** It was first moved last on
  About, the hub, and the package pages, then deleted entirely at the client's
  request — the component, its 108 lines of CSS, and all seven usages
  (About, hub, FAQ, four package pages). The homepage "What Students Are
  Saying" section is a different component and remains.
- **The `/manual-driving-lessons` intro hero was removed**, so the page opens
  straight on the packages. "Four ways to learn" is now the page's `<h1>`
  (promoted from `<h2>`, with the Manual/Stick Shift/Standard eyebrow moved
  onto it). Took the training-car photo and the hub's only Book CTA with it.
- **Footer Explore column** widened and reflowed so the links stop wrapping out
  of alignment.
- Homepage About-teaser CTA and the contact phone label reworded.

## Open — needs a human decision

These are the actual blockers. Most need Sam.

| # | Item | Where | Notes |
|---|---|---|---|
| 1 | **Group pricing basis** — per person or per pair? | `/lessons/group` | ❓ BLOCKED. All copy deliberately avoids claiming either. Ads price assets depend on it too. |
| 2 | **`aggregateRating` in the homepage JSON-LD** | `src/app/page.jsx` | Real GBP figures (5.0 from 44, October 7, 2026), but self-attested rating markup carries manual-action risk. Inherited from the live site. Keep or remove — decide before cutover. |
| 3 | **Google Ads conversion label** | `public/booked.html` | Empty string ⇒ Ads conversions are a silent no-op. Account-side fix. |
| 4 | **Confidence guarantee — dropped from the rebuild** | `/lessons/manual-confidence`, `src/app/page.jsx` | ✅ Resolved by removal (Sept 21, 2026). The terms were never written, so the claim is gone from the hero lead and the homepage Offer schema. `main` still advertises it — if Sam wants it back, the terms have to come first. |
| 5 | **Package inclusions** | `/lessons/individual`, `/lessons/group` | Current bullets are the live site's placeholders. Sam owes final 3–5 each. |
| 6 | **Cancellation-policy final wording** | `src/lib/faqs.js` (`cancellation`), `public/booked.html` | Current text is the live site's. Editing it in `faqs.js` propagates to every page, but not to `booked.html`, whose fine print ("Cancellations are free up to 24 hours after booking your lesson") leaves out the FAQ's other condition, at least 24 hours before the lesson. |
| 7 | **Dedicated testimonials** | `/about` | Every quote on the site is a real Google review. Sam may supply dedicated ones; there's a `PENDING` slot. |
| 8 | **Fonts now actually render** | Site-wide | Plus Jakarta Sans + Inter were referenced but never loaded on the old site — it silently fell back to system fonts. `next/font` loads them, so the rebuild *looks different*. Per the tokens' clear intent, but nobody has confirmed it with Sam. |
| 9 | **Search Console verification token** | `src/app/layout.jsx` | Stubbed `PENDING`. Sam-side. |
| 10 | **Slug keyword audit** | Routes | 🟡 Slugs were never deliberately audited. Cheap to change now, expensive once Ads final URLs point at them. |
| 11 | **New line in Sam's voice** | `src/components/home/AboutTeaser.jsx` | "Everyone stalls while they're learning. Nobody's grading you, so we keep it relaxed, and most people end up having fun." Written in the September copy pass; Sam hasn't approved it. |
| 12 | **Homepage meta description lags the copy** | `src/app/page.jsx` (`metadata`) | The on-page copy was rewritten in September; the description and OG/Twitter text weren't. Its facts are still right; the wording is the old voice. |
| 13 | **Group page's "Who it's for" lines** | `src/app/lessons/group/page.jsx` (`WHO`) | Written September 28, 2026, when the page took the other package pages' shape, and reworded in the October 9 copy pass with the same meaning. Sam hasn't seen them. `PENDING`. |
| 14 | **"Ontario residents" and PIPEDA** | `public/privacy.html` | The policy says "Ontario residents have additional rights under PIPEDA", but PIPEDA is federal law. Legal wording, so the October 9 pass left it. Whoever owns the policy should fix it. |

### From the Site 2.0 review doc — still needing clarification

Raised with the client, not yet answered:

| Item | The problem |
|---|---|
| "Update cancellation policy" | The screenshot supplied is character-identical to the current text. No new wording was given. |
| Move Payment & cancellation from Contact → FAQ | `/faq` already renders payment *and* cancellation answers from `faqs.js`. Moving the Contact block there duplicates them. Replace the FAQ entries, or add a distinct styled section? |
| Highlight Complete Confidence "like Foundations" | Move the featured treatment from Foundations to Confidence, or feature both? ⚠️ On October 7 Foundations became the *only* featured package, at Scott's word, which goes the other way from this request. Still open with the client: if Sam wants Confidence featured, it's one `featured`/`badge` change in `PackagesTeaser.jsx` and the hub. |
| "Social logo in footer" | Instagram/Facebook glyphs, or the Clutch Academy brand mark? The phrasing points both ways. |

### Open from the October 7 review

Suggestions from the October 7 walk-through that weren't taken up that day.
Scott said the package pages' layout comes next and the Calendly links
later.

- **Package pages:** the right half of every hero and closing band is
  empty at desktop (photos pending); a summary card (price, length, what's
  included, Book) could fill it. The heroes' leads read as written for
  search. The pull line was rewritten on October 9, but Individual and
  Foundations still share it word for word.
- **Calendly:** every Book button opens the same link, so a visitor who
  chose a package picks it again in Calendly. Needs per-package links from
  Sam (`useCalendly.js` already plans for them).
- **Copy:** ✅ the em-dash pass and "this summer", October 9 (above).
  Still open: "licence" vs "license" (the package pages' notes say
  "licence"; the FAQ, How It Works and `booked.html` say "license"); the
  cancellation answer contradicts itself ("after 24 hours of booking"), so
  Sam's wording (item 6) matters more; and five page titles and the hub's
  eyebrow ("Manual · Stick Shift · Standard — same lessons") still carry
  an em dash, Scott's call. Sam's About story and the "why manual" line
  keep theirs until Sam signs off on a change.
- **Phones:** ✅ both fixed in the October 7 phone pass (above): the
  reviews strip's edge fade is 1.25rem on phones, and the footer is about
  half a screen.
- **Hub:** the 1–4 numbers on the cards read as a sequence; the homepage's
  "Compare every lesson option" lands on cards, not a comparison.
- **FAQ:** two columns of accordions; one column in groups would read more
  easily. Missing answers only Sam can give: rescheduling, G1 holders,
  service area.

## Known bugs

- **The 404's heading is off the column.** It sits at 176px at 1440, the
  column at 112px, so the page breaks the one-left-edge rule
  (`.placeholder-hero`). Found October 7.
- **The homepage's Offer schema has no group lesson.** `src/app/page.jsx`
  lists Offers for three packages but not Group Manual Lessons. Found
  October 9. (The comment above them said they "describe the OLD
  packages/prices"; it was corrected on October 13.)

Nothing else outstanding. Both entries that stood here on August 16 — the off-centre
content blocks and the hub's missing booking CTA — were fixed on August 18; see
above. The fix for the first one differs from what this file proposed: it
recommended dropping the narrower `max-width` so each block fills its heading's
column, which is right for the three blocks it listed but leaves the *other*
narrowed blocks re-centring 150px away. Normalising every block onto the 1200px
column the nav and footer already use fixes both halves.

## Pending assets

📎 Final brand assets (logo variants), real lesson photography for all four
package pages, and the instructor photo's final crop. Every one is marked with a
`{/* PENDING: ... */}` comment at its use site.

`grep -rn "PENDING\|BLOCKED" src/ public/` is the live list — trust it over this
table.

## Verification state

| Check | Status |
|---|---|
| Build + lint | ✅ Clean as of October 14, 2026 |
| `npm test` | ✅ 90 of 90, October 14, 2026 |
| Hero road maps (`npm test`) | ✅ 31 tests: both maps connected, no dead ends, no U-turns, whole ticks only, crossings in place, nothing within 48px of the copy at 32 recorded sizes (September 24) |
| Hero roads in Chrome | ✅ 360, 390, 768, 1280, 1440, 1920px; every road piece within 0.007px of its tested geometry (September 24) |
| Hero roads in Safari | Not checked, but no longer a known risk: the SVG dash-length concern went with the SVG. Covered by the pre-launch real-device pass. |
| Lighthouse, all 9 routes | ⚠️ 100 a11y / 100 SEO / 100 BP in July 2026, but **materially stale** — predates the August 18 layout rework. Re-run is a cutover requirement. |
| Layout: one left edge per route | ✅ Measured at 320 / 390 / 1024 / 1280 / 1440 / 1713, August 18 |
| Mobile nav on one row | ✅ Measured 320–767px, August 18 |
| No horizontal overflow | ✅ All 9 routes at 390px; card grids 320–1440, August 18 |
| Touch targets ≥44px | ✅ August 18 (see the note above for the documented exceptions) |
| Card disclosure behaviour | ✅ Real clicks dispatched at each card region, plus `checkVisibility()` per breakpoint, August 18 |
| Crawlability, canonicals, h1s | ✅ Verified July 2026 |
| Internal links | ✅ All 200, July 2026 |
| Consent Mode deny-first | ✅ Verified — no pixel URLs in served HTML |
| `booked.html` conversion scripts | ✅ Syntax-checked; dedup guard intact |
| Host redirects | ✅ Verified locally via Host header |
| Homepage motion, desktop Chrome | ✅ Every section reveals and ends fully visible; no inline styles left behind; late-scrolled elements start without waiting (Sept 24) |
| Reviews strip, desktop | ✅ Drift, mouse drag, sideways wheel, and vertical page scroll over the strip (Sept 24) |
| **Homepage motion on a phone, and under reduced motion** | ❌ Not checked. The touch swipe on the reviews strip and the timing on small screens need a real device. |
| **Real-device iOS Safari** | ❌ **Never done since the migration.** Pre-launch requirement. |
| **Production domain behaviour** | ❌ Not testable until cutover |
| **Re-run of QA after August and September changes** | ❌ Not done. Include Lighthouse LCP/CLS on `/`: GSAP now loads on every route. |

## Known repo quirks

- **`main` tracked 4,490 `node_modules` files** for historical reasons; they
  predate `.gitignore`. `overhaul` untracked them during the migration. Never
  re-add them.
- **`src/components/sections/`** (the old gear-section components) was removed
  in the July 21, 2026 cleanup. The old copy is recoverable via
  `git log -- 'src/components/sections/*'`.
- **`docs/spec/01`–`09` were archived** on August 16, 2026 into
  `docs/spec/archive/`. They describe either the retired single-page build or
  the rebuild's own planning process. Don't work from them.
