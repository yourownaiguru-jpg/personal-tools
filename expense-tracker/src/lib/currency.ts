export type Currency = 'USD' | 'INR' | 'GBP' | 'EUR'

export const CURRENCIES: Currency[] = ['USD', 'INR', 'GBP', 'EUR']

/**
 * Banking terms that only appear on Indian statements. Used both to infer
 * the currency (a statement full of UPI/NEFT lines is in rupees even when
 * it prints no symbol at all — many Indian bank PDFs don't) and, by
 * dateFormat.ts, to infer day-first dates.
 */
export const INDIA_BANKING_HINTS = [/\bIFSC\b/i, /\bUPI\b/i, /\bGSTIN\b/i, /\bNEFT\b/i, /\bIMPS\b/i]

// Indian statements tag each amount as debit or credit ("450.00 Dr"), a
// convention US and UK statements don't use. Anchored to the digits it
// follows so a street address ("123 MAIN DR") can't trigger it, and only
// consulted when no currency symbol was printed at all.
const INDIA_AMOUNT_MARKER = /\d\s*(?:Dr|Cr)\b/

// Matched against the whole statement and counted, rather than taken in
// priority order: a rupee statement may mention "USD" once in a forex or
// international-transaction line, so the symbol that appears most often is
// the better signal than the first one seen.
const CURRENCY_HINTS: Array<[Currency, RegExp]> = [
  ['INR', /₹|\bRs\.?(?=\s|\d)|\bINR\b/gi],
  ['GBP', /£|\bGBP\b/g],
  ['EUR', /€|\bEUR\b/g],
  ['USD', /\$|\bUSD\b/g],
]

/**
 * Infers which currency a statement's amounts are printed in, so the
 * dashboard can render ₹ for a rupee statement instead of labelling every
 * figure with a dollar sign. Symbol counts decide it; failing that, Indian
 * banking terms and debit/credit amount markers imply rupees. Defaults to
 * USD, matching this app's original assumption and the fallback used for
 * dates.
 */
export function guessCurrency(pages: string[][]): Currency {
  const text = pages.flat().join('\n')

  let best: Currency | null = null
  let bestCount = 0
  for (const [currency, pattern] of CURRENCY_HINTS) {
    const count = text.match(pattern)?.length ?? 0
    if (count > bestCount) {
      best = currency
      bestCount = count
    }
  }
  if (best) return best

  if (INDIA_BANKING_HINTS.some((re) => re.test(text))) return 'INR'
  if (INDIA_AMOUNT_MARKER.test(text)) return 'INR'

  return 'USD'
}

// Rupee amounts are grouped in lakhs (1,23,456.00), which only the Indian
// locale produces — the browser's own locale would render 123,456.00 with a
// ₹ bolted on. Every other supported currency is left to the viewer's
// locale, which is what they expect to read.
const LOCALE_BY_CURRENCY: Partial<Record<Currency, string>> = { INR: 'en-IN' }

export function formatCurrency(
  value: number,
  currency: Currency,
  options: Intl.NumberFormatOptions = {},
): string {
  return value.toLocaleString(LOCALE_BY_CURRENCY[currency], {
    style: 'currency',
    currency,
    ...options,
  })
}

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: '$ US dollar',
  INR: '₹ Indian rupee',
  GBP: '£ Pound sterling',
  EUR: '€ Euro',
}
