import { describe, it, expect } from 'vitest'
import { generateId } from '../../lib/id'

describe('generateId', () => {
  it('should generate an id with timestamp and random string', () => {
    const id = generateId()
    expect(id).toMatch(/^\d+-[a-z0-9]+$/)
  })

  it('should generate unique ids', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generateId())
    }
    expect(ids.size).toBe(100)
  })

  it('should have correct format with two parts', () => {
    const id = generateId()
    const parts = id.split('-')
    expect(parts).toHaveLength(2)
    expect(parts[0]).toMatch(/^\d+$/)
    expect(parts[1]).toMatch(/^[a-z0-9]+$/)
    expect(parts[1].length).toBeLessThanOrEqual(6)
    expect(parts[1].length).toBeGreaterThanOrEqual(1)
  })
})
