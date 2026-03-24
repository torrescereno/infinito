import { useState, useEffect, useCallback } from 'react'
import { generateId } from '@renderer/lib/id'
import type { NoteSession, NoteSessionRegistry } from '@renderer/types'

const REGISTRY_KEY = 'infinito-notes-registry'
const NOTE_PREFIX = 'infinito-note-'

function loadRegistry(): NoteSessionRegistry {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    if (!raw) throw new Error('missing')
    return JSON.parse(raw) as NoteSessionRegistry
  } catch {
    const fallback: NoteSessionRegistry = {
      sessions: [{ id: 'default', name: 'Note 1', createdAt: Date.now() }],
      activeSessionId: 'default'
    }
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(fallback))
    return fallback
  }
}

interface UseNoteSessionsReturn {
  sessions: NoteSession[]
  activeSessionId: string
  activeContent: string
  setActiveSession: (id: string) => void
  createSession: () => void
  deleteSession: (id: string) => void
  renameSession: (id: string, name: string) => void
  updateContent: (content: string) => void
}

export function useNoteSessions(): UseNoteSessionsReturn {
  const [registry, setRegistry] = useState<NoteSessionRegistry>(loadRegistry)
  const [content, setContent] = useState<string>(() => {
    const initial = loadRegistry()
    return localStorage.getItem(`${NOTE_PREFIX}${initial.activeSessionId}`) ?? ''
  })

  useEffect(() => {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry))
  }, [registry])

  useEffect(() => {
    const loaded = localStorage.getItem(`${NOTE_PREFIX}${registry.activeSessionId}`) ?? ''
    setContent(loaded)
  }, [registry.activeSessionId])

  const setActiveSession = useCallback((id: string) => {
    setRegistry((prev) => ({ ...prev, activeSessionId: id }))
  }, [])

  const createSession = useCallback(() => {
    const id = generateId()
    const index = registry.sessions.length + 1
    const session: NoteSession = {
      id,
      name: `Note ${index}`,
      createdAt: Date.now()
    }
    setRegistry((prev) => ({
      sessions: [...prev.sessions, session],
      activeSessionId: id
    }))
  }, [registry.sessions.length])

  const deleteSession = useCallback((id: string) => {
    setRegistry((prev) => {
      localStorage.removeItem(`${NOTE_PREFIX}${id}`)

      if (prev.sessions.length <= 1) {
        const freshId = generateId()
        const fresh: NoteSession = { id: freshId, name: 'Note', createdAt: Date.now() }
        return { sessions: [fresh], activeSessionId: freshId }
      }

      const remaining = prev.sessions.filter((s) => s.id !== id)
      return {
        sessions: remaining,
        activeSessionId: prev.activeSessionId === id ? remaining[0].id : prev.activeSessionId
      }
    })
  }, [])

  const renameSession = useCallback((id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setRegistry((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) => (s.id === id ? { ...s, name: trimmed } : s))
    }))
  }, [])

  const updateContent = useCallback(
    (newContent: string) => {
      setContent(newContent)
      localStorage.setItem(`${NOTE_PREFIX}${registry.activeSessionId}`, newContent)
    },
    [registry.activeSessionId]
  )

  return {
    sessions: registry.sessions,
    activeSessionId: registry.activeSessionId,
    activeContent: content,
    setActiveSession,
    createSession,
    deleteSession,
    renameSession,
    updateContent
  }
}
