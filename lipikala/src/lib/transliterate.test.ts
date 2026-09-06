import { describe, expect, it } from 'vitest'
import { SCRIPTS } from './scripts'
import { parse, render, roman } from './transliterate'

describe('parse + render: roman input', () => {
  it('splits "Kaveri" into three aksharas: ka, ve, ri', () => {
    const toks = parse('Kaveri')
    expect(toks).toEqual([
      { t: 'C', c: 'k', v: 'a' },
      { t: 'C', c: 'v', v: 'e' },
      { t: 'C', c: 'r', v: 'i' },
    ])
  })

  it('reads a doubled vowel as long: "Raam" -> rā, then a bare consonant with no trailing vowel', () => {
    const toks = parse('Raam')
    expect(toks).toEqual([
      { t: 'C', c: 'r', v: 'A' },
      { t: 'C', c: 'm', v: null },
    ])
  })

  it('a name ending in a bare consonant gets a vowel-killer; the same name plus a trailing "a" does not (Ram vs Rama)', () => {
    // The app's own "How faithful is this?" note: "Ram" ends silent, "Rama" is the classical form.
    expect(render(parse('Ram'), SCRIPTS.Devanagari)).toBe('रम्')
    expect(render(parse('Rama'), SCRIPTS.Devanagari)).toBe('रम')
  })

  it('parses common consonant digraphs (kh, gh, sh)', () => {
    expect(parse('Khushi')[0]).toEqual({ t: 'C', c: 'kh', v: 'u' })
    expect(parse('Ghosh')[0]).toEqual({ t: 'C', c: 'gh', v: 'o' })
    expect(parse('Shanti')[0]).toEqual({ t: 'C', c: 'sh', v: 'a' })
  })

  it('parses "x" as a two-consonant cluster (k+s), vowel landing on whatever follows', () => {
    const toks = parse('Laxmi')
    expect(toks).toEqual([
      { t: 'C', c: 'l', v: 'a' },
      { t: 'C', c: 'k', v: null },
      { t: 'C', c: 's', v: null },
      { t: 'C', c: 'm', v: 'i' },
    ])
  })

  it('passes through punctuation untouched', () => {
    const toks = parse('Anu-Priya')
    expect(toks.some((t) => t.t === 'X' && t.s === '-')).toBe(true)
  })
})

describe('parse: native-script input', () => {
  it('reads Devanagari "राम" (rā + ma) the same as roman "Raama"', () => {
    expect(parse('राम')).toEqual(parse('Raama'))
  })

  it('reads Tamil "காவேரி" into three consonant+vowel aksharas', () => {
    const toks = parse('காவேரி')
    expect(toks).toHaveLength(3)
    expect(toks[0]).toEqual({ t: 'C', c: 'k', v: 'A' })
  })

  it('round-trips Devanagari text through render unchanged', () => {
    const original = 'राम'
    expect(render(parse(original), SCRIPTS.Devanagari)).toBe(original)
  })
})

describe('render: historic scripts', () => {
  it('renders "Kaveri" into real Brahmi code points (U+11000 block), not a Devanagari font trick', () => {
    const out = render(parse('Kaveri'), SCRIPTS.brahmi)
    expect(out.length).toBeGreaterThan(0)
    for (const ch of out) {
      const cp = ch.codePointAt(0)!
      expect(cp).toBeGreaterThanOrEqual(0x11000)
      expect(cp).toBeLessThanOrEqual(0x1107f)
    }
  })

  it('renders into every historic script without throwing, producing non-Latin output', () => {
    const toks = parse('Kaveri')
    for (const id of ['brahmi', 'grantha', 'siddham', 'sharada', 'bhaiksuki', 'nandinagari'] as const) {
      const out = render(toks, SCRIPTS[id])
      expect(out.length).toBeGreaterThan(0)
      expect(Array.from(out).every((ch) => (ch.codePointAt(0) ?? 0) > 0x7f)).toBe(true)
    }
  })

  it('falls back short e -> long E when a script has no short vowel (Brahmi and kin only have 14 vowels)', () => {
    expect(SCRIPTS.brahmi.indep.e).toBeUndefined()
    expect(render([{ t: 'V', v: 'e' }], SCRIPTS.brahmi)).toBe(SCRIPTS.brahmi.indep.E)
  })
})

describe('render: modern scripts respect their OMIT lists', () => {
  it('Tamil has no aspirated/voiced consonants — "Khamala" renders identically to "Kamala"', () => {
    expect(render(parse('Khamala'), SCRIPTS.Tamil)).toBe(render(parse('Kamala'), SCRIPTS.Tamil))
  })

  it('every modern script table has a virama and the five plain vowels', () => {
    for (const id of ['Devanagari', 'Bengali', 'Gujarati', 'Oriya', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'] as const) {
      const S = SCRIPTS[id]
      expect(S.virama.length).toBe(1)
      for (const v of ['a', 'A', 'i', 'I', 'u', 'U']) expect(S.indep[v]).toBeTruthy()
    }
  })
})

describe('roman()', () => {
  it('romanizes a consonant+long-vowel token with a macron', () => {
    expect(roman({ t: 'C', c: 'r', v: 'A' })).toBe('rā')
  })
  it('romanizes anusvara and visarga', () => {
    expect(roman({ t: 'M' })).toBe('ṁ')
    expect(roman({ t: 'H' })).toBe('ḥ')
  })
})
