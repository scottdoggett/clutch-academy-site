import Link from 'next/link'
import './Breadcrumbs.css'

const SITE = 'https://clutchacademy.ca'

// Trail of ancestors ending with the current page. Items with an `href` render
// as links; the last item should omit it, so it renders as plain text marked
// aria-current="page".
//
// Also emits BreadcrumbList JSON-LD, which is what lets Google replace the raw
// URL in the search result with the readable trail. The visible trail and the
// structured data are generated from the same array so they can't drift.
export default function Breadcrumbs({ items }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      // The current page is its own position but carries no `item` URL, per
      // Google's breadcrumb guidance.
      ...(item.href ? { item: SITE + item.href } : {}),
    })),
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <div className="section__inner">
        <ol className="breadcrumbs__list">
          {items.map((item) => (
            <li key={item.label} className="breadcrumbs__item">
              {item.href ? (
                <Link href={item.href} className="breadcrumbs__link">
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumbs__current" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
    </nav>
  )
}
