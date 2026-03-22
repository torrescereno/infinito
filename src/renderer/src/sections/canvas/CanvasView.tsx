import { useState, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import type { AppState } from '@excalidraw/excalidraw/types'
import { useCanvasSessions } from '@renderer/hooks'
import { CanvasSessionBar } from './CanvasSessionBar'

const CANVAS_PREFIX = 'infinito-canvas-'
const DEBOUNCE_MS = 300

interface PersistedData {
  elements: ExcalidrawElement[]
  appState: Partial<AppState>
}

function loadSessionData(sessionId: string): PersistedData | null {
  try {
    const raw = localStorage.getItem(`${CANVAS_PREFIX}${sessionId}`)
    if (!raw) return null
    return JSON.parse(raw) as PersistedData
  } catch {
    return null
  }
}

function CanvasExcalidraw({ sessionId }: { sessionId: string }): React.JSX.Element {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [initial] = useState(() => loadSessionData(sessionId))

  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: AppState) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        localStorage.setItem(
          `${CANVAS_PREFIX}${sessionId}`,
          JSON.stringify({
            elements,
            appState: {
              theme: appState.theme,
              viewBackgroundColor: appState.viewBackgroundColor,
              zoom: appState.zoom,
              scrollX: appState.scrollX,
              scrollY: appState.scrollY
            }
          })
        )
      }, DEBOUNCE_MS)
    },
    [sessionId]
  )

  return (
    <div className="flex-1 excalidraw-wrapper">
      <Excalidraw
        initialData={
          initial
            ? {
                elements: initial.elements,
                appState: {
                  ...initial.appState,
                  theme: 'dark'
                }
              }
            : {
                appState: { theme: 'dark' }
              }
        }
        onChange={handleChange}
        theme="dark"
        UIOptions={{
          canvasActions: {
            export: false,
            saveAsImage: false,
            loadScene: false
          }
        }}
      />
    </div>
  )
}

export function CanvasView(): React.JSX.Element {
  const { sessions, activeSessionId, setActiveSession, createSession, deleteSession, renameSession } =
    useCanvasSessions()

  return (
    <motion.div
      key="canvas"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col h-full"
    >
      <CanvasSessionBar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={setActiveSession}
        onCreate={createSession}
        onDelete={deleteSession}
        onRename={renameSession}
      />
      <CanvasExcalidraw key={activeSessionId} sessionId={activeSessionId} />
    </motion.div>
  )
}
