import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoResize } from '../../hooks/useAutoResize'

describe('useAutoResize', () => {
  it('should return a function', () => {
    const { result } = renderHook(() => useAutoResize())
    expect(typeof result.current).toBe('function')
  })

  it('should set height based on scrollHeight', () => {
    const { result } = renderHook(() => useAutoResize())

    const mockElement = {
      style: { height: '' },
      scrollHeight: 100
    } as unknown as HTMLTextAreaElement

    act(() => {
      result.current(mockElement)
    })

    expect(mockElement.style.height).toBe('100px')
  })

  it('should reset height to auto before setting scrollHeight', () => {
    const { result } = renderHook(() => useAutoResize())

    const mockElement = {
      style: { height: '200px' },
      scrollHeight: 150
    } as unknown as HTMLTextAreaElement

    act(() => {
      result.current(mockElement)
    })

    expect(mockElement.style.height).toBe('150px')
  })
})
