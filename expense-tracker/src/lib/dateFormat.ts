export type DateFormat = 'MDY' | 'DMY'

const INDIA_HINTS = [/₹/, /\bIFSC\b/i, /\bUPI\b/i, /\bGSTIN\b/i, /\bNEFT\b/i, /\bIMPS\b/i]

/**
 * Infers whether the dates in a statement are US-style (month first) or
 * day-first (used in India, the UK, and most of the world). Unambiguous
 * evidence wins: any date where the first number can't be a month (>12)
 * proves day-first. Failing that, currency/banking-term hints common on
 * Indian statements are used. Defaults to US month-first, since that was
 * this app's original (and still most common) assumption.
 */
export function guessDateFormat(pages: string[][]): DateFormat {
  const lines = pages.flat()

  for (const line of lines) {
    const match = line.match(/(\d{1,2})[/-](\d{1,2})(?:[/-]\d{2,4})?/)
    if (!match) continue
    const first = parseInt(match[1], 10)
    const second = parseInt(match[2], 10)
    if (first > 12 && second <= 12) return 'DMY'
    if (second > 12 && first <= 12) return 'MDY'
  }

  const text = lines.join(' ')
  if (INDIA_HINTS.some((re) => re.test(text))) return 'DMY'

  return 'MDY'
}
