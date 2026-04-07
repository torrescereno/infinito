import { useEffect } from 'react'

type KeyCombo = { mod: boolean; shift: boolean; key: string }

function parseKeys(keys: string): KeyCombo {
  const parts = keys.split('+')
  return {
    mod: parts.includes('mod'),
    shift: parts.includes('shift'),
    key: parts[parts.length - 1]
  }
}

function isEditable(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false
  const tag = el.tagName
  if (tag === 'TEXTAREA' || tag === 'INPUT') return true
  if (el.isContentEditable) return true
  return false
}

export function useKeyboardShortcut(
  keys: string,
  action: () => void,
  options?: { enabled?: boolean }
): void {
  const enabled = options?.enabled ?? true

  useEffect(() => {
    if (!enabled) return

    const combo = parseKeys(keys)

    const handler = (e: KeyboardEvent): void => {
      if (isEditable(e.target) && !combo.mod && e.key !== 'Escape') return

      const modPressed = e.ctrlKey || e.metaKey
      if (combo.mod && !modPressed) return
      if (combo.shift && !e.shiftKey) return
      if (e.key.toLowerCase() !== combo.key.toLowerCase()) return

      e.preventDefault()
      action()
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [keys, action, enabled])
}

export function useIsMac(): boolean {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0
}
