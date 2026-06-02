import { type Shortcut, defaultShortcut, loadShortcut, saveShortcut } from '../shortcut'

const displayEl = document.getElementById('shortcut-display')!
const recordBtn = document.getElementById('record-btn') as HTMLButtonElement
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement
const saveBtn = document.getElementById('save-btn') as HTMLButtonElement
const statusEl = document.getElementById('status')!

let current: Shortcut
let pending: Shortcut | null = null
let recording = false

function renderShortcut(s: Shortcut, el: HTMLElement) {
  const isMac = navigator.platform.includes('Mac') || navigator.userAgent.includes('Mac')
  const parts: string[] = []

  if (isMac) {
    if (s.ctrlKey) parts.push('⌃')
    if (s.altKey) parts.push('⌥')
    if (s.shiftKey) parts.push('⇧')
    if (s.metaKey) parts.push('⌘')
  } else {
    if (s.ctrlKey) parts.push('Ctrl')
    if (s.altKey) parts.push('Alt')
    if (s.shiftKey) parts.push('Shift')
    if (s.metaKey) parts.push('Meta')
  }

  const keyCode = s.code
  const keyLabel = keyCode.startsWith('Key')
    ? keyCode.slice(3).toUpperCase()
    : keyCode.startsWith('Digit')
      ? keyCode.slice(5)
      : keyCode

  el.innerHTML = [...parts, keyLabel].map(p => `<kbd>${p}</kbd>`).join('')
}

function setStatus(msg: string, isError = false) {
  statusEl.textContent = msg
  statusEl.className = 'status' + (isError ? ' error' : '')
  if (msg)
    setTimeout(() => {
      statusEl.textContent = ''
    }, 3000)
}

function startRecording() {
  recording = true
  recordBtn.textContent = 'Press keys…'
  recordBtn.classList.add('recording')
  displayEl.innerHTML = '<span style="color:#636c76;font-style:italic">Waiting for input…</span>'
  saveBtn.disabled = true
}

function stopRecording() {
  recording = false
  recordBtn.textContent = 'Record'
  recordBtn.classList.remove('recording')
}

recordBtn.addEventListener('click', () => {
  if (recording) {
    stopRecording()
    renderShortcut(pending ?? current, displayEl)
  } else {
    startRecording()
  }
})

resetBtn.addEventListener('click', () => {
  stopRecording()
  pending = defaultShortcut()
  renderShortcut(pending, displayEl)
  saveBtn.disabled = false
  setStatus('')
})

saveBtn.addEventListener('click', async () => {
  if (!pending) return
  await saveShortcut(pending)
  current = pending
  pending = null
  saveBtn.disabled = true
  setStatus('Saved!')
})

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (!recording) return

  // Ignore lone modifier key presses
  if (['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) return

  const hasModifier = e.ctrlKey || e.metaKey || e.altKey || e.shiftKey
  if (!hasModifier) {
    setStatus('Include at least one modifier key (Ctrl, Alt, Shift, or ⌘).', true)
    return
  }

  e.preventDefault()

  pending = {
    code: e.code,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
    shiftKey: e.shiftKey,
    altKey: e.altKey,
  }

  stopRecording()
  renderShortcut(pending, displayEl)
  saveBtn.disabled = false
  setStatus('')
})

// Init
loadShortcut().then(s => {
  current = s
  renderShortcut(current, displayEl)
})
