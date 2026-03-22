import { describe, it, expect } from 'vitest'
import { DATE_REGEX } from '../../lib/constants'

describe('DATE_REGEX', () => {
  it('should match valid date format', () => {
    expect(DATE_REGEX.test('# 01-01-2024')).toBe(true)
    expect(DATE_REGEX.test('# 31-12-2024')).toBe(true)
    expect(DATE_REGEX.test('# 15-06-2023')).toBe(true)
  })

  it('should not match invalid formats', () => {
    expect(DATE_REGEX.test('01-01-2024')).toBe(false)
    expect(DATE_REGEX.test('# 1-1-2024')).toBe(false)
    expect(DATE_REGEX.test('# 01/01/2024')).toBe(false)
    expect(DATE_REGEX.test('#01-01-2024')).toBe(false)
  })

  it('should not match without trailing space', () => {
    expect(DATE_REGEX.test('# 01-01-2024extra')).toBe(false)
  })

  it('should match with optional trailing whitespace', () => {
    expect(DATE_REGEX.test('# 01-01-2024')).toBe(true)
    expect(DATE_REGEX.test('# 01-01-2024 ')).toBe(true)
    expect(DATE_REGEX.test('# 01-01-2024  ')).toBe(true)
  })

  it('should not match date without year', () => {
    expect(DATE_REGEX.test('# 01-01')).toBe(false)
  })

  it('should not match with leading content', () => {
    expect(DATE_REGEX.test('text # 01-01-2024')).toBe(false)
  })

  it('should not match with wrong separator', () => {
    expect(DATE_REGEX.test('# 01/01/2024')).toBe(false)
  })
})
