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

/** Mark the next unchecked file as viewed. */
function checkNext() {
  const next = viewedButtons().find(btn => !isChecked(btn))
  if (next) scrollAndClick(next)
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
    if (e.code !== 'KeyV') return
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (isEditing()) return

    e.preventDefault()
    e.stopPropagation()
    if (e.shiftKey) {
      uncheckLast()
    } else {
      checkNext()
    }
  },
  true,
)
