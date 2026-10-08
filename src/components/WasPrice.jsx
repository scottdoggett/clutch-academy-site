import { FALL_SALE, SAVING, WAS_PRICE } from '../lib/sale'

// A package's price before the fall sale, struck through, and the saving,
// for beside today's price (src/lib/sale.js). The old price is sized from
// the price it sits in; the saving is a small tag, as on the live site.
// Screen readers skip the strike, so the hidden "Was" carries the meaning.
// Renders nothing once the sale is off.
export default function WasPrice({ pkg }) {
  if (!FALL_SALE) return null
  return (
    <span className="price-deal">
      <s className="price-was">
        <span className="visually-hidden">Was </span>${WAS_PRICE[pkg]}
      </s>
      <span className="price-save">Save ${SAVING[pkg]}</span>
    </span>
  )
}
