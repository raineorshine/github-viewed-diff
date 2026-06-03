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

// Stable identifiers for files, used to track check history across re-renders.
const DIFF_ID_SELECTOR = '[id^="diff-"]'
const checkHistory: string[] = []
const redoStack: string[] = []

/** Stable id of the file a Viewed button belongs to, if any. */
function diffIdFor(btn: HTMLButtonElement): string | null {
  return btn.closest<HTMLElement>(DIFF_ID_SELECTOR)?.id ?? null
}

/** The Viewed button for a given file id, if present in the DOM. */
function viewedButtonForDiffId(diffId: string): HTMLButtonElement | null {
  const region = document.getElementById(diffId)
  return region?.querySelector<HTMLButtonElement>(VIEWED_SELECTOR) ?? null
}

/** Record a check in history so it can be undone, clearing any redo state. */
function recordCheck(btn: HTMLButtonElement) {
  const diffId = diffIdFor(btn)
  if (!diffId) return
  checkHistory.push(diffId)
  redoStack.length = 0
}

/** Toggle a file's Viewed button to the desired state and scroll it into view. */
function setViewed(diffId: string, viewed: boolean) {
  const btn = viewedButtonForDiffId(diffId)
  if (!btn) return
  if (isChecked(btn) !== viewed) btn.click()
  requestAnimationFrame(() => requestAnimationFrame(() => scrollHeaderToTop(btn)))
}

/** Undo the most recent check, unmarking that file as viewed. */
function undoCheck() {
  const diffId = checkHistory.pop()
  if (!diffId) return
  redoStack.push(diffId)
  setViewed(diffId, false)
}

/** Redo the most recently undone check, re-marking that file as viewed. */
function redoCheck() {
  const diffId = redoStack.pop()
  if (!diffId) return
  checkHistory.push(diffId)
  setViewed(diffId, true)
}

/** Whether the button's diff header is within the vertical viewport bounds. */
function isInViewport(btn: HTMLButtonElement): boolean {
  const rect = btn.getBoundingClientRect()
  return rect.bottom > stickyOffset() && rect.top < window.innerHeight
}

/** Mark the first unchecked file visible in the viewport as viewed. */
function checkNext() {
  const target = viewedButtons().find(btn => !isChecked(btn) && isInViewport(btn))
  if (!target) return
  recordCheck(target)
  target.click()
  // Clicking collapses the diff; wait for the layout to settle before scrolling
  // so the header lands at the correct position instead of just out of view.
  requestAnimationFrame(() => requestAnimationFrame(() => scrollHeaderToTop(target)))
}

/** Scroll the next unchecked file to the top without marking it viewed. */
function scrollToNext() {
  const next = viewedButtons().find(btn => !isChecked(btn))
  if (next) scrollHeaderToTop(next)
}

/** Unmark the first viewed file visible in the viewport, mirroring `checkNext`. */
function uncheckInViewport() {
  const target = viewedButtons().find(btn => isChecked(btn) && isInViewport(btn))
  if (!target) return
  target.click()
  requestAnimationFrame(() => requestAnimationFrame(() => scrollHeaderToTop(target)))
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
      uncheckInViewport()
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

// Undo/redo the check history with Cmd+Z and Cmd+Shift+Z.
document.addEventListener(
  'keydown',
  (e: KeyboardEvent) => {
    if (e.key.toLowerCase() !== 'z') return
    if (!e.metaKey || e.ctrlKey || e.altKey) return
    if (isEditing()) return

    e.preventDefault()
    e.stopPropagation()
    if (e.shiftKey) {
      redoCheck()
    } else {
      undoCheck()
    }
  },
  true,
)
