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
}

export const FONT: Record<ScriptId, string> = {
  brahmi: 'Noto Sans Brahmi',
  grantha: 'Noto Sans Grantha',
  siddham: 'Noto Sans Siddham',
  sharada: 'Noto Sans Sharada',
  bhaiksuki: 'Noto Sans Bhaiksuki',
  nandinagari: 'Noto Sans Nandinagari',
  Tamil: 'Noto Serif Tamil',
  Kannada: 'Noto Serif Kannada',
  Telugu: 'Noto Serif Telugu',
  Malayalam: 'Noto Serif Malayalam',
  Devanagari: 'Noto Serif Devanagari',
  Bengali: 'Noto Serif Bengali',
  Gujarati: 'Noto Serif Gujarati',
  Oriya: 'Noto Sans Oriya',
}

export const SCRIPT_LABEL: Record<ScriptId, string> = {
  brahmi: 'Brahmi script',
  grantha: 'Grantha script',
  siddham: 'Siddhaṃ script',
  sharada: 'Śāradā script',
  bhaiksuki: 'Bhaiksuki script',
  nandinagari: 'Nandinagari script',
  Tamil: 'Tamil letters',
  Kannada: 'Kannada letters',
  Telugu: 'Telugu letters',
  Malayalam: 'Malayalam letters',
  Devanagari: 'Nāgarī letters',
  Bengali: 'Bengali letters',
  Gujarati: 'Gujarati letters',
  Oriya: 'Odia letters',
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

// Historic scripts. Each is a real, distinct Unicode block — none of these
// are fonts painted over Devanagari; the code points below are that
// script's own, so copying the output text elsewhere keeps working.
export const SCRIPTS: Record<ScriptId, ScriptTable> = {
  // Brahmi (U+11000-U+1107F) — the ancestor of every Indic script, used
  // from Ashoka's edicts (3rd c. BCE) into the early centuries CE.
  brahmi: {
    indep: seq({}, 0x11005, V14),
    cons: seq({}, 0x11013, [...STD33, 'll', 'zh', 'rr', 'nn']),
    sign: seq({}, 0x11038, ['A', null, 'i', 'I', 'u', 'U', 'R', 'RR', 'L', 'LL', 'E', 'ai', 'O', 'au']),
    virama: cp(0x11046),
    M: cp(0x11001),
    H: cp(0x11002),
    font: FONT.brahmi,
  },
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
  // Modern scripts, built from their ISCII-pattern blocks.
  Devanagari: mkIscii('Devanagari'),
  Bengali: mkIscii('Bengali'),
  Gujarati: mkIscii('Gujarati'),
  Oriya: mkIscii('Oriya'),
  Tamil: mkIscii('Tamil'),
  Telugu: mkIscii('Telugu'),
  Kannada: mkIscii('Kannada'),
  Malayalam: mkIscii('Malayalam'),
}

// Grantha's vocalic RR/LL sit in its own extended range, not the ISCII-style
// offset used by mkIscii — set after the fact since grantha is hand-built above.
SCRIPTS.grantha.indep.RR = cp(0x11360)
SCRIPTS.grantha.indep.LL = cp(0x11361)
SCRIPTS.grantha.sign.L = cp(0x11362)
SCRIPTS.grantha.sign.LL = cp(0x11363)
