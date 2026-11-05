import type { ScriptId, ScriptTable } from './types'

// ---------------------------------------------------------------------------
// Per-script letter tables, keyed by an internal phonemic code shared across
// every script in this file (see transliterate.ts for how text is parsed
// into that code). Each Brahmic script in Unicode — ancient or modern —
// assigns independent vowels, consonants, and vowel signs in the same
// relative order (a documented Unicode design choice for interoperability
// across the family), so every table below is built the same way: a base
// code point plus an offset list, with `null` marking a letter the script
// never had (e.g. most historic scripts have no short e/o).
// ---------------------------------------------------------------------------

const cp = (n: number) => String.fromCodePoint(n)

/** Assigns `base + i` to `map[keys[i]]` for each non-null key. */
function seq(map: Record<string, string>, base: number, keys: (string | null)[]): Record<string, string> {
  keys.forEach((k, i) => {
    if (k) map[k] = cp(base + i)
  })
  return map
}

// The 33 standard Sanskrit consonants, in traditional varga order.
const STD33 = [
  'k', 'kh', 'g', 'gh', 'ng', 'c', 'ch', 'j', 'jh', 'ny',
  'T', 'Th', 'D', 'Dh', 'N', 't', 'th', 'd', 'dh', 'n',
  'p', 'ph', 'b', 'bh', 'm', 'y', 'r', 'l', 'v', 'sh', 'ss', 's', 'h',
]

// Independent vowel order shared by the historic scripts below (a ā i ī u ū
// r̥ r̥̄ l̥ l̥̄ e ai o au — no short e/o, which only the modern South Indian
// scripts distinguish).
const V14 = ['a', 'A', 'i', 'I', 'u', 'U', 'R', 'RR', 'L', 'LL', 'E', 'ai', 'O', 'au']

// ISCII-style modern scripts: independent vowels, consonants, and vowel
// signs each have their own canonical order (short/long, then e/ai/o/au
// pairs) because Unicode gave every modern Indic block the same layout.
const ISC_V = ['a', 'A', 'i', 'I', 'u', 'U', 'R', 'L', 'Ec', 'e', 'E', 'ai', 'Oc', 'o', 'O', 'au']
const ISC_S = ['A', 'i', 'I', 'u', 'U', 'R', 'RR', 'Ec', 'e', 'E', 'ai', 'Oc', 'o', 'O', 'au']
const ISC_C = [
  'k', 'kh', 'g', 'gh', 'ng', 'c', 'ch', 'j', 'jh', 'ny',
  'T', 'Th', 'D', 'Dh', 'N', 't', 'th', 'd', 'dh', 'n', 'nn',
  'p', 'ph', 'b', 'bh', 'm', 'y', 'r', 'rr', 'l', 'll', 'zh', 'v', 'sh', 'ss', 's', 'h',
]

// Base code point of each modern script's Unicode block.
const BLOCKS: Partial<Record<ScriptId, number>> = {
  Devanagari: 0x0900,
  Bengali: 0x0980,
  Gujarati: 0x0a80,
  Oriya: 0x0b00,
  Tamil: 0x0b80,
  Telugu: 0x0c00,
  Kannada: 0x0c80,
  Malayalam: 0x0d00,
  Gurmukhi: 0x0a00,
}

// Letters a given modern script's block reserves space for but the language
// doesn't actually use (e.g. Tamil has no voiced/aspirate consonants).
const OMIT: Partial<Record<ScriptId, string[]>> = {
  Tamil: ['kh', 'g', 'gh', 'ch', 'jh', 'Th', 'D', 'Dh', 'th', 'd', 'dh', 'ph', 'b', 'bh', 'R', 'L', 'RR', 'LL', 'Ec', 'Oc', 'M', 'H'],
  Malayalam: ['Ec', 'Oc', 'nn'],
  Kannada: ['Ec', 'Oc', 'nn', 'zh'],
  Telugu: ['Ec', 'Oc', 'nn', 'zh'],
  Devanagari: ['e', 'o', 'Ec', 'Oc', 'nn', 'rr', 'zh'],
  Bengali: ['e', 'o', 'Ec', 'Oc', 'nn', 'rr', 'zh', 'll', 'v'],
  Gujarati: ['e', 'o', 'Ec', 'Oc', 'nn', 'rr', 'zh'],
  Oriya: ['e', 'o', 'Ec', 'Oc', 'nn', 'rr', 'zh'],
  // Gurmukhi dropped the vocalic vowels and ṣ; its ṛ (ੜ) sits outside the
  // main run and is added back below.
  Gurmukhi: ['e', 'o', 'Ec', 'Oc', 'R', 'L', 'RR', 'LL', 'nn', 'rr', 'zh', 'ss'],
}

