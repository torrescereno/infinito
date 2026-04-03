import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useUpdate } from '../../hooks/useUpdate'
import type { UpdateInfo } from '../../types'

describe('useUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with null updateInfo', () => {
    const { result } = renderHook(() => useUpdate())
    expect(result.current.updateInfo).toBeNull()
  })

  it('should check for updates', async () => {
    const { result } = renderHook(() => useUpdate())

    await act(async () => {
      await result.current.checkForUpdates()
    })

    expect(window.api.update.check).toHaveBeenCalledOnce()
  })

  it('should restart', async () => {
    const { result } = renderHook(() => useUpdate())

    await act(async () => {
      await result.current.restartNow()
    })

    expect(window.api.update.restart).toHaveBeenCalledOnce()
  })

  it('should snooze', async () => {
    const { result } = renderHook(() => useUpdate())

    await act(async () => {
      await result.current.snoozeUpdate()
    })

    expect(window.api.update.snooze).toHaveBeenCalledOnce()
    expect(result.current.updateInfo).toBeNull()
  })

  it('should brew upgrade', async () => {
    const { result } = renderHook(() => useUpdate())

    await act(async () => {
      await result.current.brewUpgrade()
    })

    expect(window.api.update.brewUpgrade).toHaveBeenCalledOnce()
  })

  it('should dismiss update', () => {
    const { result } = renderHook(() => useUpdate())

    act(() => {
      result.current.dismissUpdate()
    })

    expect(result.current.updateInfo).toBeNull()
  })

  it('should receive update status via onStatus', async () => {
    let statusCallback: ((status: Record<string, unknown>) => void) | null = null
    vi.mocked(window.api.update.onStatus).mockImplementation((cb) => {
      statusCallback = cb
      return () => {}
    })

    const { result } = renderHook(() => useUpdate())

    const mockStatus = {
      available: true,
      version: '2.0.0',
      priority: 'normal',
      brewUpdate: true
    }

    await act(async () => {
      statusCallback!(mockStatus as Record<string, unknown>)
    })

    expect(result.current.updateInfo).toEqual(mockStatus)
  })

  it('should receive brew update status with step', async () => {
    let statusCallback: ((status: Record<string, unknown>) => void) | null = null
    vi.mocked(window.api.update.onStatus).mockImplementation((cb) => {
      statusCallback = cb
      return () => {}
    })

    const { result } = renderHook(() => useUpdate())

    const mockStatus = {
      available: true,
      version: '2.0.0',
      priority: 'normal',
      brewUpdate: true,
      brewUpdating: true,
      brewStep: 'updating-brew'
    }

    await act(async () => {
      statusCallback!(mockStatus as Record<string, unknown>)
    })

    expect(result.current.updateInfo?.brewUpdating).toBe(true)
    expect(result.current.updateInfo?.brewStep).toBe('updating-brew')
  })

  it('should set updateInfo from getStatus when available', async () => {
    const mockStatus: UpdateInfo = {
      available: true,
      version: '1.5.0',
      priority: 'security'
    }
    vi.mocked(window.api.update.getStatus).mockResolvedValue(mockStatus)

    const { result } = renderHook(() => useUpdate())

    await waitFor(() => {
      expect(result.current.updateInfo).toEqual(mockStatus)
    })
  })

  it('should not set updateInfo from getStatus when not available', async () => {
    vi.mocked(window.api.update.getStatus).mockResolvedValue({ available: false })

    const { result } = renderHook(() => useUpdate())

    await waitFor(() => {
      expect(window.api.update.getStatus).toHaveBeenCalled()
    })

    expect(result.current.updateInfo).toBeNull()
  })

  it('should unsubscribe from onStatus on unmount', () => {
    const mockUnsubscribe = vi.fn()
    vi.mocked(window.api.update.onStatus).mockReturnValue(mockUnsubscribe)

    const { unmount } = renderHook(() => useUpdate())

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalledOnce()
  })
})
