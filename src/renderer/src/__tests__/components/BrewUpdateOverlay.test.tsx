import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrewUpdateOverlay } from '../../components/BrewUpdateOverlay'
import type { BrewStep } from '../../types'

describe('BrewUpdateOverlay', () => {
  const stepLabels: Record<BrewStep, string> = {
    preparing: 'Preparing update',
    'updating-brew': 'Updating Homebrew',
    downloading: 'Downloading update',
    installing: 'Installing update',
    restarting: 'Restarting'
  }

  it('should render with preparing step by default', () => {
    render(<BrewUpdateOverlay step={undefined} version={undefined} />)

    expect(screen.getByText('Preparing update')).toBeInTheDocument()
    expect(screen.getByText('Getting everything ready...')).toBeInTheDocument()
  })

  it('should render all steps correctly', () => {
    const steps: BrewStep[] = [
      'preparing',
      'updating-brew',
      'downloading',
      'installing',
      'restarting'
    ]

    for (const step of steps) {
      const { unmount } = render(<BrewUpdateOverlay step={step} version="2.0.0" />)

      expect(screen.getByText(stepLabels[step])).toBeInTheDocument()
      expect(screen.getByText('v2.0.0')).toBeInTheDocument()

      unmount()
    }
  })

  it('should show version when provided', () => {
    render(<BrewUpdateOverlay step="downloading" version="1.5.0" />)

    expect(screen.getByText('v1.5.0')).toBeInTheDocument()
  })

  it('should not show version when undefined', () => {
    render(<BrewUpdateOverlay step="downloading" version={undefined} />)

    expect(screen.queryByText(/v\d/)).not.toBeInTheDocument()
  })

  it('should render progress dots', () => {
    render(<BrewUpdateOverlay step="downloading" version="1.0.0" />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toBeInTheDocument()
    expect(progressbar).toHaveAttribute('aria-valuenow', '3')
    expect(progressbar).toHaveAttribute('aria-valuemin', '1')
    expect(progressbar).toHaveAttribute('aria-valuemax', '5')
  })

  it('should render correct progress for each step', () => {
    const stepIndexMap: Record<BrewStep, number> = {
      preparing: 1,
      'updating-brew': 2,
      downloading: 3,
      installing: 4,
      restarting: 5
    }

    for (const [step, expectedIndex] of Object.entries(stepIndexMap)) {
      const { unmount } = render(<BrewUpdateOverlay step={step as BrewStep} version="1.0.0" />)

      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', String(expectedIndex))

      unmount()
    }
  })

  it('should render cloud download icon', () => {
    const { container } = render(<BrewUpdateOverlay step="preparing" version={undefined} />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should render as fixed overlay covering viewport', () => {
    const { container } = render(<BrewUpdateOverlay step="preparing" version={undefined} />)

    const overlay = container.firstElementChild as HTMLElement
    expect(overlay.className).toContain('fixed')
    expect(overlay.className).toContain('inset-0')
    expect(overlay.className).toContain('z-50')
  })

  it('should render spinning element', () => {
    const { container } = render(<BrewUpdateOverlay step="preparing" version={undefined} />)

    const spinner = container.querySelector('[class*="rounded-full"]')
    expect(spinner).toBeInTheDocument()
  })
})
