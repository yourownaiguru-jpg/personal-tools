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
const BLOCKS = [0x0900, 0x0980, 0x0a00, 0x0a80, 0x0b00, 0x0b80, 0x0c00, 0x0c80, 0x0d00]

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
  th: 't', d: 't', dh: 'd', nn: 'n', N: 'n', ph: 'p', b: 'p', bh: 'b', rr: 'r', zh: 'll',
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
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]
    if (t.t === 'X') out += t.s
    else if (t.t === 'V') out += pick(S.indep, t.v, VFB)
    else if (t.t === 'M') out += S.M || S.cons.m + S.virama
    else if (t.t === 'H') out += S.H || ''
    else {
      if (t.v !== null) {
        out += pick(S.cons, t.c, CFB)
        if (t.v !== 'a') out += pick(S.sign, t.v, VFB)
        continue
      }
      // A dead consonant. Followed by a consonant it can cluster with, it is
      // consonant+virama (the n in "Kanth"). Anywhere else — word-final, or
      // before a consonant the script doesn't join to — it takes its atomic
      // final form where the script has one (Malayalam's chillu, Meitei
      // Mayek's lonsum), is written bare in a script that shows the virama
      // only under subjoined letters (Gurmukhi), and is consonant+virama
      // otherwise.
      const next = toks[i + 1]
      const nextC = next?.t === 'C' ? next.c : null
      const clusters = nextC !== null && (!S.viramaBefore || S.viramaBefore.includes(nextC))
      const chillu = clusters ? undefined : S.chillu?.[t.c]
      if (chillu) out += chillu
      else {
        out += pick(S.cons, t.c, CFB)
        if (clusters || !S.viramaBefore) out += S.virama
      }
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
// "ee"/"oo" follow common informal spelling (long-i and long-u sounds, as in
// "Sheela", "Poonam") rather than lengthening e/o, so Tamil/Kannada/Telugu/
// Malayalam's own long ஏ/ஓ — distinct from short எ/ஒ, unlike in Sanskrit-
// derived scripts where e/o are always long — need their own sequence: "ae"/
// "ao", since "ee"/"oo" are already spoken for.
const LV: [string, string][] = [
  ['aa', 'A'], ['ai', 'ai'], ['au', 'au'], ['ae', 'E'], ['ao', 'O'],
  ['ee', 'I'], ['ii', 'I'], ['oo', 'U'], ['uu', 'U'],
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
 * A historic script's own codepoint, read back to the phonemic code (and
 * slot: independent vowel, consonant, dependent sign, or virama/anusvara/
 * visarga) it renders from — the inverse of each ScriptTable in scripts.ts.
 */
type HistoricEntry = { kind: 'indep' | 'cons' | 'sign' | 'chillu' | 'virama' | 'M' | 'H'; key: string }

function reverseInto(map: Map<number, HistoricEntry>, S: ScriptTable): void {
  // Only a single code point can be read back as one letter. A table entry
  // built from two (Syloti Nagri's ā, Meitei Mayek's ai) is a spelling made
  // of letters that are each registered on their own, so it is skipped here
  // rather than letting its first code point shadow the real letter's.
  const single = (ch: string): number | null => ([...ch].length === 1 ? ch.codePointAt(0)! : null)
  const put = (ch: string, entry: HistoricEntry) => {
    const c = single(ch)
    if (c !== null) map.set(c, entry)
  }
  for (const [key, ch] of Object.entries(S.indep)) put(ch, { kind: 'indep', key })
  for (const [key, ch] of Object.entries(S.cons)) put(ch, { kind: 'cons', key })
  for (const [key, ch] of Object.entries(S.sign)) put(ch, { kind: 'sign', key })
  for (const [key, ch] of Object.entries(S.chillu ?? {})) put(ch, { kind: 'chillu', key })
  if (S.virama) put(S.virama, { kind: 'virama', key: '' })
  if (S.M) put(S.M, { kind: 'M', key: '' })
  if (S.H) put(S.H, { kind: 'H', key: '' })
}

/** Builds one codepoint→phoneme map from every script sharing a Unicode block
 * (brahmi and tamilBrahmi both live in U+11000–U+1107F), so either glyph
 * tradition for a shared sound — e.g. the two different LLA letters — reads
 * back the same way. */
function historicMap(...tables: ScriptTable[]): Map<number, HistoricEntry> {
  const map = new Map<number, HistoricEntry>()
  for (const S of tables) reverseInto(map, S)
  return map
}

// Historic scripts read back the same way the roman/modern-script decoders
// do: a real Brahmi/Grantha/… inscription, once it's Unicode text (pasted
// from a transcription, an epigraphy database, Wikipedia — not a photo),
// re-sets into a modern script or romanizes, not just the other direction.
const HISTORIC_BLOCKS: [number, number, Map<number, HistoricEntry>][] = [
  [0x11000, 0x1107f, historicMap(SCRIPTS.brahmi, SCRIPTS.tamilBrahmi)],
  [0x11300, 0x1137f, historicMap(SCRIPTS.grantha)],
  [0x11580, 0x115ff, historicMap(SCRIPTS.siddham)],
  [0x11180, 0x111df, historicMap(SCRIPTS.sharada)],
  [0x11c00, 0x11c6f, historicMap(SCRIPTS.bhaiksuki)],
  [0x119a0, 0x119ff, historicMap(SCRIPTS.nandinagari)],
  [0x11600, 0x1165f, historicMap(SCRIPTS.modi)],
  [0x11680, 0x116cf, historicMap(SCRIPTS.takri)],
  [0x11150, 0x1117f, historicMap(SCRIPTS.mahajani)],
  [0x11480, 0x114df, historicMap(SCRIPTS.tirhuta)],
  [0x11080, 0x110cf, historicMap(SCRIPTS.kaithi)],
  [0xa800, 0xa82f, historicMap(SCRIPTS.sylotiNagri)],
  // Meitei Mayek spans two blocks; both read from the one table.
  [0xabc0, 0xabff, historicMap(SCRIPTS.meeteiMayek)],
  [0xaae0, 0xaaff, historicMap(SCRIPTS.meeteiMayek)],
]

/**
 * Parses either romanized input ("double a vowel for a long one: aa, ee,
 * oo" per the app's placeholder text) or text already typed in one of the
 * supported modern Indic scripts, into the shared token sequence every
 * script table in scripts.ts can render.
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
      else if (blk === 0x0980 && (r === 0x70 || r === 0x71)) {
        // Assamese ৰ and ৱ, past the shared Bengali run.
        toks.push({ t: 'C', c: r === 0x70 ? 'r' : 'v', v: 'a' })
      } else if (blk === 0x0a00 && r === 0x5c) toks.push({ t: 'C', c: 'rr', v: 'a' })
      else if (blk === 0x0a00 && (r === 0x59 || r === 0x5a || r === 0x5b || r === 0x5e)) {
        // Gurmukhi's nukta letters (ਖ਼ ਗ਼ ਜ਼ ਫ਼), read as their base sounds.
        toks.push({ t: 'C', c: r === 0x59 ? 'kh' : r === 0x5a ? 'g' : r === 0x5b ? 'j' : 'ph', v: 'a' })
      } else if (blk === 0x0a00 && r === 0x70) toks.push({ t: 'M' })
      else if (blk === 0x0a00 && (r === 0x71 || r === 0x72 || r === 0x73 || r === 0x75)) {
        // Addak (doubling), the iri/ura vowel bearers and yakash — not modelled.
      } else if (r === 0x5c || r === 0x5d || r === 0x5f) {
        toks.push({ t: 'C', c: r === 0x5c ? 'D' : r === 0x5d ? 'Dh' : 'y', v: 'a' })
      } else if (blk === 0x0900 && r >= 0x58 && r <= 0x5f) {
        toks.push({ t: 'C', c: ['k', 'kh', 'g', 'j', 'D', 'Dh', 'ph', 'y'][r - 0x58], v: 'a' })
      } else if (r >= 0x66 && r <= 0x6f) toks.push({ t: 'X', s: String(r - 0x66) })
      else toks.push({ t: 'X', s: ch })
      i++
      continue
    }
    const hist = HISTORIC_BLOCKS.find(([lo, hi]) => code >= lo && code <= hi)
    if (hist) {
      const entry = hist[2].get(code)
      const l = last()
      if (!entry) toks.push({ t: 'X', s: ch })
      else if (entry.kind === 'indep') toks.push({ t: 'V', v: entry.key })
      else if (entry.kind === 'cons') toks.push({ t: 'C', c: entry.key, v: 'a' })
      else if (entry.kind === 'chillu') toks.push({ t: 'C', c: entry.key, v: null })
      else if (entry.kind === 'sign') { if (l) l.v = entry.key }
      else if (entry.kind === 'virama') { if (l) l.v = null }
      else if (entry.kind === 'M') toks.push({ t: 'M' })
      else toks.push({ t: 'H' })
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