export const FONT: Record<ScriptId, string> = {
  brahmi: 'Noto Sans Brahmi',
  tamilBrahmi: 'Noto Sans Brahmi',
  grantha: 'Noto Sans Grantha',
  siddham: 'Noto Sans Siddham',
  sharada: 'Noto Sans Sharada',
  bhaiksuki: 'Noto Sans Bhaiksuki',
  nandinagari: 'Noto Sans Nandinagari',
  modi: 'Noto Sans Modi',
  takri: 'Noto Sans Takri',
  mahajani: 'Noto Sans Mahajani',
  tirhuta: 'Noto Sans Tirhuta',
  kaithi: 'Noto Sans Kaithi',
  sylotiNagri: 'Noto Sans Syloti Nagri',
  meeteiMayek: 'Noto Sans Meetei Mayek',
  Tamil: 'Noto Serif Tamil',
  Kannada: 'Noto Serif Kannada',
  Telugu: 'Noto Serif Telugu',
  Malayalam: 'Noto Serif Malayalam',
  Devanagari: 'Noto Serif Devanagari',
  Bengali: 'Noto Serif Bengali',
  Assamese: 'Noto Serif Bengali',
  Gujarati: 'Noto Serif Gujarati',
  Oriya: 'Noto Sans Oriya',
  Gurmukhi: 'Noto Serif Gurmukhi',
}

export const SCRIPT_LABEL: Record<ScriptId, string> = {
  brahmi: 'Brahmi script',
  tamilBrahmi: 'Brahmi script',
  grantha: 'Grantha script',
  siddham: 'Siddhaṃ script',
  sharada: 'Śāradā script',
  bhaiksuki: 'Bhaiksuki script',
  nandinagari: 'Nandinagari script',
  modi: 'Modi script',
  takri: 'Takri script',
  mahajani: 'Mahajani script',
  tirhuta: 'Tirhuta script',
  kaithi: 'Kaithi script',
  sylotiNagri: 'Syloti Nagri script',
  meeteiMayek: 'Meitei Mayek script',
  Tamil: 'Tamil letters',
  Kannada: 'Kannada letters',
  Telugu: 'Telugu letters',
  Malayalam: 'Malayalam letters',
  Devanagari: 'Nāgarī letters',
  Bengali: 'Bengali letters',
  Assamese: 'Assamese letters',
  Gujarati: 'Gujarati letters',
  Oriya: 'Odia letters',
  Gurmukhi: 'Gurmukhi letters',
}

/** Builds a modern (ISCII-pattern) script's table from its block base. */
function mkIscii(name: ScriptId): ScriptTable {
  const b = BLOCKS[name]
  if (b === undefined) throw new Error(`no block registered for ${name}`)
  const S: ScriptTable = {
    indep: seq({}, b + 5, ISC_V),
    cons: seq({}, b + 0x15, ISC_C),
    sign: seq({}, b + 0x3e, ISC_S),
    virama: cp(b + 0x4d),
    M: cp(b + 2),
    H: cp(b + 3),
    font: FONT[name],
  }
  // Vocalic RR/LL and their signs sit outside the main run in every ISCII block.
  S.indep.RR = cp(b + 0x60)
  S.indep.LL = cp(b + 0x61)
  S.sign.L = cp(b + 0x62)
  S.sign.LL = cp(b + 0x63)
  for (const k of OMIT[name] ?? []) {
    delete S.indep[k]
    delete S.cons[k]
    delete S.sign[k]
    if (k === 'M') S.M = undefined
    if (k === 'H') S.H = undefined
  }
  return S
}

