import { ERAS, LANGS, SURF } from './data'
import { SCRIPTS } from './scripts'
import { parse, render } from './transliterate'
import type { Era, Lang, LangId, ScriptTable, Surface, Token } from './types'

export interface AppState {
  text: string
  lang: LangId
  eraIdx: number
  /** Explicit user override; null means "follow the era's default surface". */
  surf: Surface | null
  shareLabel: string
}

export interface Derived {
  lang: Lang
  eras: Era[]
  era: Era
  /** The historic script's table for the selected era. */
  S: ScriptTable
  /** The modern script's table for the selected language. */
  M: ScriptTable
  toks: Token[]
  surf: Surface
  out: string
}

const DEFAULT_SURFACE: Surface = 'stone'

export function initStateFromHash(hash: string): AppState {
  const p = new URLSearchParams(hash.replace(/^#/, ''))
  const lang = (LANGS.some((l) => l.id === p.get('l')) ? p.get('l') : 'Tamil') as LangId
  const ei = Math.max(0, (ERAS[lang] || []).findIndex((e) => e.id === p.get('e')))
  const s = p.get('s')
  return {
    text: p.get('t') ?? 'Kaveri',
    lang,
    eraIdx: ei,
    surf: s === 'stone' || s === 'copper' || s === 'palm' ? s : null,
    shareLabel: 'Copy link',
  }
}

export function derive(state: AppState): Derived {
  const lang = LANGS.find((l) => l.id === state.lang) ?? LANGS[0]
  const eras = ERAS[state.lang]
  const era = eras[Math.min(state.eraIdx, eras.length - 1)]
  const surf = state.surf ?? DEFAULT_SURFACE
  const toks = parse(state.text || '')
  const S = SCRIPTS[era.script]
  const M = SCRIPTS[lang.modern]
  return { lang, eras, era, S, M, toks, surf, out: render(toks, S) }
}

export function shareUrl(state: AppState, era: Era, surf: Surface): string {
  const p = new URLSearchParams({ t: state.text, l: state.lang, e: era.id, s: surf })
  return `${location.origin}${location.pathname}#${p.toString()}`
}

export { SURF }
