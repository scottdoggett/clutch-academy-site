# 03 — Content & Pricing

What each page says, what the packages cost, and the rules that keep copy from
drifting.

## Pricing — current, winter rates from October 5, 2026

All prices **+ HST**. Keep that explicit on every price display.

| Package | Duration | Price | Route |
|---|---|---|---|
| Individual Manual Lesson | 1 hr | **$90** | `/lessons/individual` |
| Manual Foundations Package | 3 × 1 hr | **$240** | `/lessons/manual-foundations` |
| Complete Manual Confidence Package | 5 × 1 hr | **$400** | `/lessons/manual-confidence` |
| Group Manual Lessons | 2 hr | **$180** | `/lessons/group` |

**Savings maths**, shown on the package pages — recompute these if the
individual rate ever changes:

- Foundations: 3 × $90 = $270, less $240 → **save $30**
- Confidence: 5 × $90 = $450, less $400 → **save $50**

At $80 a lesson, the three- and five-packs now cost the same per lesson.
The package heroes say "$80 a lesson"; the homepage and hub cards put "$80
each" in the card's one-liner, which keeps their price rows level with the
single and group cards. The savings above against single lessons aren't
shown anywhere while the fall sale runs: its savings are (§The fall sale).

### The fall sale (on `overhaul` from October 7, 2026)

Ported from the live site (`75e2646`, `a1bd04b`, `4eff398` on `main`): the
lower prices are presented as a limited-time sale.

- **The banner** above the nav: "FALL SALE · We've downshifted our prices
  for a limited time. Lessons now from $90." and, beside a price tag, "Save
  up to $70 on lesson packages" ($470 to $400, the biggest drop). It slides
  away on scroll. No end date yet; add one to the copy when Sam sets it.
- **Struck-out old prices and a Save tag** beside every price: homepage
  cards, hub cards and the four package heroes. $110, $300, $470 and $220,
  what each package cost until October 5, so Save $20, $60, $70 and $40.
  At desktop the price, old price and tag share a line; on phones the tag
  sits under the price and its unit, so the CTA beside them keeps its room.
- **One saving per card.** The tags replaced the savings against single
  lessons on October 7, at Scott's word: the "Save $50" corner badge on
  Confidence's homepage card and the heroes' "save $30" / "save $50" are
  gone. The only corner badge left is Foundations' "Recommended".
- **To end the sale**, set `FALL_SALE` to `false` in `src/lib/sale.js`. The
  banner and every struck-out price go, and the header clearance drops back
  to the nav.
- ⚠️ **Per hour, the old prices weren't higher.** They were for 75-minute
  lessons and a 2.5-hour group: $110 for 75 minutes is $88 an hour against
  today's $90, the old five-pack was $75 an hour against $80, and the group
  $88 against $90. Only Foundations is level ($80). The struck-out prices
  are real, but "Save up to $70" compares different lesson lengths. A
  question for Sam.

### Names, labels and claims (October 7, 2026)

- **One name per package, everywhere a visitor reads it:** Individual Manual
  Lesson, Manual Foundations Package, Group Manual Lessons, Complete Manual
  Confidence Package. That includes the footer, breadcrumbs, cross-links and
  the Offer schema. Short forms only where a length limit forces them (Ads
  sitelinks, ≤25 characters).
- **One featured package: Foundations**, with the "Recommended" badge, the
  highlighted card and the white button, and the only corner badge on any
  card. There is no "Best Value" (both
  packs cost $80 a lesson), no "Most Popular" (there's no booking data
  behind it, and neither label was ever on the live site) and no "flagship"
  or "premium".
- **Confidence starts from zero** (Scott, October 7): someone who has never
  driven manual can book it, and its first lessons cover the Foundations
  basics. The page says so in its eyebrow, lead and skills note.
- **Don't name the car, and make no claim about instructor licensing,
  insurance or an instructor brake** (Scott, October 7). The copy says "a
  manual hatchback" and stops there.
- The Google rating (`src/lib/googleReviews.js`) shows in the homepage's
  reviews band, "5.0 · 44 reviews" on October 7, 2026. Update the count
  there. It was tried in the hero, beside the buttons, and taken out the
  same day at Scott's word: keep it out of the hero.

### History, so the diff makes sense

The pre-August-1 offering was 60-minute lessons at $90, a $240 three-pack, a
$400 five-pack, and group lessons at $90 (1 hr) / $180 (2 hr). On August 1,
2026 lessons went to 75 minutes at $109 / $299 / $469 with a single 2.5-hour
group at $219 (`308317c` on `main`, ported to `overhaul` August 16), and on
September 21 those were rounded up to $110 / $300 / $470 / $220. A dated
banner announced the August switch; it auto-expired and was removed.

On October 5, 2026 winter rates took prices and lesson length back to the
pre-August offering, with one 2-hour group at $180 (`f8645c4` on `main`,
ported to `overhaul` October 6). `main` announces it with a "Winter rates"
banner that slides away on scroll (`a82df9d`); `overhaul` has no banner.

