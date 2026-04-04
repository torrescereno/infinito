import { useState, useRef, useCallback, useEffect } from 'react'

const SCROLL_AMOUNT = 120

export function useScrollableTabs(): {
  scrollRef: React.RefObject<HTMLDivElement | null>
  canScrollLeft: boolean
  canScrollRight: boolean
  scrollLeft: () => void
  scrollRight: () => void
  scrollToEnd: () => void
  scrollToTab: (id: string) => void
} {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    updateScrollState()

    const ro = new ResizeObserver(() => updateScrollState())
    ro.observe(el)

    el.addEventListener('scroll', updateScrollState, { passive: true })

    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', updateScrollState)
    }
  }, [updateScrollState])

  const scrollLeft = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' })
  }, [])

  const scrollRight = useCallback(() => {
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })
  }, [])

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = scrollRef.current
        if (!el) return
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
      }, 30)
    })
  }, [])

  const scrollToTab = useCallback((id: string) => {
    const el = scrollRef.current
    if (!el) return
    const tab = el.querySelector<HTMLElement>(`[data-tab-id="${id}"]`)
    if (tab) {
      requestAnimationFrame(() => {
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
      })
    }
  }, [])

  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
    scrollToEnd,
    scrollToTab
  }
}
