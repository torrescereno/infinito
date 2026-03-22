import { useState, useEffect, useCallback } from 'react'
import { generateId } from '@renderer/lib/id'
import type { CanvasSession, CanvasSessionRegistry } from '@renderer/types'

const REGISTRY_KEY = 'infinito-canvas-registry'
const CANVAS_PREFIX = 'infinito-canvas-'
const LEGACY_KEY = 'infinito-excalidraw'

function migrateIfNeeded(): void {
  if (localStorage.getItem(REGISTRY_KEY)) return

  const legacyData = localStorage.getItem(LEGACY_KEY)
  const defaultId = 'default'

  if (legacyData) {
    localStorage.setItem(`${CANVAS_PREFIX}${defaultId}`, legacyData)
    localStorage.removeItem(LEGACY_KEY)
  }

  const registry: CanvasSessionRegistry = {
    sessions: [{ id: defaultId, name: 'Canvas 1', createdAt: Date.now() }],
    activeSessionId: defaultId
  }
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry))
}

function loadRegistry(): CanvasSessionRegistry {
  migrateIfNeeded()
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    if (!raw) throw new Error('missing')
    return JSON.parse(raw) as CanvasSessionRegistry
  } catch {
    const fallback: CanvasSessionRegistry = {
      sessions: [{ id: 'default', name: 'Canvas 1', createdAt: Date.now() }],
      activeSessionId: 'default'
    }
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(fallback))
    return fallback
  }
}

interface UseCanvasSessionsReturn {
  sessions: CanvasSession[]
  activeSessionId: string
  setActiveSession: (id: string) => void
  createSession: () => void
  deleteSession: (id: string) => void
  renameSession: (id: string, name: string) => void
}

export function useCanvasSessions(): UseCanvasSessionsReturn {
  const [registry, setRegistry] = useState<CanvasSessionRegistry>(loadRegistry)

  useEffect(() => {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry))
  }, [registry])

  const setActiveSession = useCallback((id: string) => {
    setRegistry((prev) => ({ ...prev, activeSessionId: id }))
  }, [])

  const createSession = useCallback(() => {
    const id = generateId()
    const index = registry.sessions.length + 1
    const session: CanvasSession = {
      id,
      name: `Canvas ${index}`,
      createdAt: Date.now()
    }
    setRegistry((prev) => ({
      sessions: [...prev.sessions, session],
      activeSessionId: id
    }))
  }, [registry.sessions.length])

  const deleteSession = useCallback((id: string) => {
    setRegistry((prev) => {
      localStorage.removeItem(`${CANVAS_PREFIX}${id}`)

      if (prev.sessions.length <= 1) {
        const freshId = generateId()
        const fresh: CanvasSession = { id: freshId, name: 'Canvas', createdAt: Date.now() }
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

  return {
    sessions: registry.sessions,
    activeSessionId: registry.activeSessionId,
    setActiveSession,
    createSession,
    deleteSession,
    renameSession
  }
}
