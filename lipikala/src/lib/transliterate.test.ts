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

  it('reads "ae"/"ao" as long ஏ/ஓ, distinct from short e/o and from "ee"/"oo" (long i/u)', () => {
    expect(parse('vae')).toEqual([{ t: 'C', c: 'v', v: 'E' }])
    expect(parse('vao')).toEqual([{ t: 'C', c: 'v', v: 'O' }])
    expect(parse('ve')).toEqual([{ t: 'C', c: 'v', v: 'e' }])
    expect(parse('vee')).toEqual([{ t: 'C', c: 'v', v: 'I' }])
  })

  it('renders long ஏ/ஓ distinctly from short எ/ஒ in Tamil, unlike Devanagari which only has the long one', () => {
    expect(render(parse('vae'), SCRIPTS.Tamil)).not.toBe(render(parse('ve'), SCRIPTS.Tamil))
    expect(render(parse('vae'), SCRIPTS.Devanagari)).toBe(render(parse('ve'), SCRIPTS.Devanagari))
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

describe('parse: historic-script input (reading an inscription back)', () => {
  it('round-trips real Brahmi text through render unchanged', () => {
    const original = render(parse('Kaveri'), SCRIPTS.brahmi)
    expect(render(parse(original), SCRIPTS.brahmi)).toBe(original)
  })

  it('reads Brahmi text into the same tokens as the roman spelling that produced it', () => {
    expect(parse(render(parse('Divya'), SCRIPTS.brahmi))).toEqual(parse('Divya'))
  })

  it('re-sets a Brahmi inscription into modern Tamil', () => {
    const brahmiText = render(parse('Divya'), SCRIPTS.brahmi)
    expect(render(parse(brahmiText), SCRIPTS.Tamil)).toBe(render(parse('Divya'), SCRIPTS.Tamil))
  })

  it('short e/o survives a full round trip through Tamil-Brahmi, unlike plain Brahmi', () => {
    const tamilBrahmiText = render(parse('Kaveri'), SCRIPTS.tamilBrahmi)
    expect(parse(tamilBrahmiText)).toEqual(parse('Kaveri'))
  })

  it('reads either LLA glyph tradition (Northern vs Old Tamil) back as the same phoneme', () => {
    const northern = String.fromCodePoint(0x11034)
    const oldTamil = String.fromCodePoint(0x11075)
    expect(parse(northern)).toEqual(parse(oldTamil))
    expect(parse(northern)).toEqual([{ t: 'C', c: 'll', v: 'a' }])
  })

  it('reads the Old Tamil puḷḷi (0x11070) as a vowel-canceler, same as the Northern virama', () => {
    const kaWithNorthernVirama = SCRIPTS.brahmi.cons.k + String.fromCodePoint(0x11046)
    const kaWithPulli = SCRIPTS.brahmi.cons.k + String.fromCodePoint(0x11070)
    expect(parse(kaWithNorthernVirama)).toEqual(parse(kaWithPulli))
    expect(parse(kaWithPulli)).toEqual([{ t: 'C', c: 'k', v: null }])
  })

  it('round-trips Grantha and Siddham text through render unchanged', () => {
    for (const id of ['grantha', 'siddham', 'sharada', 'bhaiksuki', 'nandinagari'] as const) {
      const original = render(parse('Kaveri'), SCRIPTS[id])
      expect(render(parse(original), SCRIPTS[id])).toBe(original)
    }
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

  it('Tamil-Brahmi keeps short e/o distinct via the dedicated Old Tamil code points, unlike plain Brahmi', () => {
    expect(render([{ t: 'V', v: 'e' }], SCRIPTS.tamilBrahmi)).toBe(String.fromCodePoint(0x11071))
    expect(render([{ t: 'V', v: 'o' }], SCRIPTS.tamilBrahmi)).toBe(String.fromCodePoint(0x11072))
    expect(render([{ t: 'V', v: 'e' }], SCRIPTS.tamilBrahmi)).not.toBe(SCRIPTS.tamilBrahmi.indep.E)
  })

  it('Tamil-Brahmi cancels a vowel with its own puḷḷi, not the Northern Brahmi virama', () => {
    expect(SCRIPTS.tamilBrahmi.virama).toBe(String.fromCodePoint(0x11070))
    expect(SCRIPTS.tamilBrahmi.virama).not.toBe(SCRIPTS.brahmi.virama)
  })

  it('Tamil-Brahmi ḷ uses the Tamil-original LLA, not the Northern Brahmi LLA', () => {
    expect(SCRIPTS.tamilBrahmi.cons.ll).toBe(String.fromCodePoint(0x11075))
    expect(SCRIPTS.tamilBrahmi.cons.ll).not.toBe(SCRIPTS.brahmi.cons.ll)
  })
})

describe('render: Malayalam chillu letters', () => {
  it('renders a word-final chillu-eligible consonant as its own atomic glyph, not consonant+virama', () => {
    const out = render(parse('Amal'), SCRIPTS.Malayalam)
    expect(out.endsWith(SCRIPTS.Malayalam.chillu!.l)).toBe(true)
    expect(out.endsWith(SCRIPTS.Malayalam.cons.l + SCRIPTS.Malayalam.virama)).toBe(false)
  })

  it('does not chillu-ize a dead consonant still forming a cluster with the next consonant', () => {
    const out = render(parse('Kanth'), SCRIPTS.Malayalam)
    expect(out).toContain(SCRIPTS.Malayalam.cons.n + SCRIPTS.Malayalam.virama)
    expect(out).not.toContain(SCRIPTS.Malayalam.chillu!.n)
  })

  it('round-trips a chillu letter back to the same bare consonant token', () => {
    const chilluText = render(parse('Amal'), SCRIPTS.Malayalam)
    expect(parse(chilluText)).toEqual(parse('Amal'))
  })
})

describe('render: scripts added for Marathi, Punjabi, Maithili, Kashmiri, Tulu, Assamese, Sylheti, Manipuri', () => {
  const u = (...cps: number[]) => String.fromCodePoint(...cps)

  it('sets "Shivaji" in real Modi code points (U+11600 block) with vowel signs, not a Devanagari font trick', () => {
    expect(render(parse('Shivaji'), SCRIPTS.modi)).toBe(u(0x1162b, 0x11631, 0x1162a, 0x11615, 0x11631))
  })

  it('Gurmukhi writes no halant at the end of a word, and one only under a subjoined r/h/v', () => {
    expect(render(parse('Ram'), SCRIPTS.Gurmukhi)).toBe('ਰਮ')
    expect(render(parse('Harpreet'), SCRIPTS.Gurmukhi)).toBe('ਹਰਪ੍ਰੀਤ')
    expect(render(parse('Gurpreet Kaur'), SCRIPTS.Gurmukhi)).toBe('ਗੁਰਪ੍ਰੀਤ ਕੌਰ')
    // ਕ੍ਰਿ + the precomposed ਸ਼ (U+0A36) + ਨ
    expect(render(parse('Krishna'), SCRIPTS.Gurmukhi)).toBe('ਕ੍ਰਿ' + u(0x0a36) + 'ਨ')
  })

  it('reads native Gurmukhi back, with tippi as anusvara and ੜ as its own letter', () => {
    expect(parse('ਸਿੰਘ')).toEqual([{ t: 'C', c: 's', v: 'i' }, { t: 'M' }, { t: 'C', c: 'gh', v: 'a' }])
    // The bare ਰ and final ਤ carry no mark for their dropped vowels (Gurmukhi
    // writes no halant there), so they read back as "ra" and "ta".
    expect(parse('ਹਰਪ੍ਰੀਤ')).toEqual(parse('Harapreeta'))
    expect(parse('ੜ')).toEqual([{ t: 'C', c: 'rr', v: 'a' }])
    expect(render(parse('ੜ'), SCRIPTS.Gurmukhi)).toBe('ੜ')
  })

  it('Assamese uses its own ৰ but keeps Bengali ব for v, and reads both ৰ and ৱ on input', () => {
    expect(render(parse('Rahul'), SCRIPTS.Assamese)).toBe('ৰহুল্')
    expect(render(parse('Vivek'), SCRIPTS.Assamese)).toBe(render(parse('Vivek'), SCRIPTS.Bengali))
    expect(parse('ৰাহুল')).toEqual(parse('Raahula'))
    expect(parse('ৱ')).toEqual([{ t: 'C', c: 'v', v: 'a' }])
  })

  it('Tirhuta keeps a short e distinct from long ē (Maithili has both); Kaithi, Modi and Takri merge them', () => {
    expect(render(parse('ve'), SCRIPTS.tirhuta)).not.toBe(render(parse('vae'), SCRIPTS.tirhuta))
    for (const id of ['kaithi', 'modi', 'takri'] as const) {
      expect(render(parse('ve'), SCRIPTS[id])).toBe(render(parse('vae'), SCRIPTS[id]))
    }
  })

  it('Mahajani has no vowel signs and no virama: a vowel after a consonant is the independent letter, clusters are bare', () => {
    // k r i s n — no killer between k and r, the i is the I letter itself.
    expect(render(parse('Krishna'), SCRIPTS.mahajani)).toBe(u(0x11155, 0x1116d, 0x11151, 0x11170, 0x11167))
    expect(SCRIPTS.mahajani.virama).toBe('')
    expect(SCRIPTS.mahajani.sign.A).toBe(SCRIPTS.mahajani.indep.a)
  })

  it('Meitei Mayek writes a syllable-final consonant with its lonsum letter even mid-word, and keeps the killer for true clusters', () => {
    // la · m-lonsum · phe · l-lonsum
    expect(render(parse('Lamphel'), SCRIPTS.meeteiMayek)).toBe(u(0xabc2, 0xabdd, 0xabd0, 0xabe6, 0xabdc))
    // Final r has no lonsum form and is written bare, not with the killer.
    expect(render(parse('Manipur'), SCRIPTS.meeteiMayek)).toBe(u(0xabc3, 0xabc5, 0xabe4, 0xabc4, 0xabe8, 0xabd4))
    // k + apun iyek + r: a real cluster.
    expect(render(parse('Krishna'), SCRIPTS.meeteiMayek).startsWith(u(0xabc0, 0xabed, 0xabd4))).toBe(true)
    // Lonsum letters read back as the same dead consonant, so the name round-trips
    // (a name with only a-vowels: Meitei Mayek has one letter each for i/ī and
    // e/ē, so those read back long, as in Brahmi).
    expect(parse(render(parse('Lampak'), SCRIPTS.meeteiMayek))).toEqual(parse('Lampak'))
  })

  it('Syloti Nagri spells ā as the a-letter plus its sign, and its single code points read back', () => {
    expect(render([{ t: 'V', v: 'A' }], SCRIPTS.sylotiNagri)).toBe(u(0xa800, 0xa823))
    expect(render(parse('Kaveri'), SCRIPTS.sylotiNagri)).toBe(u(0xa807, 0xa81b, 0xa826, 0xa81e, 0xa824))
    expect(parse(u(0xa807))).toEqual([{ t: 'C', c: 'k', v: 'a' }])
    // The two-code-point ā must not shadow the plain a-letter in the reverse map.
    expect(parse(u(0xa800))).toEqual([{ t: 'V', v: 'a' }])
  })

  it('every new historic script round-trips a name through parse and render', () => {
    for (const id of ['modi', 'takri', 'mahajani', 'tirhuta', 'kaithi', 'sylotiNagri', 'meeteiMayek'] as const) {
      const original = render(parse('Divya'), SCRIPTS[id])
      expect(original.length).toBeGreaterThan(0)
      expect(render(parse(original), SCRIPTS[id])).toBe(original)
    }
    for (const id of ['modi', 'tirhuta'] as const) expect(parse(render(parse('Divya'), SCRIPTS[id]))).toEqual(parse('Divya'))
  })
})

describe('render: modern scripts respect their OMIT lists', () => {
  it('Tamil has no aspirated/voiced consonants — "Khamala" renders identically to "Kamala"', () => {
    expect(render(parse('Khamala'), SCRIPTS.Tamil)).toBe(render(parse('Kamala'), SCRIPTS.Tamil))
  })

  it('every modern script table has a virama and the five plain vowels', () => {
    for (const id of ['Devanagari', 'Bengali', 'Assamese', 'Gujarati', 'Oriya', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Gurmukhi'] as const) {
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
