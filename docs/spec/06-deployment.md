# 06 — Deployment

## Two Vercel projects, one repo

This is the single most confusing thing about the repo, so it comes first.

There are **two separate Vercel projects**, each wired to a different branch of
this repository, each building a **different framework**. Both are deployed
right now, on purpose.

| | Live site | Review site |
|---|---|---|
| **Branch** | `main` | `overhaul` |
| **Framework** | Vite (React 19 + GSAP), single-page | Next.js 16 App Router, multi-page |
| **Build** | `vite build && node scripts/prerender.mjs` | `next build` |
| **Config** | `vercel.json` | `next.config.mjs` |
| **Domain** | `clutchacademy.ca` — the real one | Its own Vercel project URL — ⚠️ **not recorded anywhere in this repo**; find it in the Vercel dashboard as the project whose production branch is `overhaul`. Worth pasting here. |
| **Audience** | Customers | Sam and anyone reviewing the rebuild |
| **Purpose** | Keep the business running | Show the rebuild before committing to it |

The split exists so `main` can stay live and unbroken while the rebuild is
shown to people. It is a deliberate arrangement, not drift, and it should stay
this way until cutover.

### What this means day to day

- **Work on `overhaul`.** Pushing to it redeploys the review site. This is safe.
- **Never commit directly to `main`.** Pushing to it changes what customers see.
- **The two branches have genuinely diverged.** They are different codebases
  with different dependencies, different file layouts, and — until August 16,
  2026 — different prices. Don't cherry-pick between them casually.
- **`npm install` when you switch branches.** `main` needs Vite and GSAP;
  `overhaul` needs Next. The `node_modules` on disk will be wrong for whichever
  branch you just left.
- Each project must have the correct **framework preset** in its Vercel
  dashboard. If the `overhaul` project was ever cloned from the Vite one, check
  that it says Next.js and not "Other" with a `dist` output directory — a stale
  override breaks the build in a confusing way.

### Branch inventory

| Branch | State |
|---|---|
| `main` | Live Vite site. Carries the August-1 pricing switch (`308317c`, July 31, 2026). |
| `overhaul` | The Next.js rebuild. Where all current work happens. |
| `development` | Exists on the remote; not part of the current workflow. |

`git branch` shows only local branches — a fresh clone will look like `main` is
the only one. Use `git branch -a`, and `git switch overhaul` to get a tracking
branch.

## Routing, redirects, and headers (`overhaul`)

All of it lives in `next.config.mjs`. `vercel.json` was deleted in the
migration; don't reintroduce it.

**Redirects** — canonicalise to the apex domain, 308 permanent:
`www.clutchacademy.ca`, `clutchacademy.com`, and `www.clutchacademy.com` all →
`https://clutchacademy.ca`. These are *also* configured at the Vercel domain
level; they're kept in the repo so the behaviour survives a hosting move.

⚠️ **A known trap, learned the hard way on the Vite site:** a host redirect in
project config can fight Vercel's own domain-dashboard redirect. When the
dashboard had `www` set as Primary and the config redirected `www` → apex, the
two layers pointed at each other and produced an infinite redirect loop. If you
see a loop, that's where to look.

**Rewrites** — for the two static pages that ship verbatim from `public/`:
`/booked` → `/booked.html`, `/privacy` → `/privacy.html`. These replace the
Vite build's `cleanUrls`.

**Cache headers:**

| Path | Cache-Control |
|---|---|
| Images and fonts (`webp\|jpeg\|jpg\|png\|svg\|woff\|woff2`) | `max-age=2592000` (30 days) |
| `robots.txt`, `sitemap.xml`, `llms.txt`, `site.webmanifest` | `max-age=3600` |
| `/` | `max-age=300`, plus `X-Robots-Tag: index, follow` |

Next serves its own hashed bundles from `/_next/static` with immutable caching
built in, which is why there's no `/assets/*` rule any more — that was Vite's
hashed output directory.

## Cutover runbook

What "go live with the rebuild" actually takes. Nothing here has been done yet.

1. **Finish the open flags in `07-status.md`** that need Sam — About story
   sign-off, fonts, inclusions, cancellation wording, group pricing basis.
2. **Push `overhaul`** and confirm its Vercel project builds cleanly.
3. **Real-device iOS Safari pass** on the review deployment. This has never been
   done since the migration and is a genuine pre-launch requirement: test the
   Calendly popup (the custom mobile host), consent accept and decline, and
   general layout.
4. **Re-run Lighthouse** across all 9 routes. The last full pass predates the
   August 2026 changes, including the August 18 layout rework — treat the
   recorded scores in `04-seo.md` as stale, not as a baseline.
5. **Decide the `aggregateRating` question** (`04-seo.md`) before it ships under
   the real domain.
6. **Merge `overhaul` → `main`.** Expect a large diff: two frameworks.
7. **Point the live Vercel project at the Next.js build** — framework preset,
   build command, output. This is the step most likely to bite.
8. **Verify in production:** the three host redirects, `/booked` with a real
   test booking, GA4 realtime, `/privacy`, and fetch the sitemap in Search
   Console.
9. **Then** apply the account-side work: `../google-ads-mapping.md` in the Ads
   UI, including creating the conversion action and pasting its label into
   `booked.html` (see `05-analytics.md`).
10. **Decide what happens to the second project.** Once `main` builds the Next
    site, the review project is either retired or repurposed as a staging
    environment. Leaving two projects serving near-identical content invites
    duplicate-content problems if the review URL is ever indexed — check that it
    is noindexed or password-protected in the meantime.

## Local development

```
git switch overhaul
npm install          # branch-specific — see above
npm run dev
```

`npm run build && npm run start` serves the real static output, which is what
you want for anything SEO- or metadata-related; `dev` renders differently
enough to mislead.

## Developer-environment quirks

Scott runs hooks that intercept agent tool calls: a **config-protection hook**
blocks edits to `eslint.config.js` (legitimate changes go through its documented
escape hatch), and a **GateGuard hook** requires stating "facts" before the first
Bash call of a session and before destructive commands. Present what they ask
for and retry rather than working around them.
