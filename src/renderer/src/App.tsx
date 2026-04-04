import { useState, useEffect } from 'react'
import type { View } from '@renderer/types'
import { windowService } from '@renderer/services'
import { useBlocks, useSettings, useUpdate } from '@renderer/hooks'
import { cn } from '@renderer/lib/utils'
import { TitleBar } from '@renderer/components/layout'
import { UpdateNotification } from '@renderer/components/UpdateNotification'
import { BrewUpdateOverlay } from '@renderer/components/BrewUpdateOverlay'
import { DailyView } from '@renderer/sections/daily'
import { NotesView } from '@renderer/sections/notes'
import { ConfigView } from '@renderer/sections/config'
import { CanvasView } from '@renderer/sections/canvas'

export default function App(): React.JSX.Element {
  const [view, setView] = useState<View>('daily')
  const [isPinned, setIsPinned] = useState(false)
  const [version, setVersion] = useState('0.0.0')
  const [isMacOS, setIsMacOS] = useState(false)
  const [windowKind, setWindowKind] = useState<'main' | 'menubar'>('main')
  const [appMode, setAppMode] = useState<'normal' | 'menubar'>('normal')
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const isMenubarWindow = windowKind === 'menubar'
  const activeView: View = view

  const {
    blocks,
    focusedId,
    loaded,
    groupedBlocks,
    collapsedIds,
    setFocusedId,
    updateBlock,
    addBlock,
    addNewDay,
    toggleCollapse,
    deleteGroup
  } = useBlocks(reloadTrigger)

  const { settings, setFontSize, setFontFamily, setCodeTheme, setLigatures } = useSettings()
  const { updateInfo, checkForUpdates, restartNow, snoozeUpdate, brewUpgrade, dismissUpdate } =
    useUpdate()

  // Global Ctrl+P: go to daily search
  useEffect(() => {
    const handleGlobalSearch = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setView('daily')
        requestAnimationFrame(() => {
          const filterInput = document.querySelector<HTMLInputElement>('[data-search]')
          filterInput?.focus()
        })
      }
    }
    document.addEventListener('keydown', handleGlobalSearch)
    return () => document.removeEventListener('keydown', handleGlobalSearch)
  }, [])

  useEffect(() => {
    window.api
      ?.getVersion()
      .then((v) => setVersion(v))
      .catch(() => setVersion('0.0.0'))

    windowService
      .getPlatform()
      .then((platform) => {
        const isMac = platform === 'darwin'
        setIsMacOS(isMac)
        document.documentElement.classList.toggle('platform-linux', !isMac)
        if (!isMac) {
          setAppMode('normal')
          return
        }

        windowService
          .getAppMode()
          .then((mode) => setAppMode(mode))
          .catch(() => setAppMode('normal'))
      })
      .catch(() => {
        setIsMacOS(false)
        setAppMode('normal')
      })

    windowService
      .getWindowKind()
      .then((kind) => {
        setWindowKind(kind)
        if (kind === 'menubar') {
          setView('daily')
        }
      })
      .catch(() => setWindowKind('main'))

    const unsubscribeShowNotes = window.api.onShowNotes(() => {
      setView('daily')
    })

    const unsubscribeAppModeChanged = window.api.onAppModeChanged((mode) => {
      setAppMode(mode)
      if (mode === 'normal') {
        setReloadTrigger((prev) => prev + 1)
      }
      if (mode === 'menubar') {
        setView('daily')
      }
    })

    const unsubscribeReloadData = window.api.onReloadData(() => {
      setReloadTrigger((prev) => prev + 1)
    })

    return () => {
      unsubscribeShowNotes()
      unsubscribeAppModeChanged()
      unsubscribeReloadData()
    }
  }, [])

  const handleTogglePin = async (): Promise<void> => {
    const pinned = await windowService.togglePin()
    setIsPinned(pinned)
  }

  const handleAppModeChange = async (mode: 'normal' | 'menubar'): Promise<void> => {
    try {
      const nextMode = await windowService.setAppMode(mode)
      setAppMode(nextMode)
    } catch {
      setAppMode('normal')
    }
  }

  const handleSwitchToNormalMode = (): void => {
    void handleAppModeChange('normal')
  }

  const handleOpenNormalApp = async (): Promise<void> => {
    await windowService.openNormalWindow()
  }

  const showBrewOverlay = updateInfo?.brewUpdating === true && !!updateInfo.brewStep

  if (!loaded) {
    return (
      <div
        className={cn(
          'flex h-screen items-center justify-center bg-zinc-950',
          !isMacOS && 'rounded-lg overflow-hidden'
        )}
      />
    )
  }

  return (
    <>
      {showBrewOverlay && (
        <BrewUpdateOverlay step={updateInfo.brewStep} version={updateInfo.version} />
      )}
      <div
        className={cn(
          'relative flex flex-col h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800',
          !isMacOS && 'rounded-lg overflow-hidden'
        )}
        style={{ fontFamily: 'var(--app-font-family)' }}
      >
        <TitleBar
          view={activeView}
          isMacOS={isMacOS}
          isMenubarWindow={isMenubarWindow}
          isPinned={isPinned}
          onViewChange={setView}
          onTogglePin={handleTogglePin}
          onSwitchToNormalMode={handleSwitchToNormalMode}
          onOpenNormalApp={(): void => {
            void handleOpenNormalApp()
          }}
        />

        {!isMenubarWindow && (
          <UpdateNotification
            updateInfo={updateInfo}
            onRestart={restartNow}
            onSnooze={snoozeUpdate}
            onBrewUpgrade={brewUpgrade}
            onDismiss={dismissUpdate}
          />
        )}

        <main
          className={cn(
            'flex-1',
            activeView === 'canvas' || activeView === 'notes'
              ? 'overflow-hidden'
              : 'overflow-y-auto'
          )}
        >
          {!isMenubarWindow && activeView === 'canvas' ? (
            <CanvasView />
          ) : activeView === 'notes' ? (
            <NotesView />
          ) : (
            <div className="max-w-2xl mx-auto px-4 pt-5">
              {!isMenubarWindow && activeView === 'config' ? (
                <ConfigView
                  settings={settings}
                  isMacOS={isMacOS}
                  appMode={appMode}
                  onFontSize={setFontSize}
                  onFontFamily={setFontFamily}
                  onCodeTheme={setCodeTheme}
                  onLigatures={setLigatures}
                  onAppMode={handleAppModeChange}
                  onCheckUpdate={checkForUpdates}
                  updateInfo={updateInfo}
                  version={version}
                />
              ) : (
                <DailyView
                  groupedBlocks={groupedBlocks}
                  focusedId={focusedId}
                  collapsedIds={collapsedIds}
                  highlightedId={null}
                  onFocus={setFocusedId}
                  onUpdate={updateBlock}
                  onAddBlock={addBlock}
                  onAddDay={addNewDay}
                  onToggleCollapse={toggleCollapse}
                  onDeleteGroup={deleteGroup}
                  isEmpty={blocks.length === 0}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
