import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@renderer/components/ui/button'
import type { UpdateInfo } from '@renderer/types'

interface UpdateNotificationProps {
  updateInfo: UpdateInfo | null
  onRestart: () => void
  onSnooze: () => void
  onBrewUpgrade: () => void
  onDismiss: () => void
}

export function UpdateNotification({
  updateInfo,
  onRestart,
  onSnooze,
  onBrewUpgrade,
  onDismiss
}: UpdateNotificationProps): React.JSX.Element {
  const [countdown, setCountdown] = useState(300)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountdown(300)
  }, [updateInfo])

  useEffect(() => {
    if (!updateInfo?.available || updateInfo.priority !== 'critical' || updateInfo.brewUpdate)
      return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onRestart()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return (): void => {
      clearInterval(timer)
    }
  }, [updateInfo, onRestart])

  const isVisible = updateInfo?.available === true

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="no-drag overflow-hidden px-3 pt-2"
        >
          <BannerContent
            updateInfo={updateInfo}
            countdown={countdown}
            onRestart={onRestart}
            onSnooze={onSnooze}
            onBrewUpgrade={onBrewUpgrade}
            onDismiss={onDismiss}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface BannerContentProps {
  updateInfo: UpdateInfo
  countdown: number
  onRestart: () => void
  onSnooze: () => void
  onBrewUpgrade: () => void
  onDismiss: () => void
}

function BannerContent({
  updateInfo,
  countdown,
  onRestart,
  onSnooze,
  onBrewUpgrade,
  onDismiss
}: BannerContentProps): React.JSX.Element {
  const isCritical = updateInfo.priority === 'critical'
  const isSecurity = updateInfo.priority === 'security'

  if (updateInfo.brewUpdate) {
    return (
      <BrewUpdateBanner
        updateInfo={updateInfo}
        isCritical={isCritical}
        isSecurity={isSecurity}
        onBrewUpgrade={onBrewUpgrade}
        onDismiss={onDismiss}
      />
    )
  }

  const isDownloaded = updateInfo.downloaded === true
  const isDownloading = !isDownloaded && (updateInfo.progress ?? 0) > 0
  const progress = updateInfo.progress ?? 0

  if (isCritical) {
    const minutes = Math.floor(countdown / 60)
    const seconds = countdown % 60

    return (
      <div className="flex flex-col gap-1.5 rounded-lg bg-red-950/90 backdrop-blur-md border border-red-900/30 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <svg
            className="h-3.5 w-3.5 shrink-0 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="flex-1 text-[11px] font-medium text-red-200">Critical update</span>
          <span className="rounded-full bg-red-900/60 px-2 py-0.5 font-mono text-[10px] font-bold text-red-300">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>

        <div className="flex gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSnooze}
            className="flex-1 h-6 rounded-sm text-red-400/60 hover:text-red-300 text-[11px]"
          >
            5 min
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRestart}
            disabled={!isDownloaded}
            className="flex-1 h-6 rounded-sm bg-red-900/50 text-red-200 hover:bg-red-900/70 text-[11px]"
          >
            {isDownloaded ? 'Restart' : `Downloading... ${progress}%`}
          </Button>
        </div>
      </div>
    )
  }

  if (isSecurity) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-orange-950/90 backdrop-blur-md border border-orange-900/30 px-3 py-2 text-[11px]">
        <svg
          className="h-3.5 w-3.5 shrink-0 text-orange-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>

        <span className="flex-1 text-orange-200">
          Security update
          {updateInfo.version && <span className="text-orange-400/60"> v{updateInfo.version}</span>}
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 rounded-sm text-orange-400/50 hover:text-orange-300 text-[11px]"
        >
          Later
        </Button>
        {isDownloaded ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRestart}
            className="h-6 rounded-sm bg-orange-900/50 text-orange-200 hover:bg-orange-900/70 text-[11px]"
          >
            Restart
          </Button>
        ) : isDownloading ? (
          <span className="text-[11px] text-orange-400/60 font-mono">
            Downloading... {progress}%
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-zinc-900/90 backdrop-blur-md border border-zinc-800/50 px-3 py-2 text-[11px]">
      <svg
        className="h-3.5 w-3.5 shrink-0 text-zinc-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
        />
      </svg>

      <span className="flex-1 text-zinc-300">
        Update available
        {updateInfo.version && <span className="text-zinc-500"> v{updateInfo.version}</span>}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        className="h-6 text-zinc-600 hover:text-zinc-400 text-[11px] rounded-sm"
      >
        Skip
      </Button>
      {isDownloaded ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRestart}
          className="h-6 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-[11px] rounded-sm"
        >
          Restart
        </Button>
      ) : isDownloading ? (
        <span className="text-[11px] text-zinc-500 font-mono">Downloading... {progress}%</span>
      ) : null}
    </div>
  )
}

