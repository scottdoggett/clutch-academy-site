// The fall sale, from October 5, 2026, with no end date yet. While it's on,
// a banner above the nav announces it (AnnouncementBanner, mounted in
// app/layout.jsx) and every price shows the one it replaced, struck through,
// and the saving (WasPrice). To end the sale, set FALL_SALE to false: both
// go, and the header clearance drops back to the nav alone.
//
// Ported from the live site (a1bd04b on main), which strikes the same old
// prices. They're what each package cost until October 5: 75-minute lessons
// and a 2.5-hour group (docs/spec/03-content-and-pricing.md §History).
export const FALL_SALE = true

export const WAS_PRICE = {
  individual: 110,
  foundations: 300,
  confidence: 470,
  group: 220,
}

// Today's prices, for the savings: $20, $60, $70 and $40. They're written
// out again on every page that shows them (03-content-and-pricing.md lists
// the surfaces), so change both together.
const PRICE = {
  individual: 90,
  foundations: 240,
  confidence: 400,
  group: 180,
}

export const SAVING = Object.fromEntries(
  Object.keys(WAS_PRICE).map((pkg) => [pkg, WAS_PRICE[pkg] - PRICE[pkg]]),
)