// Brahmi (U+11000-U+1107F) — the ancestor of every Indic script, used from
// Ashoka's edicts (3rd c. BCE) into the early centuries CE.
const BRAHMI: ScriptTable = {
  indep: seq({}, 0x11005, V14),
  cons: seq({}, 0x11013, [...STD33, 'll', 'zh', 'rr', 'nn']),
  sign: seq({}, 0x11038, ['A', null, 'i', 'I', 'u', 'U', 'R', 'RR', 'L', 'LL', 'E', 'ai', 'O', 'au']),
  virama: cp(0x11046),
  M: cp(0x11001),
  H: cp(0x11002),
  font: FONT.brahmi,
}

// Tamil-Brahmi — the same Brahmi block, but Old Tamil scribes independently
// developed a puḷḷi (dot) mark that both cancels a consonant's vowel and
// shortens e/o, distinct in shape and behaviour from the horizontal-stroke
// virama used everywhere else in Brahmi; Unicode encodes it and the short
// e/o it produces as their own code points (Tolkāppiyam eḻuttatikāram 51-52;
// Unicode proposal L2/12-226), attested from inscriptions like Kuṭumiyāmalai
// (3rd c. CE) and Araccalūr (4th c. CE) — within this era's own date range.
// Tamil-Brahmi's ḷ is likewise its own invention, not the Northern LLA.
const TAMIL_BRAHMI: ScriptTable = {
  ...BRAHMI,
  indep: { ...BRAHMI.indep, e: cp(0x11071), o: cp(0x11072) },
  cons: { ...BRAHMI.cons, ll: cp(0x11075) },
  sign: { ...BRAHMI.sign, e: cp(0x11073), o: cp(0x11074) },
  virama: cp(0x11070),
}

