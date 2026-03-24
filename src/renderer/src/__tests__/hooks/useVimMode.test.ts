import { describe, it, expect } from 'vitest'
import type { DateGroup } from '../../types'

// Extract and test the pure utility functions from useVimMode
// We re-implement them here since they're not exported, to test the logic

function getVisibleBlockIds(groups: DateGroup[], collapsedIds: Set<string>): string[] {
  const ids: string[] = []
  for (const group of groups) {
    if (group.dateBlock) {
      ids.push(group.dateBlock.id)
      if (!collapsedIds.has(group.dateBlock.id) && group.contentBlock) {
        ids.push(group.contentBlock.id)
      }
    } else if (group.contentBlock) {
      ids.push(group.contentBlock.id)
    }
  }
  return ids
}

function isEditableElement(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  if (tag === 'textarea' || tag === 'input') return true
  if ((el as HTMLElement).isContentEditable) return true
  return false
}

describe('getVisibleBlockIds', () => {
  it('should return empty array for empty groups', () => {
    expect(getVisibleBlockIds([], new Set())).toEqual([])
  })

  it('should return all block ids when nothing is collapsed', () => {
    const groups: DateGroup[] = [
      {
        dateBlock: { id: 'date-1', content: '# 2026-03-24' },
        contentBlock: { id: 'content-1', content: 'some text' }
      },
      {
        dateBlock: { id: 'date-2', content: '# 2026-03-23' },
        contentBlock: { id: 'content-2', content: 'more text' }
      }
    ]

    const result = getVisibleBlockIds(groups, new Set())
    expect(result).toEqual(['date-1', 'content-1', 'date-2', 'content-2'])
  })

  it('should skip content blocks of collapsed date groups', () => {
    const groups: DateGroup[] = [
      {
        dateBlock: { id: 'date-1', content: '# 2026-03-24' },
        contentBlock: { id: 'content-1', content: 'some text' }
      },
      {
        dateBlock: { id: 'date-2', content: '# 2026-03-23' },
        contentBlock: { id: 'content-2', content: 'more text' }
      }
    ]

    const collapsed = new Set(['date-1'])
    const result = getVisibleBlockIds(groups, collapsed)
    expect(result).toEqual(['date-1', 'date-2', 'content-2'])
  })

  it('should include standalone content blocks without date blocks', () => {
    const groups: DateGroup[] = [
      {
        dateBlock: null,
        contentBlock: { id: 'orphan-1', content: 'orphan block' }
      },
      {
        dateBlock: { id: 'date-1', content: '# 2026-03-24' },
        contentBlock: { id: 'content-1', content: 'some text' }
      }
    ]

    const result = getVisibleBlockIds(groups, new Set())
    expect(result).toEqual(['orphan-1', 'date-1', 'content-1'])
  })

  it('should handle groups with date block but no content block', () => {
    const groups: DateGroup[] = [
      {
        dateBlock: { id: 'date-1', content: '# 2026-03-24' },
        contentBlock: null
      }
    ]

    const result = getVisibleBlockIds(groups, new Set())
    expect(result).toEqual(['date-1'])
  })

  it('should handle all collapsed groups', () => {
    const groups: DateGroup[] = [
      {
        dateBlock: { id: 'date-1', content: '# 2026-03-24' },
        contentBlock: { id: 'content-1', content: 'text' }
      },
      {
        dateBlock: { id: 'date-2', content: '# 2026-03-23' },
        contentBlock: { id: 'content-2', content: 'text' }
      }
    ]

    const collapsed = new Set(['date-1', 'date-2'])
    const result = getVisibleBlockIds(groups, collapsed)
    expect(result).toEqual(['date-1', 'date-2'])
  })
})

describe('isEditableElement', () => {
  it('should return false for null', () => {
    expect(isEditableElement(null)).toBe(false)
  })

  it('should return true for textarea elements', () => {
    const textarea = document.createElement('textarea')
    expect(isEditableElement(textarea)).toBe(true)
  })

  it('should return true for input elements', () => {
    const input = document.createElement('input')
    expect(isEditableElement(input)).toBe(true)
  })

  // Note: isContentEditable is not supported in jsdom, skipping contenteditable test

  it('should return false for regular div elements', () => {
    const div = document.createElement('div')
    expect(isEditableElement(div)).toBe(false)
  })

  it('should return false for button elements', () => {
    const button = document.createElement('button')
    expect(isEditableElement(button)).toBe(false)
  })

  it('should return false for span elements', () => {
    const span = document.createElement('span')
    expect(isEditableElement(span)).toBe(false)
  })
})
