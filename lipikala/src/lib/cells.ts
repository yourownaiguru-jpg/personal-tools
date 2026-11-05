import { render, roman } from './transliterate'
import type { Cell, ScriptTable, Token } from './types'

/**
 * Groups the token sequence into letter-map cells: one cell per akshara
 * (consonant+vowel, or standalone vowel), with a trailing anusvara/visarga
 * folded into the preceding cell rather than given its own. Whitespace
 * becomes a gap, not a cell.
 */
export function buildCells(toks: Token[], S: ScriptTable, M: ScriptTable): Cell[] {
  const cells: Cell[] = []
  let prev: Cell | null = null
  for (const t of toks) {
    if (t.t === 'X' && /\s/.test(t.s)) {
      cells.push({ border: 'none', minw: '18px', hist: '', modern: '', roman: '' })
      prev = null
      continue
    }
    if ((t.t === 'M' || t.t === 'H') && prev) {
      prev.hist += render([t], S)
      prev.modern += render([t], M)
      prev.roman += roman(t)
      continue
    }
    prev = {
      border: '1px solid var(--color-divider)',
      minw: '72px',
      hist: render([t], S),
      modern: render([t], M),
      roman: roman(t),
      font: `"${S.font}"`,
      modFont: `"${M.font}"`,
    }
    cells.push(prev)
  }
  return cells
}
