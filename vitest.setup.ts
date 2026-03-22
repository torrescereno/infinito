import '@testing-library/jest-dom/vitest'
import { vi, afterEach } from 'vitest'

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
  isMaximized: vi.fn(() => Promise.resolve(false))
}

Object.defineProperty(window, 'api', { value: apiMock })

export { apiMock }

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})
