// ─── Toggle the "Viewed" button on GitHub PR diffs with the `v` key ──────────

const VIEWED_SELECTOR = 'button[class*="MarkAsViewedButton-module"]'

function isChecked(btn: HTMLButtonElement): boolean {
  return btn.getAttribute('aria-pressed') === 'true'
}

function viewedButtons(): HTMLButtonElement[] {
  return Array.from(document.querySelectorAll<HTMLButtonElement>(VIEWED_SELECTOR))
}

function scrollAndClick(btn: HTMLButtonElement) {
  btn.scrollIntoView({ block: 'center', behavior: 'smooth' })
  btn.click()
}

const STICKY_SELECTOR = '[class*="use-sticky-header-module__stickyHeader"]'

/** Height of the sticky toolbar pinned to the top of the viewport, if any. */
function stickyOffset(): number {
  const sticky = document.querySelector<HTMLElement>(STICKY_SELECTOR)
  return sticky ? sticky.getBoundingClientRect().height : 0
}

/** Scroll the element holding `btn` to just below the sticky header. */
function scrollHeaderToTop(btn: HTMLButtonElement) {
  const header =
    btn.closest<HTMLElement>('[data-diff-header-wrapper]') ?? btn
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
  requestAnimationFrame(() =>
    requestAnimationFrame(() => scrollHeaderToTop(next)),
  )
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
  if (last) scrollAndClick(last)
}

function isEditing(): boolean {
  const active = document.activeElement
  return (
    active instanceof HTMLTextAreaElement ||
    active instanceof HTMLInputElement ||
    (active instanceof HTMLElement && active.isContentEditable)
  )
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
