// One-shot generator for og-image.png + the icon set. Uses Puppeteer (already
// a devDep for the prerender pipeline) so we get crisp Google Fonts rendering
// without dragging in another library.
//
// Two source SVGs feed two output groups:
//   - logo2.svg  -> og-image.png (wide canvas, white wordmark on brand red)
//   - favicon.svg -> icon set (square logomark on white background)
//
// Run: `npm run generate:images`
// Re-run whenever the logo or icon changes; outputs are committed to git.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PUBLIC = resolve(ROOT, 'public')

const RED = '#C8102E'
const WHITE = '#FFFFFF'
const TAGLINE = 'Learn Stick in Toronto'

const TARGETS = [
  // OG / social-share image. White wordmark on brand red.
  { name: 'og-image.png', width: 1200, height: 630, source: 'logo2.svg', bg: RED, withTagline: false, padding: '6%' },

  // Icon set — red disc logomark on white background. Apple-touch must be
  // opaque (Apple composites transparent icons on black on iOS home screen).
  { name: 'apple-touch-icon.png', width: 180, height: 180, source: 'favicon.svg', bg: WHITE, withTagline: false, padding: '6%' },
  // PWA manifest icons (referenced from public/site.webmanifest).
  { name: 'icon-192.png', width: 192, height: 192, source: 'favicon.svg', bg: WHITE, withTagline: false, padding: '6%' },
  { name: 'icon-512.png', width: 512, height: 512, source: 'favicon.svg', bg: WHITE, withTagline: false, padding: '6%' },
  // Favicon PNG fallbacks for legacy browsers + Google's search-result icon
  // (Google's docs prefer a 48px-multiple PNG/ICO).
  { name: 'favicon-32.png', width: 32, height: 32, source: 'favicon.svg', bg: WHITE, withTagline: false, padding: '4%' },
  { name: 'favicon-48.png', width: 48, height: 48, source: 'favicon.svg', bg: WHITE, withTagline: false, padding: '4%' },
]

function makeHtml(svg, t) {
  // Strip any width/height attrs from the SVG root so CSS sizing wins.
  const cleanSvg = svg.replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1').replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1')

  const tagline = t.withTagline
    ? `<p class="tagline">${TAGLINE}</p>`
    : ''

  return `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      background: ${t.bg};
      overflow: hidden;
    }
    body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: ${t.withTagline ? '40px' : '0'};
      padding: ${t.padding};
    }
    .logo {
      width: 100%;
      max-width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo svg {
      width: 100%;
      height: auto;
      display: block;
    }
    .tagline {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 500;
      font-size: 40px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #FFFFFF;
      text-align: center;
      line-height: 1;
    }
  </style>
</head>
<body>
  <div class="logo">${cleanSvg}</div>
  ${tagline}
</body>
</html>`
}

async function main() {
  // Cache SVG sources so we only read each one once.
  const svgCache = new Map()
  async function loadSvg(name) {
    if (!svgCache.has(name)) {
      svgCache.set(name, await readFile(resolve(PUBLIC, name), 'utf8'))
    }
    return svgCache.get(name)
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    for (const t of TARGETS) {
      console.log(`[gen-images] ${t.name} (${t.width}×${t.height}) from ${t.source}`)
      const svg = await loadSvg(t.source)
      const page = await browser.newPage()
      await page.setViewport({ width: t.width, height: t.height, deviceScaleFactor: 1 })
      await page.setContent(makeHtml(svg, t), { waitUntil: 'networkidle0' })
      // Wait for the Google Font to be ready before screenshotting; otherwise
      // FOUT can produce a system-font fallback in the snapshot.
      await page.evaluate(() => document.fonts.ready)
      const buffer = await page.screenshot({
        type: 'png',
        omitBackground: false,
        clip: { x: 0, y: 0, width: t.width, height: t.height },
      })
      await writeFile(resolve(PUBLIC, t.name), buffer)
      await page.close()
    }
  } finally {
    await browser.close()
  }
  console.log('[gen-images] done — wrote', TARGETS.length, 'files to public/')
}

main().catch((err) => {
  console.error('[gen-images] failed:', err)
  process.exit(1)
})
