// Inline script, first in <body> (layout.jsx), before any hero. It marks
// the document "motion allowed" so src/styles/motion.css can put the hero in
// its starting states before first paint (docs/spec/08-motion.md §The hero).
//
// A data attribute rather than a class, so it doesn't collide with the
// className React owns on <html>. Kept out of src/lib/motion.js on purpose:
// that module is client-only, and a server component importing a string from
// it would get a client reference, not the string.
export const MOTION_PREPAINT = `try{if(matchMedia('(prefers-reduced-motion: no-preference)').matches)document.documentElement.setAttribute('data-motion','ok')}catch(_){}`
