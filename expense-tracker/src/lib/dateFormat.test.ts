import { describe, expect, it } from 'vitest'
import { guessDateFormat } from './dateFormat'

describe('guessDateFormat', () => {
  it('detects day-first from an unambiguous date (day > 12)', () => {
    expect(guessDateFormat([['25/03/2024 SOME TXN 100.00']])).toBe('DMY')
  })

  it('detects month-first from an unambiguous date (month position > 12 rules out day-first)', () => {
    expect(guessDateFormat([['03/25/2024 SOME TXN 100.00']])).toBe('MDY')
  })

  it('falls back to India hints (₹, UPI, IFSC) when every date is ambiguous', () => {
    expect(guessDateFormat([['05/03/2024 UPI-SWIGGY ₹450.00']])).toBe('DMY')
  })

  it('defaults to month-first with no evidence either way', () => {
    expect(guessDateFormat([['05/03/2024 STARBUCKS 4.50']])).toBe('MDY')
  })

  it('prefers unambiguous date evidence over hints when both are present', () => {
    // A statement period line with day 31 proves day-first even though
    // individual transaction dates elsewhere are ambiguous.
    expect(
      guessDateFormat([['Statement Period: 01/03/2024 - 31/03/2024', '05/03/2024 UPI TXN 10.00']]),
    ).toBe('DMY')
  })
})