// Historic scripts. Each is a real, distinct Unicode block — none of these
// are fonts painted over Devanagari; the code points below are that
// script's own, so copying the output text elsewhere keeps working.
export const SCRIPTS: Record<ScriptId, ScriptTable> = {
  brahmi: BRAHMI,
  tamilBrahmi: TAMIL_BRAHMI,
  // Grantha (U+11300-U+1137F) — South Indian script for Sanskrit, ancestor
  // of the modern Tamil and Malayalam letterforms.
  grantha: {
    indep: seq({}, 0x11305, ['a', 'A', 'i', 'I', 'u', 'U', 'R', 'L', null, null, 'E', 'ai', null, null, 'O', 'au']),
    cons: seq({}, 0x11315, [...STD33.slice(0, 20), null, 'p', 'ph', 'b', 'bh', 'm', 'y', 'r', null, 'l', 'll', null, 'v', 'sh', 'ss', 's', 'h']),
    sign: seq({}, 0x1133e, ['A', 'i', 'I', 'u', 'U', 'R', 'RR', null, null, 'E', 'ai', null, null, 'O', 'au']),
    virama: cp(0x1134d),
    M: cp(0x11302),
    H: cp(0x11303),
    font: FONT.grantha,
  },
  // Siddham (U+11580-U+115FF) — north Indian script, c. 6th-8th century,
  // still used ceremonially by Shingon Buddhist priests in Japan.
  siddham: {
    indep: seq({}, 0x11580, V14),
    cons: seq({}, 0x1158e, STD33),
    sign: seq({}, 0x115af, ['A', 'i', 'I', 'u', 'U', 'R', 'RR', null, null, 'E', 'ai', 'O', 'au']),
    virama: cp(0x115bf),
    M: cp(0x115bd),
    H: cp(0x115be),
    font: FONT.siddham,
  },
  // Sharada (U+11180-U+111DF) — Kashmir's script of learning, c. 8th-12th c.
  sharada: {
    indep: seq({}, 0x11183, V14),
    cons: seq({}, 0x11191, [...STD33.slice(0, 28), 'll', ...STD33.slice(28)]),
    sign: seq({}, 0x111b3, ['A', 'i', 'I', 'u', 'U', 'R', 'RR', 'L', 'LL', 'E', 'ai', 'O', 'au']),
    virama: cp(0x111c0),
    M: cp(0x11181),
    H: cp(0x11182),
    font: FONT.sharada,
  },
  // Bhaiksuki (U+11C00-U+11C6F) — Buddhist "arrow-headed" script, eastern
  // India, c. 11th-12th century.
  bhaiksuki: {
    indep: seq({}, 0x11c00, ['a', 'A', 'i', 'I', 'u', 'U', 'R', 'RR', 'L', null, 'E', 'ai', 'O', 'au']),
    cons: seq({}, 0x11c0e, STD33),
    sign: seq({}, 0x11c2f, ['A', 'i', 'I', 'u', 'U', 'R', 'RR', 'L', null, 'E', 'ai', 'O', 'au']),
    virama: cp(0x11c3f),
    M: cp(0x11c3d),
    H: cp(0x11c3e),
    font: FONT.bhaiksuki,
  },
  // Nandinagari (U+119A0-U+119FF) — southern cousin of Devanagari, used for
  // Sanskrit in Karnataka and Andhra, c. 12th-19th century.
  nandinagari: {
    indep: seq({}, 0x119a0, ['a', 'A', 'i', 'I', 'u', 'U', 'R', 'RR', null, null, 'E', 'ai', 'O', 'au']),
    cons: seq({}, 0x119ae, [...STD33, 'rr', 'll']),
    sign: seq({}, 0x119d1, ['A', 'i', 'I', 'u', 'U', 'R', 'RR', null, null, 'E', 'ai', 'O', 'au']),
    virama: cp(0x119e0),
    M: cp(0x119de),
    H: cp(0x119df),
    font: FONT.nandinagari,
  },
  // Modi (U+11600-U+1165F) — the cursive administrative script of the
  // Yadavas, the Marathas and the Peshwas, c. 13th-20th century.
  modi: {
    indep: seq({}, 0x11600, V14),
    cons: seq({}, 0x1160e, [...STD33, 'll']),
    sign: seq({}, 0x11630, ['A', 'i', 'I', 'u', 'U', 'R', 'RR', 'L', 'LL', 'E', 'ai', 'O', 'au']),
    virama: cp(0x1163f),
    M: cp(0x1163d),
    H: cp(0x1163e),
    font: FONT.modi,
  },
  // Takri (U+11680-U+116CF) — the Śāradā-derived script of the Punjab hill
  // states (Chamba, Kangra, Jammu), c. 16th-20th century. No vocalic vowels, no ṣ.
  takri: {
    indep: seq({}, 0x11680, ['a', 'A', 'i', 'I', 'u', 'U', 'E', 'ai', 'O', 'au']),
    cons: seq({}, 0x1168a, [...STD33.slice(0, 30), 's', 'h', 'rr']),
    sign: seq({}, 0x116ad, ['A', 'i', 'I', 'u', 'U', 'E', 'ai', 'O', 'au']),
    virama: cp(0x116b6),
    M: cp(0x116ab),
    H: cp(0x116ac),
    font: FONT.takri,
  },
  // Mahajani (U+11150-U+1117F) — the Laṇḍā bookkeeping script of Punjabi and
  // Marwari merchants. A true shorthand: five vowel letters and no vowel
  // signs at all (a vowel after a consonant is written with the independent
  // letter, or left out), no virama, no ṅ ñ ś ṣ, and no ya — the ja letter
  // served for both (proposal L2/11-274). Built by hand rather than with
  // seq() since almost every slot needs an explicit stand-in.
  mahajani: (() => {
    const a = cp(0x11150), i = cp(0x11151), u = cp(0x11152), e = cp(0x11153), o = cp(0x11154)
    const cons = seq({}, 0x11155, [
      'k', 'kh', 'g', 'gh', 'c', 'ch', 'j', 'jh', 'ny', 'T', 'Th', 'D', 'Dh', 'N',
      't', 'th', 'd', 'dh', 'n', 'p', 'ph', 'b', 'bh', 'm', 'r', 'l', 'v', 's', 'h', 'rr',
    ])
    cons.y = cons.j
    return {
      indep: { a, A: a, i, I: i, u, U: u, e, E: e, ai: e, o, O: o, au: o },
      cons,
      sign: { A: a, i, I: i, u, U: u, e, E: e, ai: e, o, O: o, au: o },
      virama: '',
      font: FONT.mahajani,
    }
  })(),
  // Tirhuta (U+11480-U+114DF) — Mithilākṣar, the script of Maithili from
  // Vidyapati's songs to the 20th century; one of the few with signs for
  // Maithili's short e and o.
  tirhuta: {
    indep: seq({}, 0x11481, V14),
    cons: seq({}, 0x1148f, STD33),
    sign: seq({}, 0x114b0, ['A', 'i', 'I', 'u', 'U', 'R', 'RR', 'L', 'LL', 'E', 'e', 'ai', 'O', 'o', 'au']),
    virama: cp(0x114c2),
    M: cp(0x114c0),
    H: cp(0x114c1),
    font: FONT.tirhuta,
  },
  // Kaithi (U+11080-U+110CF) — the everyday script of Bihar and the eastern
  // Hindi belt for Bhojpuri, Magahi, Maithili and Hindi, c. 16th-20th
  // century. Its ṛ (ड़) is a separate letter, set here as the nearest code.
  kaithi: {
    indep: seq({}, 0x11083, ['a', 'A', 'i', 'I', 'u', 'U', 'E', 'ai', 'O', 'au']),
    cons: seq({}, 0x1108d, [...STD33.slice(0, 13), 'rr', 'Dh', null, 'N', ...STD33.slice(15)]),
    sign: seq({}, 0x110b0, ['A', 'i', 'I', 'u', 'U', 'E', 'ai', 'O', 'au']),
    virama: cp(0x110b9),
    M: cp(0x11081),
    H: cp(0x11082),
    font: FONT.kaithi,
  },
  // Syloti Nagri (U+A800-U+A82F) — Sylhet's own script, c. 15th-20th
  // century. Like Bengali the inherent vowel is o, and there is no long ā
  // letter: ā is the a-letter plus the ā-sign, and the dvisvara mark makes
  // the i of a diphthong. No ṅ ñ ṇ ś ṣ, no ya (ja serves), no visarga.
  sylotiNagri: (() => {
    const a = cp(0xa800), aSign = cp(0xa823), dvisvara = cp(0xa802)
    const cons = seq({}, 0xa807, [
      'k', 'kh', 'g', 'gh', null, 'c', 'ch', 'j', 'jh', 'T', 'Th', 'D', 'Dh',
      't', 'th', 'd', 'dh', 'n', 'p', 'ph', 'b', 'bh', 'm', 'r', 'l', 'rr', 's', 'h',
    ])
    cons.y = cons.j
    return {
      indep: {
        a, A: a + aSign, i: cp(0xa801), I: cp(0xa801), u: cp(0xa803), U: cp(0xa803),
        e: cp(0xa804), E: cp(0xa804), ai: a + dvisvara, o: cp(0xa805), O: cp(0xa805), au: cp(0xa805),
      },
      cons,
      sign: {
        A: aSign, i: cp(0xa824), I: cp(0xa824), u: cp(0xa825), U: cp(0xa825),
        e: cp(0xa826), E: cp(0xa826), ai: aSign + dvisvara, o: cp(0xa827), O: cp(0xa827), au: cp(0xa827),
      },
      virama: cp(0xa806),
      M: cp(0xa80b),
      font: FONT.sylotiNagri,
    }
  })(),
  // Meitei Mayek (U+ABC0-U+ABFF, plus U+AAE0-U+AAFF for the letters the
  // older orthography kept) — Manipur's own script, attested from medieval
  // copper plates and the Puya manuscripts, displaced by Bengali letters in
  // the 18th century and revived since the 1980s. Letters are ordered by the
  // parts of the body they are named after, not by varga, so each is placed
  // by hand. A final consonant is written with its lonsum form — the same
  // mechanism as Malayalam's chillu — and clusters with the apun iyek killer.
  meeteiMayek: (() => {
    const atiya = cp(0xabd1)
    const sign = {
      A: cp(0xabe5), i: cp(0xabe4), I: cp(0xaaeb), u: cp(0xabe8), U: cp(0xaaec),
      e: cp(0xabe6), E: cp(0xabe6), ai: cp(0xabe9), o: cp(0xabe3), O: cp(0xabe3), au: cp(0xabe7),
    }
    return {
      indep: {
        a: atiya, A: atiya + sign.A, i: cp(0xabcf), I: cp(0xabcf), u: cp(0xabce), U: cp(0xabce),
        e: cp(0xaae0), E: cp(0xaae0), ai: atiya + sign.ai, o: cp(0xaae1), O: cp(0xaae1), au: atiya + sign.au,
      },
      cons: {
        k: cp(0xabc0), s: cp(0xabc1), l: cp(0xabc2), m: cp(0xabc3), p: cp(0xabc4), n: cp(0xabc5),
        c: cp(0xabc6), t: cp(0xabc7), kh: cp(0xabc8), ng: cp(0xabc9), th: cp(0xabca), v: cp(0xabcb),
        y: cp(0xabcc), h: cp(0xabcd), ph: cp(0xabd0), g: cp(0xabd2), jh: cp(0xabd3), r: cp(0xabd4),
        b: cp(0xabd5), j: cp(0xabd6), d: cp(0xabd7), gh: cp(0xabd8), dh: cp(0xabd9), bh: cp(0xabda),
        ch: cp(0xaae2), ny: cp(0xaae3), T: cp(0xaae4), Th: cp(0xaae5), D: cp(0xaae6), Dh: cp(0xaae7),
        N: cp(0xaae8), sh: cp(0xaae9), ss: cp(0xaaea),
      },
      sign,
      virama: cp(0xabed),
      viramaBefore: ['r', 'l', 'y', 'v'],
      M: cp(0xabea),
      H: cp(0xaaf5),
      chillu: { k: cp(0xabdb), l: cp(0xabdc), m: cp(0xabdd), p: cp(0xabde), n: cp(0xabdf), t: cp(0xabe0), ng: cp(0xabe1) },
      font: FONT.meeteiMayek,
    }
  })(),
  // Modern scripts, built from their ISCII-pattern blocks.
  Devanagari: mkIscii('Devanagari'),
  Bengali: mkIscii('Bengali'),
  Assamese: mkIscii('Bengali'),
  Gujarati: mkIscii('Gujarati'),
  Oriya: mkIscii('Oriya'),
  Tamil: mkIscii('Tamil'),
  Telugu: mkIscii('Telugu'),
  Kannada: mkIscii('Kannada'),
  Malayalam: mkIscii('Malayalam'),
  Gurmukhi: mkIscii('Gurmukhi'),
}

