# 03 — Content & Pricing

What each page says, what the packages cost, and the rules that keep copy from
drifting.

## Pricing — current, effective August 1, 2026

All prices **+ HST**. Keep that explicit on every price display.

| Package | Duration | Price | Route |
|---|---|---|---|
| Individual Manual Lesson | 75 min | **$109** | `/lessons/individual` |
| Manual Foundations (3 lessons) | 3 × 75 min | **$299** | `/lessons/manual-foundations` |
| Complete Manual Confidence (5 lessons) | 5 × 75 min | **$469** | `/lessons/manual-confidence` |
| Group Manual Lesson | 2.5 hr | **$219** | `/lessons/group` |

**Savings maths**, shown on the package pages — recompute these if the
individual rate ever changes:

- Foundations: 3 × $109 = $327, less $299 → **save $28**
- Confidence: 5 × $109 = $545, less $469 → **save $76**

### History, so the diff makes sense

The pre-August-1 offering was 60-minute lessons at $90, a $240 three-pack, a
$400 five-pack, and group lessons at $90 (1 hr) / $180 (2 hr). The switch
shipped to the live Vite site on July 31, 2026 (`308317c`) and was ported to
`overhaul` on August 16, 2026. A dated announcement banner explained the change
in advance; it auto-expired on August 1 and has since been removed.

The group offering **collapsed from two options to one** in the switch — the
new pricing lists only a 2.5-hour group session. `overhaul` matches the live
site. If a shorter option comes back it is an addition, not a revert.

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

⚠️ **`booked.html` order matters.** The group rule must be tested *before* the
five-pack rule: `"2.5"` satisfies the five-pack's `\b5\b` pattern, so an
unordered map reports $469 for a $219 group booking.

## Per-page content

### `/` Homepage
Hero → Reviews → How It Works → package teasers → About teaser. Positioning and
social proof up top; the detail lives on the package pages. The About teaser
links out with "More about the story behind Clutch Academy".

### `/manual-driving-lessons` Lessons hub
The comparison page and the internal-linking spine. An intro hero with the
training car, all four packages as cards (Manual Foundations flagged *Most
Popular*, Confidence *Best Value*), then a "Pick by where you are today"
chooser that routes by situation rather than by price.

### `/lessons/*` Package pages
Each one: breadcrumbs → hero with price and Book CTA → who it's for → what's
included → real Google review quotes → a five-question FAQ subset → next steps
→ review strip. These are Ads destinations; they must stand alone for someone
who has never seen the homepage.

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
