// The keyboard while driving (docs/spec/hero-drive.md §Keys, §Focus).
//
// Keys only count while focus is inside the hero, which is what makes
// single-letter controls acceptable under WCAG 2.1.4: they're heard on the
// hero, not the window. W throttle, S brake (in R they swap), A and D or ←
// and → steer, ↑ and ↓ shift up and down a gear, either Shift is the clutch
// while held, M switches between the automatic and the manual box, Esc
// exits. A shift or a switch happens once per press; key repeat is ignored.

// Keys that would scroll the page or type into it, and so are swallowed
// while driving. Space does nothing else.
const SWALLOW = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '])

const keyOf = (e) => e.key.toLowerCase()

// Clicks on these move focus as they normally would. Anywhere else in the
// hero, a click leaves focus where it is, so clicking the "game" to focus
// it doesn't end the game.
const CONTROL = 'a[href], button, input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])'

// hero: the hero section. controls: from createControls() in player.js.
// onExit: Esc, or focus leaving the hero. onShift(±1): ↑ or ↓.
// onToggleMode: M.
export function createInput(hero, { controls, onExit, onShift, onToggleMode }) {
  const held = new Set()

  function apply() {
    const want = controls.want
    want.throttle = held.has('w') ? 1 : 0
    want.brake = held.has('s') ? 1 : 0
    want.clutch = held.has('shift') ? 1 : 0
    want.steer = (held.has('d') || held.has('arrowright') ? 1 : 0) - (held.has('a') || held.has('arrowleft') ? 1 : 0)
  }

  function down(e) {
    // Browser shortcuts stay browser shortcuts.
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const key = keyOf(e)
    if (key === 'escape') {
      e.preventDefault()
      onExit()
      return
    }
    if (SWALLOW.has(key)) e.preventDefault()
    if (!e.repeat) {
      if (key === 'arrowup') onShift?.(+1)
      else if (key === 'arrowdown') onShift?.(-1)
      else if (key === 'm') onToggleMode?.()
    }
    held.add(key)
    apply()
  }

  // Heard anywhere: a key let go once focus has moved still counts.
  function up(e) {
    held.delete(keyOf(e))
    apply()
  }

  // A key released in another window never sends its keyup.
  function clear() {
    held.clear()
    apply()
    controls.clear()
  }

  // Focus leaving the hero ends the drive: tabbing away, clicking the nav,
  // the Calendly popup's iframe taking focus. The window itself losing
  // focus (another app) doesn't; that only clears the keys.
  function focusout(e) {
    if (e.relatedTarget && hero.contains(e.relatedTarget)) return
    setTimeout(() => {
      if (!document.hasFocus()) return
      if (!hero.contains(document.activeElement)) onExit()
    }, 0)
  }

  function mousedown(e) {
    if (e.target.closest(CONTROL)) return
    e.preventDefault()
  }

  hero.addEventListener('keydown', down)
  window.addEventListener('keyup', up)
  window.addEventListener('blur', clear)
  hero.addEventListener('focusout', focusout)
  hero.addEventListener('mousedown', mousedown)

  return {
    clear,
    dispose() {
      clear()
      hero.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
      hero.removeEventListener('focusout', focusout)
      hero.removeEventListener('mousedown', mousedown)
    },
  }
}
