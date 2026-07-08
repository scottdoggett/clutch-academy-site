import Link from 'next/link'
import './lessons.css'

// Page-relevant FAQ subset for the package pages. Items come from the shared
// FAQS array (src/lib/faqs.js) so the copy here always matches the /faq page
// and its structured data. Native <details> accordion — no JS.
export default function LessonFaq({ items }) {
  return (
    <div className="lesson-faq">
      {items.map((item) => (
        <details key={item.id} name="lesson-faq" className="lesson-faq__item">
          <summary className="lesson-faq__question">{item.q}</summary>
          <p className="lesson-faq__answer">{item.a}</p>
        </details>
      ))}
      <p className="lesson-faq__more">
        More questions? <Link href="/faq">Read the full FAQ</Link>.
      </p>
    </div>
  )
}
