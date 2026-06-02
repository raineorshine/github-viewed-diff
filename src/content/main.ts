// ─── Keyboard Listener ────────────────────────────────────────────────────────
import { type Shortcut, defaultShortcut, loadShortcut } from '../shortcut'

// ─── Utilities ───────────────────────────────────────────────────────────────

function showToast(message: string, type: 'success' | 'error' = 'error') {
  const existing = document.getElementById('github-fast-merge-toast')
  existing?.remove()

  const toast = document.createElement('div')
  toast.id = 'github-fast-merge-toast'
  toast.textContent = message
  Object.assign(toast.style, {
    position: 'fixed',
    top: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '99999',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    lineHeight: '1.5',
    maxWidth: '400px',
    boxShadow: '0 8px 24px rgba(140,149,159,0.2)',
    border: '1px solid',
    color: type === 'error' ? 'var(--fgColor-onEmphasis, #ffffff)' : 'var(--fgColor-onEmphasis, #ffffff)',
    backgroundColor:
      type === 'error' ? 'var(--bgColor-danger-emphasis, #cf222e)' : 'var(--bgColor-success-emphasis, #1a7f37)',
    borderColor:
      type === 'error' ? 'var(--borderColor-danger-emphasis, #a40e26)' : 'var(--borderColor-success-emphasis, #1a7f37)',
    transition: 'opacity 0.3s',
  })
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => toast.remove(), 300)
  }, 4000)
}

function waitForElement<T extends Element>(
  selector: string,
  options: {
    timeout?: number
    root?: Element | Document
    filter?: (el: T) => boolean
  } = {},
): Promise<T> {
  const { timeout = 5000, root = document, filter } = options

  return new Promise((resolve, reject) => {
    const check = () => {
      const els = root.querySelectorAll<T>(selector)
      for (const el of els) {
        if (!filter || filter(el)) return el
      }
      return null
    }

    const found = check()
    if (found) return resolve(found)

    const timer = setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Timed out waiting for: ${selector}`))
    }, timeout)

    const observer = new MutationObserver(() => {
      const found = check()
      if (found) {
        clearTimeout(timer)
        observer.disconnect()
        resolve(found)
      }
    })

    observer.observe(root, { childList: true, subtree: true, attributes: true, characterData: true })
  })
}

// ─── Merge Sequence ───────────────────────────────────────────────────────────

async function fastMerge() {
  const mergebox = document.querySelector<HTMLElement>('[data-testid="mergebox-partial"]')
  if (!mergebox) {
    showToast('Could not find the merge box. Are you on a PR page?')
    return
  }

  // Step 1: Verify all checks have passed
  const checksSection = mergebox.querySelector<HTMLElement>('section[aria-label="Checks"]')
  if (!checksSection) {
    showToast('Could not find the checks section.')
    return
  }
  const checksHeading = checksSection.querySelector('h3')
  const checksText = checksHeading?.textContent?.toLowerCase() ?? ''
  if (!checksText.includes('passed')) {
    if (checksText.includes('failed')) {
      showToast(`Checks have failed. Fix them first or bypass rules.`)
    } else {
      showToast(`Checks are not passing yet: "${checksHeading?.textContent?.trim()}"`)
    }
    return
  }

  // Step 2: Tick the bypass rules checkbox (optional — may not exist on all PRs)
  const checkbox = mergebox.querySelector<HTMLInputElement>('input[type="checkbox"]')
  if (checkbox && !checkbox.checked) {
    checkbox.click()
  }

  // Step 3: Click the merge button (enabled after bypass checkbox is ticked)
  let mergeButton: HTMLButtonElement
  try {
    mergeButton = await waitForElement<HTMLButtonElement>('[data-testid="mergebox-partial"] button.flex-1', {
      timeout: 5000,
      filter: btn => btn.getAttribute('aria-disabled') !== 'true' && btn.getAttribute('data-inactive') !== 'true',
    })
  } catch {
    showToast('Merge button did not become enabled within 5 seconds.')
    return
  }
  mergeButton.click()

  // Step 4: Click the confirm merge button
  let confirmButton: HTMLButtonElement | null = null
  try {
    confirmButton = await waitForElement<HTMLButtonElement>('[data-testid="mergebox-partial"] button', {
      timeout: 5000,
      filter: btn => {
        const text = btn.textContent?.toLowerCase() ?? ''
        return text.includes('confirm') && !btn.hidden && btn.getAttribute('aria-disabled') !== 'true'
      },
    })
  } catch {
    showToast('Confirm merge button did not appear within 5 seconds.')
    return
  }
  confirmButton.click()

  // Step 5: Wait for "Pull request successfully merged and closed"
  try {
    await waitForElement<HTMLHeadingElement>('[data-testid="mergebox-border-container"] h3', {
      timeout: 5000,
      filter: h3 => (h3.textContent ?? '').toLowerCase().includes('successfully merged'),
    })
  } catch {
    showToast('Timed out waiting for merge confirmation after 5 seconds.')
    return
  }

  showToast('PR merged successfully! 🎉', 'success')

  // Step 6: Click the "Done" notification button
  try {
    const doneButton = await waitForElement<HTMLButtonElement>('button[aria-label="Done"][data-hotkey="e"]', {
      timeout: 5000,
    })
    doneButton.click()
  } catch {
    // Done button missing is non-fatal — merge already succeeded
  }
}

let activeShortcut: Shortcut = defaultShortcut()

loadShortcut().then(s => {
  activeShortcut = s
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.shortcut) {
    activeShortcut = changes.shortcut.newValue as Shortcut
  }
})

document.addEventListener('keydown', (e: KeyboardEvent) => {
  const s = activeShortcut
  if (e.code !== s.code) return
  if (s.ctrlKey && !e.ctrlKey) return
  if (s.metaKey && !e.metaKey) return
  if (s.shiftKey && !e.shiftKey) return
  if (s.altKey && !e.altKey) return

  const active = document.activeElement
  if (
    active instanceof HTMLTextAreaElement ||
    active instanceof HTMLInputElement ||
    (active instanceof HTMLElement && active.isContentEditable)
  ) {
    return
  }

  e.preventDefault()
  fastMerge()
})
