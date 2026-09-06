import { SCRIPTS } from './scripts'
import type { ScriptTable, Token } from './types'

// ---------------------------------------------------------------------------
// parse(): turns typed input — romanized, or already in any supported
// Indic script — into a script-neutral sequence of phonemic tokens.
// render(): turns that sequence into text in any one script's table.
// Together they let one parse of "Kaveri" (or "காவேரி") drive the same
// name into Brahmi, Grantha, modern Tamil, and every other script here.
// ---------------------------------------------------------------------------

// Base code points of the modern (ISCII-pattern) blocks parse() can read
// directly, so typing a name in Tamil or Devanagari works, not just roman.
const BLOCKS = [0x0900, 0x0980, 0x0a80, 0x0b00, 0x0b80, 0x0c00, 0x0c80, 0x0d00]

const ISC_V = ['a', 'A', 'i', 'I', 'u', 'U', 'R', 'L', 'Ec', 'e', 'E', 'ai', 'Oc', 'o', 'O', 'au']
const ISC_S = ['A', 'i', 'I', 'u', 'U', 'R', 'RR', 'Ec', 'e', 'E', 'ai', 'Oc', 'o', 'O', 'au']
const ISC_C = [
  'k', 'kh', 'g', 'gh', 'ng', 'c', 'ch', 'j', 'jh', 'ny',
  'T', 'Th', 'D', 'Dh', 'N', 't', 'th', 'd', 'dh', 'n', 'nn',
  'p', 'ph', 'b', 'bh', 'm', 'y', 'r', 'rr', 'l', 'll', 'zh', 'v', 'sh', 'ss', 's', 'h',
]

/**
 * When a script's table lacks the exact phoneme requested (a historic
 * script with no short e/o, say), fall back to the nearest sound a scribe
 * of the time would have used instead of dropping the letter.
 */
const CFB: Record<string, string> = {
  kh: 'k', g: 'k', gh: 'g', ch: 'c', j: 'c', jh: 'j', Th: 'T', D: 'T', Dh: 'D',
  th: 't', d: 't', dh: 'd', nn: 'n', ph: 'p', b: 'p', bh: 'b', rr: 'r', zh: 'll',
  ll: 'l', sh: 's', ss: 's', ng: 'n', ny: 'n', h: 'k', v: 'b',
}
const VFB: Record<string, string> = { Ec: 'e', e: 'E', Oc: 'o', o: 'O', RR: 'R', LL: 'L', L: 'i', R: 'i' }

function pick(map: Record<string, string>, key: string | undefined, fallback: Record<string, string>): string {
  let k = key
  let guard = 0
  while (k && map[k] === undefined && guard++ < 8) k = fallback[k]
  return (k && map[k]) || ''
}

/** Renders a token sequence into one script's table. */
export function render(toks: Token[], S: ScriptTable): string {
  let out = ''
  for (const t of toks) {
    if (t.t === 'X') out += t.s
    else if (t.t === 'V') out += pick(S.indep, t.v, VFB)
    else if (t.t === 'M') out += S.M || S.cons.m + S.virama
    else if (t.t === 'H') out += S.H || ''
    else {
      out += pick(S.cons, t.c, CFB)
      if (t.v === null) out += S.virama
      else if (t.v !== 'a') out += pick(S.sign, t.v, VFB)
    }
  }
  return out
}

// IAST-ish romanization of each internal phoneme code, for the letter-map.
const ROM_V: Record<string, string> = {
  a: 'a', A: 'ā', i: 'i', I: 'ī', u: 'u', U: 'ū', R: 'r̥', RR: 'r̥̄', L: 'l̥', LL: 'l̥̄',
  Ec: 'ĕ', e: 'e', E: 'ē', ai: 'ai', Oc: 'ŏ', o: 'o', O: 'ō', au: 'au',
}
const ROM_C: Record<string, string> = {
  ng: 'ṅ', ny: 'ñ', T: 'ṭ', Th: 'ṭh', D: 'ḍ', Dh: 'ḍh', N: 'ṇ', nn: 'ṉ', rr: 'ṟ', ll: 'ḷ', zh: 'ḻ', sh: 'ś', ss: 'ṣ',
}

export function roman(t: Token): string {
  if (t.t === 'V') return ROM_V[t.v] ?? t.v
  if (t.t === 'M') return 'ṁ'
  if (t.t === 'H') return 'ḥ'
  if (t.t === 'X') return t.s
  return (ROM_C[t.c] || t.c) + (t.v === null ? '' : (ROM_V[t.v] ?? t.v))
}

