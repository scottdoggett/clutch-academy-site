# Re-recording `copy-rects.json`

`layout.test.js` checks every road against where the hero's copy actually
lands at each size in `copy-rects.json`. Those numbers come from a real
browser, so they go stale whenever the hero's copy, its CSS, or the site's
fonts change. When that happens:

1. Run the dev server (`npm run dev`) and open any page **other than** the
   homepage in Chrome, e.g. `http://localhost:3000/privacy`. The script
   replaces that page's body with sized iframes of `/`.
2. Paste the script below into the DevTools console. It measures one size
   every couple of seconds and takes a little over a minute.
3. When it logs `done`, run `copy(JSON.stringify(window.__rows, null, 2))`
   and paste the result over the `sizes` array in `copy-rects.json`. Update
   `recorded`.
4. Run `npm test`. If a required size now fails, the map or the hero CSS
   needs to change. See `docs/spec/hero-drive.md` §Keeping clear of the
   headline.

Keep the size list in step with the fixture. The required sizes are the
1280, 1440 and 1920px rows at 680px of viewport height and up.

```js
document.body.innerHTML = ''
window.__rows = []
;(async () => {
  const sizes = [
    [320, 568], [360, 640], [360, 740], [375, 667], [390, 844], [412, 915], [430, 932], [600, 960],
    [768, 1024], [820, 1180], [834, 1194],
    [900, 700], [1000, 700], [1024, 768], [1024, 1366], [1180, 820],
    [1280, 600], [1280, 680], [1280, 720], [1280, 800], [1366, 660], [1366, 768],
    [1440, 780], [1440, 900], [1536, 730], [1536, 864], [1600, 900],
    [1920, 950], [1920, 1080], [1920, 1200], [2560, 1300], [2560, 1440],
  ]
  const load = (w, h) =>
    new Promise((resolve) => {
      const f = document.createElement('iframe')
      f.style.cssText = `width:${w}px;height:${h}px;border:0;position:absolute;visibility:hidden`
      f.src = '/'
      f.onload = async () => {
        await f.contentDocument.fonts.ready
        await new Promise((r) => setTimeout(r, 1500))
        resolve(f)
      }
      document.body.appendChild(f)
    })
  for (const [w, h] of sizes) {
    const f = await load(w, h)
    const d = f.contentDocument
    const hb = d.querySelector('.hero').getBoundingClientRect()
    const rect = (el) => {
      const b = el.getBoundingClientRect()
      return [b.left - hb.left, b.top - hb.top, b.right - hb.left, b.bottom - hb.top].map(Math.round)
    }
    const row = { viewport: [w, h], hero: [Math.round(hb.width), Math.round(hb.height)] }
    row.copy = rect(d.querySelector('.hero__copy'))
    // Phones only: the street band the compact map is drawn in.
    const band = d.querySelector('.hero__streets')
    if (getComputedStyle(band).display !== 'none') row.band = rect(band)
    window.__rows.push(row)
    f.remove()
  }
  console.log('done')
})()
```

The copy box is measured, not the text inside it, and its children's entrance
transforms don't move it, so it doesn't matter whether the hero timeline has
finished.
