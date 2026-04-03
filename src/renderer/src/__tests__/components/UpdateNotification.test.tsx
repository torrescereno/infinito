import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UpdateNotification } from '../../components/UpdateNotification'
import type { UpdateInfo } from '../../types'

describe('UpdateNotification', () => {
  const defaultProps = {
    onRestart: vi.fn(),
    onSnooze: vi.fn(),
    onBrewUpgrade: vi.fn(),
    onDismiss: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when updateInfo is null', () => {
    const { container } = render(<UpdateNotification updateInfo={null} {...defaultProps} />)

    expect(container.innerHTML).toBe('')
  })

  it('should not render when updateInfo is not available', () => {
    const { container } = render(
      <UpdateNotification updateInfo={{ available: false }} {...defaultProps} />
    )

    expect(container.innerHTML).toBe('')
  })

  it('should render normal update banner', () => {
    const info: UpdateInfo = {
      available: true,
      version: '1.5.0',
      priority: 'normal',
      progress: 0,
      downloaded: false
    }

    render(<UpdateNotification updateInfo={info} {...defaultProps} />)

    expect(screen.getByText('Update available')).toBeInTheDocument()
    expect(screen.getByText(/v1\.5\.0/)).toBeInTheDocument()
    expect(screen.getByText('Skip')).toBeInTheDocument()
  })

  it('should render security update banner', () => {
    const info: UpdateInfo = {
      available: true,
      version: '1.5.0',
      priority: 'security',
      progress: 0,
      downloaded: false
    }

    render(<UpdateNotification updateInfo={info} {...defaultProps} />)

    expect(screen.getByText('Security update')).toBeInTheDocument()
    expect(screen.getByText('Later')).toBeInTheDocument()
  })

  it('should render critical update banner with countdown', () => {
    vi.useFakeTimers()

    const info: UpdateInfo = {
      available: true,
      version: '2.0.0',
      priority: 'critical',
      progress: 50,
      downloaded: false
    }

    render(<UpdateNotification updateInfo={info} {...defaultProps} />)

    expect(screen.getByText('Critical update')).toBeInTheDocument()
    expect(screen.getByText('5 min')).toBeInTheDocument()
    expect(screen.getByText(/Downloading\.\.\./)).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('should render restart button when downloaded', () => {
    const info: UpdateInfo = {
      available: true,
      version: '1.5.0',
      priority: 'normal',
      progress: 100,
      downloaded: true
    }

    render(<UpdateNotification updateInfo={info} {...defaultProps} />)

    expect(screen.getByText('Restart')).toBeInTheDocument()
  })

  it('should show download progress', () => {
    const info: UpdateInfo = {
      available: true,
      version: '1.5.0',
      priority: 'normal',
      progress: 45,
      downloaded: false
    }

    render(<UpdateNotification updateInfo={info} {...defaultProps} />)

    expect(screen.getByText('Downloading... 45%')).toBeInTheDocument()
  })

  it('should call onDismiss when skip clicked', () => {
    const info: UpdateInfo = {
      available: true,
      version: '1.5.0',
      priority: 'normal',
      downloaded: false
    }

    render(<UpdateNotification updateInfo={info} {...defaultProps} />)

    fireEvent.click(screen.getByText('Skip'))
    expect(defaultProps.onDismiss).toHaveBeenCalledOnce()
  })

  it('should call onRestart when restart clicked', () => {
    const info: UpdateInfo = {
      available: true,
      version: '1.5.0',
      priority: 'normal',
      progress: 100,
      downloaded: true
    }

    render(<UpdateNotification updateInfo={info} {...defaultProps} />)

    fireEvent.click(screen.getByText('Restart'))
    expect(defaultProps.onRestart).toHaveBeenCalledOnce()
  })

  describe('BrewUpdateBanner', () => {
    it('should render brew update banner', () => {
      const info: UpdateInfo = {
        available: true,
        version: '1.5.0',
        priority: 'normal',
        brewUpdate: true
      }

      render(<UpdateNotification updateInfo={info} {...defaultProps} />)

      expect(screen.getByText('Update available')).toBeInTheDocument()
      expect(screen.getByText('Skip')).toBeInTheDocument()
      expect(screen.getByText('Update')).toBeInTheDocument()
    })

    it('should show updating state with spinner', () => {
      const info: UpdateInfo = {
        available: true,
        version: '1.5.0',
        priority: 'normal',
        brewUpdate: true,
        brewUpdating: true,
        brewStep: 'updating-brew'
      }

      render(<UpdateNotification updateInfo={info} {...defaultProps} />)

      expect(screen.getByText('Updating...')).toBeInTheDocument()
      expect(screen.queryByText('Skip')).not.toBeInTheDocument()
      expect(screen.queryByText('Update')).not.toBeInTheDocument()
    })

    it('should show brew error', () => {
      const info: UpdateInfo = {
        available: true,
        version: '1.5.0',
        priority: 'normal',
        brewUpdate: true,
        brewUpdating: false,
        brewError: 'Brew not found'
      }

      render(<UpdateNotification updateInfo={info} {...defaultProps} />)

      expect(screen.getByText('Brew not found')).toBeInTheDocument()
    })

    it('should call onBrewUpgrade when update clicked', () => {
      const info: UpdateInfo = {
        available: true,
        version: '1.5.0',
        priority: 'normal',
        brewUpdate: true
      }

      render(<UpdateNotification updateInfo={info} {...defaultProps} />)

      fireEvent.click(screen.getByText('Update'))
      expect(defaultProps.onBrewUpgrade).toHaveBeenCalledOnce()
    })

    it('should render with critical priority colors', () => {
      const info: UpdateInfo = {
        available: true,
        version: '1.5.0',
        priority: 'critical',
        brewUpdate: true
      }

      render(<UpdateNotification updateInfo={info} {...defaultProps} />)

      expect(screen.getByText('Update available')).toBeInTheDocument()
    })

    it('should render with security priority colors', () => {
      const info: UpdateInfo = {
        available: true,
        version: '1.5.0',
        priority: 'security',
        brewUpdate: true
      }

      render(<UpdateNotification updateInfo={info} {...defaultProps} />)

      expect(screen.getByText('Update available')).toBeInTheDocument()
    })
  })
})