interface BrewUpdateBannerProps {
  updateInfo: UpdateInfo
  isCritical: boolean
  isSecurity: boolean
  onBrewUpgrade: () => void
  onDismiss: () => void
}

function BrewUpdateBanner({
  updateInfo,
  isCritical,
  isSecurity,
  onBrewUpgrade,
  onDismiss
}: BrewUpdateBannerProps): React.JSX.Element {
  const isUpdating = updateInfo.brewUpdating === true
  const hasError = !!updateInfo.brewError

  const bg = isCritical
    ? 'bg-red-950/90 border-red-900/30'
    : isSecurity
      ? 'bg-orange-950/90 border-orange-900/30'
      : 'bg-zinc-900/90 border-zinc-800/50'
  const textColor = isCritical ? 'text-red-200' : isSecurity ? 'text-orange-200' : 'text-zinc-300'
  const versionColor = isCritical
    ? 'text-red-400/60'
    : isSecurity
      ? 'text-orange-400/60'
      : 'text-zinc-500'
  const skipBtnColor = isCritical
    ? 'text-red-400/60 hover:text-red-300'
    : isSecurity
      ? 'text-orange-400/50 hover:text-orange-300'
      : 'text-zinc-600 hover:text-zinc-400'
  const updateBtnColor = isCritical
    ? 'bg-red-900/50 text-red-200 hover:bg-red-900/70'
    : isSecurity
      ? 'bg-orange-900/50 text-orange-200 hover:bg-orange-900/70'
      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
  const iconColor = isCritical ? 'text-red-400' : isSecurity ? 'text-orange-400' : 'text-zinc-400'
  const errorColor = isCritical
    ? 'text-red-400/60'
    : isSecurity
      ? 'text-orange-400/60'
      : 'text-zinc-500'
  const spinnerColor = isCritical
    ? 'border-red-400/30 border-t-red-300'
    : isSecurity
      ? 'border-orange-400/30 border-t-orange-300'
      : 'border-zinc-600 border-t-zinc-300'

  const iconPath = isCritical
    ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    : isSecurity
      ? 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
      : 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10'

  return (
    <div className={`flex flex-col gap-1 rounded-lg backdrop-blur-md border ${bg} px-3 py-2`}>
      <div className="flex items-center gap-2">
        <svg
          className={`h-3.5 w-3.5 shrink-0 ${iconColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
        </svg>

        <span className={`flex-1 text-[11px] ${textColor}`}>
          {isUpdating ? 'Updating...' : 'Update available'}
          {!isUpdating && updateInfo.version && (
            <span className={versionColor}> v{updateInfo.version}</span>
          )}
        </span>

        {isUpdating ? (
          <div
            className={`h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 ${spinnerColor}`}
          />
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className={`h-6 rounded-sm ${skipBtnColor} text-[11px]`}
            >
              Skip
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBrewUpgrade}
              className={`h-6 rounded-sm ${updateBtnColor} text-[11px]`}
            >
              Update
            </Button>
          </>
        )}
      </div>

      {hasError && (
        <span className={`${errorColor} text-[10px] pl-5.5`}>{updateInfo.brewError}</span>
      )}
    </div>
  )
}
