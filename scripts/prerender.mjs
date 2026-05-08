// Post-build prerender: spawn `vite preview`, drive Puppeteer to capture the
// fully-rendered HTML, splice in the FAQPage JSON-LD generated from the
// FAQS source-of-truth in src/components/sections/Faq.jsx, and overwrite
// dist/index.html with the result.
//
// Run after `vite build` (see the "build" script in package.json).
//
// Why a custom 30-line script instead of a plugin: this site has exactly one
// route. Plugins like @prerenderer/rollup-plugin or vike add a build-time
// dependency surface that drifts with Vite/React releases; a small script we
// own is cheaper to maintain and easier to debug.

import { spawn } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PORT = 4173
const PREVIEW_URL = `http://localhost:${PORT}/`
const DIST_INDEX = resolve(ROOT, 'dist/index.html')
const FAQ_SRC = resolve(ROOT, 'src/components/sections/Faq.jsx')

// ---------- 1. FAQPage JSON-LD from the FAQS source-of-truth -----------

async function buildFaqPageJsonLd() {
  const src = await readFile(FAQ_SRC, 'utf8')

  // Parse the FAQS array. We tolerate either single or double quotes around
  // string keys/values and normalize escape sequences. This is intentionally
  // a small regex-based parse rather than full JSX parsing — Faq.jsx's FAQS
  // array shape is stable and known.
  const arrMatch = src.match(/const FAQS = \[([\s\S]*?)\n\]/)
  if (!arrMatch) {
    throw new Error('prerender: could not locate FAQS array in Faq.jsx')
  }

  const items = []
  const itemRegex = /\{\s*q:\s*(['"`])([\s\S]*?)\1,\s*a:\s*(['"`])([\s\S]*?)\3,?\s*\}/g
  let m
  while ((m = itemRegex.exec(arrMatch[1])) !== null) {
    const q = decodeJsString(m[2])
    const a = decodeJsString(m[4])
    items.push({ q, a })
  }
  if (items.length === 0) {
    throw new Error('prerender: parsed zero FAQ items — regex out of sync with Faq.jsx?')
  }

  // Validate: an FAQPage answer that ends mid-sentence (e.g. "charged in ")
  // would ship broken copy into Google's rich-result. Refuse to emit.
  for (const { q, a } of items) {
    if (a !== a.trim()) {
      throw new Error(`prerender: FAQ answer for "${q}" has trailing whitespace — fix Faq.jsx`)
    }
    if (!/[.!?")\]]$/.test(a)) {
      throw new Error(
        `prerender: FAQ answer for "${q}" does not end with terminal punctuation — likely truncated. Fix Faq.jsx.`
      )
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n    </script>`
}

function decodeJsString(s) {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

// ---------- 2. Spawn vite preview, wait for the port to respond ---------

function startPreview() {
  return new Promise((resolveStarted, rejectStarted) => {
    const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let resolved = false
    const onLine = (chunk) => {
      const text = chunk.toString()
      if (!resolved && /Local:\s+http/.test(text)) {
        resolved = true
        resolveStarted(proc)
      }
    }
    proc.stdout.on('data', onLine)
    proc.stderr.on('data', onLine)
    proc.on('exit', (code) => {
      if (!resolved) rejectStarted(new Error(`vite preview exited early with code ${code}`))
    })
    setTimeout(() => {
      if (!resolved) rejectStarted(new Error('vite preview did not become ready within 15s'))
    }, 15000)
  })
}

// ---------- 3. Drive Puppeteer to snapshot the rendered HTML ------------

async function snapshot() {
  const browser = await puppeteer.launch({ headless: 'new' })
  try {
    const page = await browser.newPage()
    await page.evaluateOnNewDocument(() => {
      window.__PRERENDER__ = true
    })
    await page.setViewport({ width: 1280, height: 900 })
    await page.goto(PREVIEW_URL, { waitUntil: 'networkidle0', timeout: 30000 })
    // Give React one tick to mount; we don't wait for `load` because we want
    // to capture pre-animation static markup.
    await page.waitForSelector('#main', { timeout: 5000 })
    const html = await page.evaluate(() => '<!doctype html>\n' + document.documentElement.outerHTML)
    return html
  } finally {
    await browser.close()
  }
}

// ---------- 4. Splice FAQ JSON-LD + write dist/index.html ---------------

async function main() {
  console.log('[prerender] building FAQ JSON-LD from Faq.jsx…')
  const faqLd = await buildFaqPageJsonLd()

  console.log('[prerender] starting vite preview on port ' + PORT + '…')
  const preview = await startPreview()

  let html
  try {
    console.log('[prerender] snapshotting ' + PREVIEW_URL + '…')
    html = await snapshot()
  } finally {
    preview.kill('SIGTERM')
  }

  if (!html.includes('<!-- FAQPAGE_LD -->')) {
    throw new Error('prerender: FAQPAGE_LD marker not found in snapshot — was index.html template edited?')
  }
  html = html.replace('<!-- FAQPAGE_LD -->', faqLd)

  await writeFile(DIST_INDEX, html, 'utf8')
  console.log('[prerender] wrote ' + DIST_INDEX + ' (' + html.length + ' bytes)')
}

main().catch((err) => {
  console.error('[prerender] failed:', err)
  process.exit(1)
})