// Assamese shares the Bengali block but has its own ra (ৰ), past the main
// consonant run. Its wa (ৱ) is for native /w/ words; Sanskrit-origin names
// keep Bengali's ব for v (বিবেক, বিক্ৰম), so it is read on input but not
// written here.
SCRIPTS.Assamese.cons.r = cp(0x09f0)

// Gurmukhi's ṛ (ੜ) lives past the main run, and its halant is written only
// under a subjoined ਰ ਹ ਵ (and the rare ਯ) — never at the end of a word.
SCRIPTS.Gurmukhi.cons.rr = cp(0x0a5c)
SCRIPTS.Gurmukhi.viramaBefore = ['r', 'h', 'v', 'y']

// Grantha's vocalic RR/LL sit in its own extended range, not the ISCII-style
// offset used by mkIscii — set after the fact since grantha is hand-built above.
SCRIPTS.grantha.indep.RR = cp(0x11360)
SCRIPTS.grantha.indep.LL = cp(0x11361)
SCRIPTS.grantha.sign.L = cp(0x11362)
SCRIPTS.grantha.sign.LL = cp(0x11363)

// Malayalam's six chillu letters — a bare/final consonant (ண ன ர ல ள க) is
// its own atomic glyph in modern orthography, not consonant+virama, a
// post-1980s-reform distinction the generic ISCII pattern doesn't have.
SCRIPTS.Malayalam.chillu = {
  N: cp(0x0d7a), n: cp(0x0d7b), rr: cp(0x0d7c), l: cp(0x0d7d), ll: cp(0x0d7e), k: cp(0x0d7f),
}
