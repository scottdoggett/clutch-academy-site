# Google Ads — landing-page mapping

Apply these in the Google Ads UI (account `AW-18196514948`). The site work is
done; nothing below requires a code change except the **conversion label**
(item 1). Prepared July 8, 2026; prices and timing updated August 16, 2026.

⚠️ **The final URLs below live on the `overhaul` branch, which is not yet on
clutchacademy.ca.** Don't point live ads at them until the rebuild is deployed
— see `spec/06-deployment.md`. Everything else here can be prepared now.

---

## 1. ⚠️ Blocking: create the conversion action and paste its label

`public/booked.html` fires a GA4 `purchase` on every completed booking, but
the **Google Ads conversion is currently a deliberate no-op** — the label was
never issued:

```js
// public/booked.html
var GOOGLE_ADS_CONVERSION_LABEL = ''   // ← empty = never reports to Ads
```

Steps:
1. Google Ads → Goals → Conversions → **New conversion action** → Website →
   category "Purchase", name e.g. `Lesson booked`, value: use different values
   per conversion, count: one.
2. Choose the **"use Google tag" / tag-already-installed** path (the AW tag is
   already configured site-wide via gtag).
3. Copy the conversion **label** (looks like `AbC-D_efGhIj`) and paste it into
   `GOOGLE_ADS_CONVERSION_LABEL` in `public/booked.html`.

Until then, Ads can alternatively import the GA4 `purchase` event
(Tools → Conversions → Import → GA4), but the direct tag is preferred for
value + consent-mode modeling.

Also note: booked.html derives conversion **value** from the Calendly event
name using the **current** prices (90/240/400/180). The Phase 10 pricing
switch must update that mapping to 109/299/469/219.

## 2. Campaign / ad-group final URLs

| Theme (keywords) | Final URL |
|---|---|
| Brand + generic "manual driving lessons toronto" | `https://clutchacademy.ca/` |
| "stick shift lessons toronto", "learn manual toronto" (research intent) | `https://clutchacademy.ca/manual-driving-lessons` |
| "manual driving refresher", "one manual lesson", Europe-trip prep | `https://clutchacademy.ca/lessons/individual` |
| "learn to drive manual" beginner intent, "manual driving lessons for beginners" | `https://clutchacademy.ca/lessons/manual-foundations` |
| "highway manual lessons", "hill start lessons", "city driving stick shift" | `https://clutchacademy.ca/lessons/manual-confidence` |
| "group driving lesson", "learn to drive stick with a friend" | `https://clutchacademy.ca/lessons/group` |

Each landing page carries its own Calendly source tag, so GA4
`booking_cta_click.source` attributes clicks per page: `hero`/`about` (home),
`packages_single`, `packages_3pack`, `packages_confidence_5pack`,
`packages_group` (+ `packages_group_2hr` on the option card), `about_page`,
`faq`, `contact`, plus the site-wide `nav`. Full map in `spec/05-analytics.md`.

⚠️ `/manual-driving-lessons` has **no booking CTA of its own** since the intro
hero was removed — its old `lessons_overview` tag is retired. If you point ads
at that URL, conversions will attribute to whichever package page the visitor
clicks into, not to the hub.

## 3. Sitelink assets (account- or campaign-level)

| Sitelink text (≤25 ch) | Description lines (≤35 ch each) | Final URL |
|---|---|---|
| `Individual Lesson` | `Refresher or first intro` / `One-on-one, real Toronto roads` | `/lessons/individual` |
| `Foundations — 3 Lessons` | `Complete-beginner progression` / `Clutch control to independence` | `/lessons/manual-foundations` |
| `Confidence — 5 Lessons` | `Downtown, highway, rush hour` / `The premium flagship package` | `/lessons/manual-confidence` |
| `Group Lessons` | `Learn alongside a friend` / `Fun, supportive environment` | `/lessons/group` |
| `Compare All Packages` | `Every option on one page` / `Prices shown up front` | `/manual-driving-lessons` |
| `About Your Instructor` | `Meet Sam — calm & patient` / `Judgment-free lessons` | `/about` |
| `FAQ` | `Licence, what to wear, payment` / `Cancellation policy` | `/faq` |

(Google shows 2–6 + rotates; all seven give the system room to optimize.)

## 4. Price assets — current pricing

The August 1, 2026 switch has happened; these are simply the current prices,
live on the site and charged today. No scheduling or promo framing needed —
any "book before Aug 1" ad copy still running is stale and should be pulled.

Type: **Services** · Currency: **CAD** · Price qualifier: "From" only on Group
if per-person/per-pair is still unresolved.

| Header (≤25 ch) | Price | Unit | Description (≤25 ch) | Final URL |
|---|---|---|---|---|
| `Individual Lesson` | `$109` | per lesson (75 min) | `One-on-one, 75 minutes` | `/lessons/individual` |
| `Manual Foundations` | `$299` | per package (3 lessons) | `Beginner 3-lesson path` | `/lessons/manual-foundations` |
| `Manual Confidence` | `$469` | per package (5 lessons) | `Flagship 5-lesson path` | `/lessons/manual-confidence` |
| `Group Lesson` | `$219` | per lesson (2.5 hr) | `Learn with a friend` | `/lessons/group` |

All prices + HST (Ads price assets don't display tax — keep landing-page
prices authoritative). The group row matches the shipped 2.5-hour format; the
shorter options were retired in the switch. ❓ Whether $219 is per person or
per pair is still unresolved — see `spec/07-status.md`.

## 5. Housekeeping once applied

- Point any existing ad **final URLs** away from `/#packages`-style anchors
  to the mapped pages above.
- After the conversion label is live, verify in Ads → Conversions that
  `Lesson booked` records within 24–48 h of a test booking, and that GA4
  shows the matching `purchase` on `/booked`.
- Quality Score should improve as each ad group's keyword now matches a
  dedicated page — that was the point of the rebuild. Re-check ad relevance
  after a week of serving.
- ⚠️ Slugs have never had a deliberate keyword audit (`spec/04-seo.md`).
  Changing one after ads point at it means redirects and re-approval, so raise
  it before these URLs go live, not after.
