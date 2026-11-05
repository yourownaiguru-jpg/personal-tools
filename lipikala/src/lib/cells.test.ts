import { describe, expect, it } from 'vitest'
import { buildCells } from './cells'
import { SCRIPTS } from './scripts'
import { parse } from './transliterate'

describe('buildCells', () => {
  it('produces one cell per akshara, with historic, modern, and roman columns', () => {
    const cells = buildCells(parse('Kaveri'), SCRIPTS.brahmi, SCRIPTS.Tamil)
    expect(cells).toHaveLength(3)
    expect(cells.map((c) => c.roman)).toEqual(['ka', 've', 'ri'])
    expect(cells[0].hist).toBe(cells[0].hist) // non-empty historic glyph
    expect(cells.every((c) => c.hist.length > 0 && c.modern.length > 0)).toBe(true)
  })

  it('gives whitespace its own gap cell instead of merging into a letter', () => {
    const cells = buildCells(parse('Anu Priya'), SCRIPTS.Devanagari, SCRIPTS.Devanagari)
    expect(cells.some((c) => c.roman === '' && c.border === 'none')).toBe(true)
  })

  it('folds a trailing anusvara into the preceding consonant cell (Devanagari अं) rather than giving it one of its own', () => {
    const toks = parse('अं')
    const cells = buildCells(toks, SCRIPTS.Devanagari, SCRIPTS.Tamil)
    expect(cells).toHaveLength(1)
    expect(cells[0].roman).toBe('aṁ')
  })
})