// Roman-input tables. Order matters: longer/more specific sequences must be
// tried before their prefixes ("chh" before "ch" before "c").
const LV: [string, string][] = [
  ['aa', 'A'], ['ai', 'ai'], ['au', 'au'], ['ee', 'I'], ['ii', 'I'], ['oo', 'U'], ['uu', 'U'],
  ['a', 'a'], ['i', 'i'], ['u', 'u'], ['e', 'e'], ['o', 'o'],
]
const LC: [string, string | string[]][] = [
  ['chh', 'ch'], ['kh', 'kh'], ['gh', 'gh'], ['ng', 'ng'], ['ch', 'c'], ['jh', 'jh'], ['ny', 'ny'],
  ['th', 'th'], ['dh', 'dh'], ['ph', 'ph'], ['bh', 'bh'], ['sh', 'sh'], ['zh', 'zh'],
  ['k', 'k'], ['g', 'g'], ['c', 'c'], ['j', 'j'], ['t', 't'], ['d', 'd'], ['n', 'n'], ['p', 'p'],
  ['b', 'b'], ['m', 'm'], ['y', 'y'], ['r', 'r'], ['l', 'l'], ['v', 'v'], ['w', 'v'], ['s', 's'], ['h', 'h'],
  ['f', 'ph'], ['z', 'j'], ['q', 'k'], ['x', ['k', 's']],
]

/**
 * Parses either romanized input ("double a vowel for a long one: aa, ee,
 * oo" per the app's placeholder text) or text already typed in one of the
 * eight supported modern Indic scripts, into the shared token sequence
 * every script table in scripts.ts can render.
 */
export function parse(str: string): Token[] {
  const toks: Token[] = []
  const s = [...str]
  let i = 0
  const last = (): Extract<Token, { t: 'C' }> | null => {
    const t = toks[toks.length - 1]
    return t && t.t === 'C' ? t : null
  }
  while (i < s.length) {
    const ch = s[i]
    const code = ch.codePointAt(0) ?? 0
    const blk = BLOCKS.find((b) => code >= b && code < b + 0x80) ?? null
    if (blk !== null) {
      const r = code - blk
      const l = last()
      if (r >= 5 && r <= 0x14) toks.push({ t: 'V', v: ISC_V[r - 5] })
      else if (r === 0x60 || r === 0x61) toks.push({ t: 'V', v: r === 0x60 ? 'RR' : 'LL' })
      else if (r >= 0x15 && r <= 0x39) toks.push({ t: 'C', c: ISC_C[r - 0x15], v: 'a' })
      else if (r >= 0x3e && r <= 0x4c) {
        if (l) l.v = ISC_S[r - 0x3e]
      } else if (r === 0x62 || r === 0x63) {
        if (l) l.v = r === 0x62 ? 'L' : 'LL'
      } else if (r === 0x4d) {
        if (l) l.v = null
      } else if (r === 1 || r === 2) toks.push({ t: 'M' })
      else if (r === 3) toks.push({ t: 'H' })
      else if (r === 0x3c || r === 0x55 || r === 0x56 || r === 0x57) {
        // Candrabindu / eyelash-ra / marks this parser doesn't model — skipped.
      } else if (blk === 0x0d00 && r >= 0x7a && r <= 0x7f) {
        toks.push({ t: 'C', c: ['N', 'n', 'rr', 'l', 'll', 'k'][r - 0x7a], v: null })
      } else if (blk === 0x0980 && r === 0x4e) toks.push({ t: 'C', c: 't', v: null })
      else if (r === 0x5c || r === 0x5d || r === 0x5f) {
        toks.push({ t: 'C', c: r === 0x5c ? 'D' : r === 0x5d ? 'Dh' : 'y', v: 'a' })
      } else if (blk === 0x0900 && r >= 0x58 && r <= 0x5f) {
        toks.push({ t: 'C', c: ['k', 'kh', 'g', 'j', 'D', 'Dh', 'ph', 'y'][r - 0x58], v: 'a' })
      } else if (r >= 0x66 && r <= 0x6f) toks.push({ t: 'X', s: String(r - 0x66) })
      else toks.push({ t: 'X', s: ch })
      i++
      continue
    }
    if (/[a-z]/i.test(ch)) {
      const low = s.slice(i, i + 3).join('').toLowerCase()
      const m = LC.find(([k]) => low.startsWith(k))
      if (m) {
        i += m[0].length
        const cs = Array.isArray(m[1]) ? m[1] : [m[1]]
        const pushed = cs.map((c): Extract<Token, { t: 'C' }> => ({ t: 'C', c, v: null }))
        pushed.forEach((tok) => toks.push(tok))
        const low2 = s.slice(i, i + 2).join('').toLowerCase()
        const mv = LV.find(([k]) => low2.startsWith(k))
        if (mv) {
          pushed[pushed.length - 1].v = mv[1]
          i += mv[0].length
        }
        continue
      }
      const mv = LV.find(([k]) => low.startsWith(k))
      if (mv) {
        toks.push({ t: 'V', v: mv[1] })
        i += mv[0].length
        continue
      }
    }
    // Zero-width joiner/non-joiner: silently dropped, not shown as a glyph.
    if (code !== 0x200c && code !== 0x200d) toks.push({ t: 'X', s: ch })
    i++
  }
  return toks
}

export { SCRIPTS }
