import { motion, AnimatePresence } from 'motion/react'
import type { BrewStep } from '@renderer/types'

interface BrewUpdateOverlayProps {
  step: BrewStep | undefined
  version: string | undefined
}

const STEP_CONFIG: Record<BrewStep, { label: string; description: string }> = {
  preparing: {
    label: 'Preparing update',
    description: 'Getting everything ready...'
  },
  'updating-brew': {
    label: 'Updating Homebrew',
    description: 'Syncing formulae and casks...'
  },
  downloading: {
    label: 'Downloading update',
    description: 'Fetching the latest version...'
  },
  installing: {
    label: 'Installing update',
    description: 'Applying the new version...'
  },
  restarting: {
    label: 'Restarting',
    description: 'Relaunching Infinito...'
  }
}

const STEP_ORDER: BrewStep[] = [
  'preparing',
  'updating-brew',
  'downloading',
  'installing',
  'restarting'
]

export function BrewUpdateOverlay({ step, version }: BrewUpdateOverlayProps): React.JSX.Element {
  const config = step ? STEP_CONFIG[step] : STEP_CONFIG.preparing
  const currentIndex = step ? STEP_ORDER.indexOf(step) : 0
  const totalSteps = STEP_ORDER.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-8 max-w-xs w-full">
        <div className="relative flex items-center justify-center">
          <motion.div
            className="h-16 w-16 rounded-full border-[3px] border-zinc-700 border-t-zinc-50"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute flex items-center justify-center">
            <svg
              className="h-6 w-6 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <AnimatePresence mode="wait">
            <motion.h2
              key={config.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium text-zinc-100"
            >
              {config.label}
            </motion.h2>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={config.description}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="text-xs text-zinc-500"
            >
              {config.description}
            </motion.p>
          </AnimatePresence>

          {version && <span className="text-[10px] text-zinc-600 font-mono mt-1">v{version}</span>}
        </div>

        <div
          className="flex gap-1.5"
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
        >
          {STEP_ORDER.map((s, i) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-500 ${
                i <= currentIndex ? 'w-6 bg-zinc-300' : 'w-3 bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
