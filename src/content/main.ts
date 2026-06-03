// ─── Toggle the "Viewed" button on GitHub PR diffs with the `v` key ──────────

const VIEWED_SELECTOR = 'button[class*="MarkAsViewedButton-module"]'

function isChecked(btn: HTMLButtonElement): boolean {
  return btn.getAttribute('aria-pressed') === 'true'
}

function viewedButtons(): HTMLButtonElement[] {
  return Array.from(document.querySelectorAll<HTMLButtonElement>(VIEWED_SELECTOR))
}

const STICKY_SELECTOR = '[class*="use-sticky-header-module__stickyHeader"]'

/** Height of the sticky toolbar pinned to the top of the viewport, if any. */
function stickyOffset(): number {
  const sticky = document.querySelector<HTMLElement>(STICKY_SELECTOR)
  return sticky ? sticky.getBoundingClientRect().height : 0
}

/** Scroll the element holding `btn` to just below the sticky header. */
function scrollHeaderToTop(btn: HTMLButtonElement) {
  const header = btn.closest<HTMLElement>('[data-diff-header-wrapper]') ?? btn
  const top = header.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top: top - stickyOffset(), behavior: 'smooth' })
}

/** Mark the next unchecked file as viewed, then scroll it to the top. */
function checkNext() {
  const next = viewedButtons().find(btn => !isChecked(btn))
  if (!next) return
  next.click()
  // Clicking collapses the diff; wait for the layout to settle before scrolling
  // so the header lands at the correct position instead of just out of view.
  requestAnimationFrame(() => requestAnimationFrame(() => scrollHeaderToTop(next)))
}

/** Scroll the next unchecked file to the top without marking it viewed. */
function scrollToNext() {
  const next = viewedButtons().find(btn => !isChecked(btn))
  if (next) scrollHeaderToTop(next)
}

/** Unmark the last checked file as viewed. */
function uncheckLast() {
  const checked = viewedButtons().filter(isChecked)
  const last = checked[checked.length - 1]
  last.scrollIntoView({ block: 'center', behavior: 'smooth' })
  last.click()
}

function isEditing(): boolean {
  const active = document.activeElement
  return (
    active instanceof HTMLTextAreaElement ||
    active instanceof HTMLInputElement ||
    (active instanceof HTMLElement && active.isContentEditable)
  )
}

const TARGETED_FILE_SELECTOR = '[class*="Diff-module__diffTargetable"][data-targeted="true"]'
const FILE_HEADER_SELECTOR = '[class*="DiffFileHeader-module__diff-file-header"]'
const OVERLAY_SELECTOR = '[role="dialog"], [aria-modal="true"], dialog[open]'

/** Whether an element is rendered (not hidden via display/visibility/size). */
function isVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

/**
 * Whether an overlay (e.g. the Submit review panel) is open and should own the
 * Escape key. We defer to GitHub's handler in that case. Hidden dialogs that
 * linger in the DOM (such as the search suggestions dialog) are ignored.
 */
function escapeOwnedByOverlay(): boolean {
  const overlays = document.querySelectorAll<HTMLElement>(OVERLAY_SELECTOR)
  return Array.from(overlays).some(isVisible)
}

/** Collapse the currently focused (targeted) file if it is expanded. */
function collapseTargetedFile(): boolean {
  const targeted = document.querySelector<HTMLElement>(TARGETED_FILE_SELECTOR)
  if (!targeted) return false
  const header = targeted.querySelector<HTMLElement>(FILE_HEADER_SELECTOR)
  if (!header || header.className.includes('collapsed')) return false
  const toggle = header.querySelector<HTMLButtonElement>('button')
  if (!toggle) return false
  toggle.click()
  return true
}

document.addEventListener(
  'keydown',
  (e: KeyboardEvent) => {
    const key = e.key.toLowerCase()
    if (key !== 'v' && key !== 'n') return
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (isEditing()) return

    e.preventDefault()
    e.stopPropagation()
    if (key === 'n') {
      scrollToNext()
    } else if (e.shiftKey) {
      uncheckLast()
    } else {
      checkNext()
    }
  },
  true,
)

// Collapse the focused file on Escape. Registered in the bubbling phase without
// stopping propagation so GitHub's own Escape handling (e.g. closing the Submit
// review panel) takes precedence.
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return
  if (e.defaultPrevented) return
  if (e.ctrlKey || e.metaKey || e.altKey) return
  if (isEditing() || escapeOwnedByOverlay()) return
  collapseTargetedFile()
})
