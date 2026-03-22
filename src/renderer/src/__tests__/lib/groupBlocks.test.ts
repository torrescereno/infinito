import { describe, it, expect } from 'vitest'
import { consolidateBlocks, groupBlocksByDate } from '../../lib/groupBlocks'
import type { Block } from '../../types'

describe('consolidateBlocks', () => {
  it('should return empty array for empty input', () => {
    expect(consolidateBlocks([])).toEqual([])
  })

  it('should keep date blocks unchanged', () => {
    const blocks: Block[] = [
      { id: '1', content: '# 01-01-2024' },
      { id: '2', content: '# 02-01-2024' }
    ]
    expect(consolidateBlocks(blocks)).toEqual(blocks)
  })

  it('should consolidate consecutive non-date blocks', () => {
    const blocks: Block[] = [
      { id: '1', content: 'line 1' },
      { id: '2', content: 'line 2' },
      { id: '3', content: 'line 3' }
    ]
    const result = consolidateBlocks(blocks)
    expect(result).toHaveLength(1)
    expect(result[0].content).toBe('line 1\nline 2\nline 3')
  })

  it('should handle mixed date and content blocks', () => {
    const blocks: Block[] = [
      { id: '1', content: '# 01-01-2024' },
      { id: '2', content: 'content 1' },
      { id: '3', content: 'content 2' },
      { id: '4', content: '# 02-01-2024' },
      { id: '5', content: 'content 3' }
    ]
    const result = consolidateBlocks(blocks)
    expect(result).toHaveLength(4)
    expect(result[0].content).toBe('# 01-01-2024')
    expect(result[1].content).toBe('content 1\ncontent 2')
    expect(result[2].content).toBe('# 02-01-2024')
    expect(result[3].content).toBe('content 3')
  })

  it('should preserve date blocks between content', () => {
    const blocks: Block[] = [
      { id: '1', content: '# 01-01-2024' },
      { id: '2', content: 'content' },
      { id: '3', content: '# 02-01-2024' }
    ]
    expect(consolidateBlocks(blocks)).toEqual(blocks)
  })

  it('should handle empty content blocks', () => {
    const blocks: Block[] = [
      { id: '1', content: '' },
      { id: '2', content: 'content' }
    ]
    const result = consolidateBlocks(blocks)
    expect(result).toHaveLength(1)
    expect(result[0].content).toBe('content')
  })

  it('should handle leading content before date', () => {
    const blocks: Block[] = [
      { id: '1', content: 'intro content' },
      { id: '2', content: '# 01-01-2024' }
    ]
    const result = consolidateBlocks(blocks)
    expect(result).toHaveLength(2)
    expect(result[0].content).toBe('intro content')
    expect(result[1].content).toBe('# 01-01-2024')
  })
})

describe('groupBlocksByDate', () => {
  it('should return empty array for empty input', () => {
    expect(groupBlocksByDate([])).toEqual([])
  })

  it('should group date block with following content', () => {
    const blocks: Block[] = [
      { id: '1', content: '# 01-01-2024' },
      { id: '2', content: 'content' }
    ]
    const result = groupBlocksByDate(blocks)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      dateBlock: { id: '1', content: '# 01-01-2024' },
      contentBlock: { id: '2', content: 'content' }
    })
  })

  it('should handle content without date', () => {
    const blocks: Block[] = [{ id: '1', content: 'orphan content' }]
    const result = groupBlocksByDate(blocks)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      dateBlock: null,
      contentBlock: { id: '1', content: 'orphan content' }
    })
  })

  it('should handle date without content', () => {
    const blocks: Block[] = [{ id: '1', content: '# 01-01-2024' }]
    const result = groupBlocksByDate(blocks)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      dateBlock: { id: '1', content: '# 01-01-2024' },
      contentBlock: null
    })
  })

  it('should handle multiple date-content pairs', () => {
    const blocks: Block[] = [
      { id: '1', content: '# 01-01-2024' },
      { id: '2', content: 'content 1' },
      { id: '3', content: '# 02-01-2024' },
      { id: '4', content: 'content 2' }
    ]
    const result = groupBlocksByDate(blocks)
    expect(result).toHaveLength(2)
    expect(result[0].dateBlock?.id).toBe('1')
    expect(result[0].contentBlock?.id).toBe('2')
    expect(result[1].dateBlock?.id).toBe('3')
    expect(result[1].contentBlock?.id).toBe('4')
  })

  it('should handle interspersed orphan content', () => {
    const blocks: Block[] = [
      { id: '1', content: '# 01-01-2024' },
      { id: '2', content: 'content 1' },
      { id: '3', content: 'orphan' },
      { id: '4', content: '# 02-01-2024' }
    ]
    const result = groupBlocksByDate(blocks)
    expect(result).toHaveLength(3)
    expect(result[0].contentBlock?.id).toBe('2')
    expect(result[1].dateBlock).toBeNull()
    expect(result[1].contentBlock?.id).toBe('3')
  })
})
