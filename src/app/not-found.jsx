import Link from 'next/link'

export const metadata = {
  title: 'Page Not Found | Clutch Academy',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <section className="placeholder-hero" aria-labelledby="page-heading">
      <h1 id="page-heading">Page not found</h1>
      <p>
        That page doesn&apos;t exist. It may have moved when we rebuilt the
        site. You&apos;ll find every lesson under Manual driving lessons below.
      </p>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/manual-driving-lessons">Manual driving lessons</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </section>
  )
}
