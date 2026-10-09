'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import './CtaLooks.css'

// Development only, October 2026: looks for the hero's two buttons on trial,
// for Scott and his partner to pick from. Each is CSS over the same buttons
// (CtaLooks.css), picked by ?cta= on the homepage and set on <html>. Once a
// look is chosen it moves into Hero.css and this file goes.
const LOOKS = [
  ['a', 'Today'],
  ['b', 'Arrow chip'],
  ['b1', 'Chip pills'],
  ['b2', 'Tiles'],
  ['c', 'Road sign'],
  ['c1', 'Guide signs'],
  ['c2', 'Yellow sign'],
  ['e', 'Licence plate'],
  ['e1', 'Embossed plate'],
  ['e2', 'L and P plates'],
]

// True once on the client, without a render on the server to match.
const noop = () => () => {}
const useOnClient = () => useSyncExternalStore(noop, () => true, () => false)

export default function CtaLooks() {
  const onClient = useOnClient()

  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get('cta')
    document.documentElement.dataset.cta = LOOKS.some(([key]) => key === asked) ? asked : 'a'
  }, [])

  // Straight onto <body>: inside the hero, which is its own stacking context
  // (isolation in Hero.css), no z-index could lift it over the sections
  // below, and on a phone those are what's at the bottom of the screen.
  if (!onClient) return null
  return createPortal(
    <nav className="cta-looks" aria-label="Button looks (development only)">
      {LOOKS.map(([key, name]) => (
        <a key={key} href={`?cta=${key}`} data-look={key} title={name}>
          {key.toUpperCase()}
          <span> {name}</span>
        </a>
      ))}
    </nav>,
    document.body,
  )
}
