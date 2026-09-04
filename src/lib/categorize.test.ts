import { describe, expect, it } from 'vitest'
import { categorize } from './categorize'

describe('categorize', () => {
  it('matches groceries', () => {
    expect(categorize('TRADER JOE S #123')).toBe('Groceries')
  })

  it('matches dining regardless of case', () => {
    expect(categorize('STARBUCKS store 456')).toBe('Dining')
  })

  it('falls back to Uncategorized when nothing matches', () => {
    expect(categorize('SOME RANDOM MERCHANT XYZ')).toBe('Uncategorized')
  })

  it('respects rule order for overlapping keywords', () => {
    const rules = [
      { category: 'A', keywords: ['shop'] },
      { category: 'B', keywords: ['coffee shop'] },
    ]
    expect(categorize('coffee shop downtown', rules)).toBe('A')
  })
})
