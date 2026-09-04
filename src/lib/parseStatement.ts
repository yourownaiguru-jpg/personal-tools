import type { Transaction } from './types'

// Matches a leading date like "03/14", "3/14/24", "03-14-2024".
const DATE_RE = /^(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\s+/
// Matches a trailing amount like "1,234.56", "-45.00", "(45.00)", optionally
// followed by "CR" for an explicit credit marker.
const AMOUNT_RE = /(\(?-?\$?[\d,]+\.\d{2}\)?)\s*(CR)?$/i

const CREDIT_HINT_RE = /\b(payment received|payment thank you|autopay|refund|credit|reversal|deposit)\b/i

function parseAmount(raw: string, forceCredit: boolean): number {
  let s = raw.replace(/[$,]/g, '').trim()
  let negative = false
  if (s.startsWith('(') && s.endsWith(')')) {
    negative = true
    s = s.slice(1, -1)
  }
  if (s.startsWith('-')) {
    negative = true
    s = s.slice(1)
  }
  const value = parseFloat(s)
  if (Number.isNaN(value)) return 0
  // Statement lines default to "money out" unless flagged as a credit —
  // most bank/card statements print charges as plain positive numbers.
  const isCredit = forceCredit || negative
  return isCredit ? Math.abs(value) : -Math.abs(value)
}

function normalizeDate(raw: string, fallbackYear: number): string | null {
  const parts = raw.split(/[/-]/).map((p) => p.trim())
  if (parts.length < 2) return null
  const [mRaw, dRaw, yRaw] = parts
  let month = parseInt(mRaw, 10)
  let day = parseInt(dRaw, 10)
  if (!month || !day) return null
  // US mm/dd is assumed, but an unambiguous dd/mm date (first number > 12)
  // is recognized and swapped so European-style statements still parse.
  if (month > 12 && day <= 12) [month, day] = [day, month]
  if (month > 12 || day > 31) return null
  let year = yRaw ? parseInt(yRaw, 10) : fallbackYear
  if (yRaw && yRaw.length === 2) year = 2000 + year
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export interface ParseStatementOptions {
  account: string
  sourceStatement: string
  statementYear: number
}

/**
 * Turns the reconstructed text lines of a statement into transactions.
 * This is a generic, format-agnostic parser: it looks for lines that start
 * with a date and end with a dollar amount, and treats everything between
 * as the description. It intentionally skips lines that don't match this
 * shape (headers, page numbers, running balances without a leading date).
 */
export function parseStatementText(
  pages: string[][],
  opts: ParseStatementOptions,
): Transaction[] {
  const transactions: Transaction[] = []

  for (const lines of pages) {
    for (const line of lines) {
      const dateMatch = line.match(DATE_RE)
      const amountMatch = line.match(AMOUNT_RE)
      if (!dateMatch || !amountMatch) continue

      const date = normalizeDate(dateMatch[1], opts.statementYear)
      if (!date) continue

      const description = line
        .slice(dateMatch[0].length, line.length - amountMatch[0].length)
        .replace(/\s+/g, ' ')
        .trim()
      if (!description) continue

      const forceCredit = !!amountMatch[2] || CREDIT_HINT_RE.test(description)
      const amount = parseAmount(amountMatch[1], forceCredit)
      if (amount === 0) continue

      // A random id, not `${file}#${index}` — two uploads can share a file
      // name (e.g. every month's download is "statement.pdf"), and colliding
      // ids would break React keys and per-row category edits.
      transactions.push({
        id: crypto.randomUUID(),
        date,
        description,
        amount,
        category: 'Uncategorized',
        account: opts.account,
        sourceStatement: opts.sourceStatement,
      })
    }
  }

  return transactions
}
