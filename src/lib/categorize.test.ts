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

  describe('India merchants', () => {
    it('matches Swiggy inside a composite UPI description', () => {
      expect(categorize('UPI-SWIGGY INSTAMART-swiggy.instamart@icici-401234567890')).toBe('Dining')
    })

    it('matches Flipkart', () => {
      expect(categorize('FLIPKART INTERNET PVT LTD')).toBe('Shopping')
    })

    it('falls back to Payment for a generic UPI transfer with no merchant match', () => {
      expect(categorize('UPI-RAHUL SHARMA-rahul@oksbi-401234567890')).toBe('Payment')
    })

    it('matches NEFT salary credit as Income before the generic Payment/NEFT rule', () => {
      expect(categorize('NEFT CR-ACME CORP-SALARY-MAR24')).toBe('Income')
    })
  })
})
