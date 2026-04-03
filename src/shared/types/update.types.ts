export type UpdatePriority = 'normal' | 'security' | 'critical'

export type BrewStep = 'preparing' | 'updating-brew' | 'downloading' | 'installing' | 'restarting'

export interface UpdateMetadata {
  version: string
  priority: UpdatePriority
  message?: string
  forceRestart?: boolean
  releaseDate?: string
}

export interface UpdateInfo {
  available: boolean
  version?: string
  priority?: UpdatePriority
  message?: string
  progress?: number
  downloaded?: boolean
  brewUpdate?: boolean
  brewUpdating?: boolean
  brewStep?: BrewStep
  brewError?: string
}

export interface PendingUpdate {
  version: string
  priority: UpdatePriority
  message?: string
}
