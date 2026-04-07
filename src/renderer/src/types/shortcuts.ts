export interface ShortcutDef {
  id: string
  label: string
  keys: string
  group: string
}

export const SHORTCUT_GROUPS = ['Navigation', 'Notes', 'Canvas', 'Daily'] as const
export type ShortcutGroup = (typeof SHORTCUT_GROUPS)[number]

export const SHORTCUTS: ShortcutDef[] = [
  { id: 'nav-daily', label: 'Go to Daily', keys: 'mod+1', group: 'Navigation' },
  { id: 'nav-notes', label: 'Go to Notes', keys: 'mod+2', group: 'Navigation' },
  { id: 'nav-canvas', label: 'Go to Canvas', keys: 'mod+3', group: 'Navigation' },
  { id: 'nav-config', label: 'Go to Config', keys: 'mod+4', group: 'Navigation' },
  { id: 'nav-search', label: 'Search', keys: 'mod+p', group: 'Navigation' },

  { id: 'notes-toggle-mode', label: 'Toggle Edit / Preview', keys: 'mod+e', group: 'Notes' },
  { id: 'notes-new', label: 'New Note', keys: 'mod+n', group: 'Notes' },
  { id: 'notes-close', label: 'Close Tab', keys: 'mod+w', group: 'Notes' },

  { id: 'canvas-new', label: 'New Canvas', keys: 'mod+n', group: 'Canvas' },
  { id: 'canvas-close', label: 'Close Tab', keys: 'mod+w', group: 'Canvas' },

  { id: 'daily-new-block', label: 'New Block', keys: 'mod+shift+e', group: 'Daily' }
]

export function formatShortcutKeys(keys: string, isMac: boolean): string {
  const parts = keys.split('+')
  const hasMod = parts.includes('mod')
  const hasShift = parts.includes('shift')
  const key = parts[parts.length - 1]

  const keyMap: Record<string, string> = {
    tab: 'Tab',
    enter: 'Enter',
    escape: 'Esc'
  }
  const displayKey = keyMap[key] ?? key.toUpperCase()

  if (isMac) {
    const result: string[] = []
    if (hasShift) result.push('⇧')
    if (hasMod) result.push('⌘')
    result.push(displayKey)
    return result.join(' ')
  }

  const result: string[] = []
  if (hasMod) result.push('Ctrl')
  if (hasShift) result.push('Shift')
  result.push(displayKey)
  return result.join('+')
}
