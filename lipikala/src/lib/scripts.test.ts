import { describe, expect, it } from 'vitest'
import { FONT, SCRIPT_LABEL, SCRIPTS } from './scripts'

// Spot-checks against the published Unicode block assignments, so a typo in
// a base offset fails loudly here rather than silently mis-rendering glyphs.
describe('historic script Unicode blocks', () => {
  it('Brahmi: independent A is U+11005, consonant KA is U+11013', () => {
    expect(SCRIPTS.brahmi.indep.a.codePointAt(0)).toBe(0x11005)
    expect(SCRIPTS.brahmi.cons.k.codePointAt(0)).toBe(0x11013)
    expect(SCRIPTS.brahmi.virama.codePointAt(0)).toBe(0x11046)
  })

  it('Grantha: independent A is U+11305, consonant KA is U+11315', () => {
    expect(SCRIPTS.grantha.indep.a.codePointAt(0)).toBe(0x11305)
    expect(SCRIPTS.grantha.cons.k.codePointAt(0)).toBe(0x11315)
  })

  it('Siddham: independent A is U+11580, consonant KA is U+1158E', () => {
    expect(SCRIPTS.siddham.indep.a.codePointAt(0)).toBe(0x11580)
    expect(SCRIPTS.siddham.cons.k.codePointAt(0)).toBe(0x1158e)
  })

  it('Sharada: independent A is U+11183', () => {
    expect(SCRIPTS.sharada.indep.a.codePointAt(0)).toBe(0x11183)
  })

  it('Bhaiksuki: independent A is U+11C00', () => {
    expect(SCRIPTS.bhaiksuki.indep.a.codePointAt(0)).toBe(0x11c00)
  })

  it('Nandinagari: independent A is U+119A0', () => {
    expect(SCRIPTS.nandinagari.indep.a.codePointAt(0)).toBe(0x119a0)
  })
})

describe('modern (ISCII-pattern) script Unicode blocks', () => {
  it('Devanagari block starts at U+0900, so अ (independent a) is U+0905', () => {
    expect(SCRIPTS.Devanagari.indep.a.codePointAt(0)).toBe(0x0905)
    expect(SCRIPTS.Devanagari.cons.k.codePointAt(0)).toBe(0x0915)
  })

  it('Tamil block starts at U+0B80, so அ is U+0B85', () => {
    expect(SCRIPTS.Tamil.indep.a.codePointAt(0)).toBe(0x0b85)
  })

  it('Malayalam block starts at U+0D00, so അ is U+0D05', () => {
    expect(SCRIPTS.Malayalam.indep.a.codePointAt(0)).toBe(0x0d05)
  })
})

describe('OMIT lists actually remove letters from the table', () => {
  it('Tamil has no "kh", "g", or aspirate/voiced stops', () => {
    expect(SCRIPTS.Tamil.cons.kh).toBeUndefined()
    expect(SCRIPTS.Tamil.cons.g).toBeUndefined()
    expect(SCRIPTS.Tamil.cons.bh).toBeUndefined()
  })

  it('Devanagari has no short e/o (only long)', () => {
    expect(SCRIPTS.Devanagari.indep.e).toBeUndefined()
    expect(SCRIPTS.Devanagari.indep.E).toBeTruthy()
  })
})

describe('FONT and SCRIPT_LABEL cover every script key', () => {
  it('every SCRIPTS key has a font and a label', () => {
    for (const id of Object.keys(SCRIPTS) as (keyof typeof SCRIPTS)[]) {
      expect(FONT[id]).toBeTruthy()
      expect(SCRIPT_LABEL[id]).toBeTruthy()
    }
  })
})
