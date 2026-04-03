import '@testing-library/jest-dom/vitest'
import { vi, afterEach } from 'vitest'

// Polyfill localStorage for Node.js 25+ (native localStorage lacks methods without --localstorage-file)
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = String(value)
    },
    removeItem: (key: string): void => {
      delete store[key]
    },
    clear: (): void => {
      store = {}
    },
    get length(): number {
      return Object.keys(store).length
    },
    key: (index: number): string | null => Object.keys(store)[index] ?? null
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true
})

// Mock Electron main process modules
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/mock/app/path'),
    on: vi.fn(),
    whenReady: vi.fn(() => Promise.resolve())
  },
  BrowserWindow: vi.fn(),
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn()
  },
  shell: {
    openExternal: vi.fn()
  }
}))

// Mock Better-sqlite3
vi.mock('better-sqlite3', () => {
  const mockDatabase = {
    prepare: vi.fn(() => ({
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn()
    })),
    exec: vi.fn(),
    close: vi.fn()
  }

  return {
    default: vi.fn(() => mockDatabase)
  }
})

// API mock for renderer
const apiMock = {
  getBlocks: vi.fn(() => Promise.resolve([])),
  saveBlocks: vi.fn(() => Promise.resolve()),
  togglePin: vi.fn(() => Promise.resolve(false)),
  closeWindow: vi.fn(),
  minimizeWindow: vi.fn(),
  maximizeWindow: vi.fn(() => Promise.resolve(false)),
  isMaximized: vi.fn(() => Promise.resolve(false)),
  getVersion: vi.fn(() => Promise.resolve('0.0.0')),
  getPlatform: vi.fn(() => Promise.resolve('darwin')),
  getWindowKind: vi.fn(() => Promise.resolve('main')),
  getAppMode: vi.fn(() => Promise.resolve('normal')),
  setAppMode: vi.fn(() => Promise.resolve('normal')),
  openNormalWindow: vi.fn(() => Promise.resolve(true)),
  openExternal: vi.fn(() => Promise.resolve(true)),
  onShowNotes: vi.fn(() => () => undefined),
  onAppModeChanged: vi.fn(() => () => undefined),
  onFlushPendingSaves: vi.fn(() => () => undefined),
  update: {
    check: vi.fn(() => Promise.resolve(true)),
    getStatus: vi.fn(() => Promise.resolve({ available: false })),
    restart: vi.fn(() => Promise.resolve(true)),
    snooze: vi.fn(() => Promise.resolve(true)),
    brewUpgrade: vi.fn(() => Promise.resolve(true)),
    onStatus: vi.fn(() => () => undefined)
  }
}

Object.defineProperty(window, 'api', { value: apiMock })

export { apiMock }

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})