The group offering is **one option**, a 2-hour session. The 1-hour group
retired on August 1 hasn't come back; if it does, it is an addition.

### Where prices appear

Changing a price means changing all of these:

- `src/components/home/PackagesTeaser.jsx` — homepage teaser cards
- `src/app/manual-driving-lessons/page.jsx` — the `PACKAGES` array
- All four `src/app/lessons/*/page.jsx` — hero price lines and savings notes
- `src/app/page.jsx` — the `Offer` entries in the homepage JSON-LD graph
- `public/booked.html` — `priceForEvent()` and `DEFAULT_VALUE`, which set the
  conversion value reported to GA4, Ads, Meta, and TikTok
- `public/llms.txt` — the services list
- Sam's Calendly event names, prices, and descriptions (outside the repo)
- Google Ads price assets (see `../google-ads-mapping.md`)

⚠️ **`booked.html` order matters.** The group rule is tested *first*, so a
group event whose name mentions a package can't fall through to the `pack`
rule and report $240 for a $180 group booking. (It first went in to stop a
`"2.5"` in the 2.5-hour group's name matching the five-pack's `\b5\b`.)

## Per-page content

### `/` Homepage
Hero → Reviews → How It Works → package teasers → About teaser. Positioning and
social proof up top; the detail lives on the package pages. The About teaser
links out with "More about the story behind Clutch Academy".

### `/manual-driving-lessons` Lessons hub
The comparison page and the internal-linking spine. It opens **straight on the
packages** — the intro hero with the training car was removed in August 2026, so
"Four ways to learn" is the page's `<h1>`. Then: all four packages as cards
(Manual Foundations flagged *Recommended*, the only badge), a "Pick by
where you are today" chooser that routes by situation rather than by price, and
a closing Book CTA.

The chooser is four plain sentences on gear-lever bullets, each stating a
situation and linking the package that answers it. It was briefly four cards with
their own Book Now and See More buttons (August 18, 2026); that read as heavy for
a signpost and was reverted to text on August 20.

### `/lessons/*` Package pages
Each one, in the same order since September 28, 2026: breadcrumbs → hero with
price and Book CTA → what's included → who it's for → real Google review
quotes → a five-question FAQ subset → next steps. (This file used to put who
it's for first; only `/lessons/individual` did, and two of the other three
led with what's included, so that order won.)
These are Ads destinations; they must stand alone for someone who has never seen
the homepage. (The review strip that used to close them was removed sitewide in
August 2026 — see `02-architecture.md`.)

### `/about`
Sam's origin story, **in his own words** — supplied in the Site 2.0 review doc,
August 2026. Do not rewrite it without asking him. Then: why students choose
Clutch Academy, the common-fears section, why learn manual, and package links.

### `/faq`
Renders the full FAQ array and emits the FAQPage schema.

### `/contact`
Booking CTA, contact card (text or call, email, Instagram, Facebook), and the
payment & cancellation block.

## FAQ — the single source

`src/lib/faqs.js` is the only place FAQ copy exists. It renders `/faq`,
generates the FAQPage JSON-LD, supplies each package page's subset, and provides
`/contact`'s cancellation text. **Never fork this copy into a page.**

Ten entries, by id: `license`, `never-driven`, `synonyms`, `location`,
`how-many`, `wear`, `pay`, `cancellation`, `car`, `gift`.

Per-page subsets:

| Page | Subset |
|---|---|
| `/lessons/individual` | license, how-many, car, wear, pay |
| `/lessons/manual-foundations` | never-driven, how-many, location, car, cancellation |
| `/lessons/manual-confidence` | synonyms, location, pay, cancellation, gift |
| `/lessons/group` | license, never-driven, wear, pay, gift |

To add an FAQ: append to the array. The page, the subsets, and the structured
data all follow.

The `synonyms` entry ("manual, stick shift, standard — what's the difference?")
is there for search as much as for students; people search all three terms.

## Payment & cancellation

**Payment:** collected securely at booking via Stripe — nothing to settle in
person. **All major credit and debit cards are accepted.** E-transfer and PayPal
were removed as accepted methods in August 2026; if you find that wording
anywhere, it's stale.

**Cancellation:** cancellations at least 24 hours before the lesson are eligible
for a full refund; cancellations after 24 hours of booking, or less than 24
hours before the lesson, are charged in full. ❓ Sam has been asked to confirm
final wording — see `07-status.md`.

## Copy rules

1. **Never invent content.** No fabricated reviews, bios, policies, guarantees,
   or inclusions. Flag the gap `PENDING` instead.
2. **Every testimonial is a real Google review.** Quoted verbatim, attributed to
   the reviewer's name as it appears on the profile. No review on the site is
   presented as describing a group lesson, because none of them does.
3. **Prices are always "+ HST".**
4. **Use the synonyms.** Manual, stick shift, and standard all appear
   deliberately.
5. **Sam's words stay Sam's words.** Where he supplied copy — the About story —
   edit only with his sign-off.
