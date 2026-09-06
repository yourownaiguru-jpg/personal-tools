export type ScriptId =
  | 'brahmi'
  | 'grantha'
  | 'siddham'
  | 'sharada'
  | 'bhaiksuki'
  | 'nandinagari'
  | 'Devanagari'
  | 'Bengali'
  | 'Gujarati'
  | 'Oriya'
  | 'Tamil'
  | 'Telugu'
  | 'Kannada'
  | 'Malayalam'

export type LangId = 'Tamil' | 'Kannada' | 'Telugu' | 'Malayalam' | 'Sanskrit' | 'Bengali' | 'Gujarati' | 'Odia'

export interface Lang {
  id: LangId
  name: string
  /** Which modern script this language's "now" column is rendered in. */
  modern: ScriptId
}

/**
 * 'authentic' = this era's script is itself encoded in Unicode, so the name
 * is set letter-for-letter in it. 'approx' = the era's actual script has no
 * Unicode encoding, so the closest living descendant stands in instead —
 * always disclosed via Era.approx, never presented as the real thing.
 */
export type EraKind = 'authentic' | 'approx'

export interface Era {
  id: string
  name: string
  years: string
  script: ScriptId
  kind: EraKind
  note: string
  approx: string
}

export type Surface = 'stone' | 'copper' | 'palm'

/** One phonemic unit of the parsed name: a vowel, a consonant (+ vowel or
 * virama), an anusvara (M), a visarga (H), or an untranslated pass-through
 * character (punctuation, digits, spaces, unrecognized input). */
export type Token =
  | { t: 'X'; s: string }
  | { t: 'V'; v: string }
  | { t: 'M' }
  | { t: 'H' }
  | { t: 'C'; c: string; v: string | null }

export interface ScriptTable {
  /** Independent vowel letters, keyed by internal vowel code (a, A, i, I, ...). */
  indep: Record<string, string>
  /** Base consonant letters (inherent "a"), keyed by internal consonant code. */
  cons: Record<string, string>
  /** Dependent vowel signs (matras) attached to a consonant, same keys as indep minus 'a'. */
  sign: Record<string, string>
  /** The vowel-killer mark that strips a consonant's inherent "a". */
  virama: string
  /** Anusvara (nasalization) and visarga marks, when the script has dedicated ones. */
  M?: string
  H?: string
  /** CSS font-family this script renders in. */
  font: string
}

export interface Cell {
  border: string
  minw: string
  hist: string
  modern: string
  roman: string
  font?: string
  modFont?: string
}
