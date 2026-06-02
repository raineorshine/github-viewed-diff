export interface Shortcut {
  code: string
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  altKey: boolean
}

export function defaultShortcut(): Shortcut {
  const isMac = navigator.platform.includes('Mac') || navigator.userAgent.includes('Mac')
  return {
    code: 'KeyM',
    ctrlKey: !isMac,
    metaKey: isMac,
    shiftKey: true,
    altKey: false,
  }
}

export async function loadShortcut(): Promise<Shortcut> {
  return new Promise(resolve => {
    chrome.storage.sync.get('shortcut', result => {
      resolve((result.shortcut as Shortcut) ?? defaultShortcut())
    })
  })
}

export async function saveShortcut(shortcut: Shortcut): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.sync.set({ shortcut }, resolve)
  })
}

/** Format a Shortcut as human-readable text, e.g. "⌘⇧M" on Mac or "Ctrl+Shift+M" on others. */
export function formatShortcut(s: Shortcut): string {
  const isMac = navigator.platform.includes('Mac') || navigator.userAgent.includes('Mac')
  const key = keyLabel(s.code)

  if (isMac) {
    const parts: string[] = []
    if (s.ctrlKey) parts.push('⌃')
    if (s.altKey) parts.push('⌥')
    if (s.shiftKey) parts.push('⇧')
    if (s.metaKey) parts.push('⌘')
    parts.push(key)
    return parts.join('')
  } else {
    const parts: string[] = []
    if (s.ctrlKey) parts.push('Ctrl')
    if (s.altKey) parts.push('Alt')
    if (s.shiftKey) parts.push('Shift')
    if (s.metaKey) parts.push('Meta')
    parts.push(key)
    return parts.join('+')
  }
}

function keyLabel(code: string): string {
  if (code.startsWith('Key')) return code.slice(3).toUpperCase()
  if (code.startsWith('Digit')) return code.slice(5)
  const map: Record<string, string> = {
    Space: 'Space',
    Enter: '↵',
    Backspace: '⌫',
    Tab: '⇥',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Escape: 'Esc',
    Delete: 'Del',
    Home: 'Home',
    End: 'End',
    PageUp: 'PgUp',
    PageDown: 'PgDn',
  }
  return map[code] ?? code
}
