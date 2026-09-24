// The keyboard while driving (docs/spec/hero-drive.md §Keys, §Focus).
//
// Keys only count while focus is on the gear display, in the driving layer,
// which is what makes single-letter controls acceptable under WCAG 2.1.4:
// they're heard there, not on the window. W throttle, S brake (in R they swap), A and D or ←
// and → steer, ↑ and ↓ shift up and down a gear, either Shift is the clutch
// while held, M switches between the automatic and the manual box, Esc
// exits. A shift or a switch happens once per press; key repeat is ignored.

// Keys that would scroll the page or type into it, and so are swallowed
// while driving. Space does nothing else.
const SWALLOW = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '])

const keyOf = (e) => e.key.toLowerCase()

// Clicks on these move focus as they normally would, and so end the drive.
// Anywhere else on the page, which is all the "game" now, a click leaves
// focus where it is, so clicking it to focus it doesn't end the game.
const CONTROL = 'a[href], button, input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])'

// area: the driving layer, which holds the gear display. controls: from
// createControls() in player.js. onExit: Esc, or focus leaving the layer.
// onShift(±1): ↑ or ↓. onToggleMode: M.
export function createInput(area, { controls, onExit, onShift, onToggleMode }) {
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

  // Focus leaving the layer ends the drive: tabbing away, clicking the nav
  // or a button, the Calendly popup's iframe taking focus. The window
  // itself losing focus (another app) doesn't; that only clears the keys.
  function focusout(e) {
    if (e.relatedTarget && area.contains(e.relatedTarget)) return
    setTimeout(() => {
      if (!document.hasFocus()) return
      if (!area.contains(document.activeElement)) onExit()
    }, 0)
  }

  function mousedown(e) {
    if (e.target.closest(CONTROL)) return
    e.preventDefault()
  }

  area.addEventListener('keydown', down)
  window.addEventListener('keyup', up)
  window.addEventListener('blur', clear)
  area.addEventListener('focusout', focusout)
  document.addEventListener('mousedown', mousedown)

  return {
    clear,
    dispose() {
      clear()
      area.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
      area.removeEventListener('focusout', focusout)
      document.removeEventListener('mousedown', mousedown)
    },
  }
}
