import type { DateFormat } from './dateFormat'
import type { Transaction } from './types'

// Matches a leading date like "03/14", "3/14/24", "03-14-2024", "25-03-2024".
const DATE_RE = /^(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\s+/
// A single amount token: "1,234.56", "-45.00", "(45.00)", "₹1,234.56",
// "$45.00", "Rs.1,299.00". Indian statements often glue "Rs." straight onto
// the number with no space, which would otherwise leave the line with no
// recognizable amount and drop the transaction entirely.
const CURRENCY_PREFIX = String.raw`(?:[$₹£€]|Rs\.?|INR)`
const AMOUNT_TOKEN_RE = new RegExp(String.raw`^\(?-?${CURRENCY_PREFIX}?[\d,]+\.\d{2}\)?$`, 'i')
const CURRENCY_STRIP_RE = new RegExp(String.raw`${CURRENCY_PREFIX}|,`, 'gi')
const MARKER_RE = /^(CR|DR)$/i

const CREDIT_HINT_RE =
  /\b(payment received|payment thank you|autopay|refund|credit|reversal|deposit|salary)\b/i

interface AmountToken {
  raw: string
  marker?: 'CR' | 'DR'
}

/**
 * Splits the part of a line after the date into a description and its
 * trailing amount-like tokens, walking from the end so an explicit Dr/Cr
 * marker (space-separated or glued to the number, e.g. "500.00Dr") attaches
 * to the amount immediately before it. Handles one amount (a plain charge
 * line), two (amount + running balance), or three (debit, credit, balance
 * — some bank exports print "0.00" in whichever column doesn't apply).
 */
function splitTrailingAmounts(text: string): { description: string; amounts: AmountToken[] } {
  const normalized = text.replace(/(\d)(CR|DR)\b/gi, '$1 $2')
  const words = normalized.split(/\s+/).filter(Boolean)

  const amounts: AmountToken[] = []
  let pendingMarker: 'CR' | 'DR' | undefined
  let cut = words.length

  for (let i = words.length - 1; i >= 0; i--) {
    const word = words[i]
    if (MARKER_RE.test(word)) {
      pendingMarker = word.toUpperCase() as 'CR' | 'DR'
      cut = i
      continue
    }
    if (AMOUNT_TOKEN_RE.test(word)) {
      amounts.unshift({ raw: word, marker: pendingMarker })
      pendingMarker = undefined
      cut = i
      continue
    }
    break
  }

  const description = words
    .slice(0, cut)
    .join(' ')
    .replace(/\b(Rs\.?|INR|USD)$/i, '')
    .trim()

  return { description, amounts }
}

function toNumber(raw: string): number {
  return parseFloat(raw.replace(CURRENCY_STRIP_RE, '').replace(/[()]/g, ''))
}

function parseAmount(raw: string, isCredit: boolean): number {
  let s = raw.replace(CURRENCY_STRIP_RE, '').trim()
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
  if (Number.isNaN(value)) return NaN
  const credit = isCredit || negative
  return credit ? Math.abs(value) : -Math.abs(value)
}

function normalizeDate(raw: string, fallbackYear: number, dateFormat: DateFormat): string | null {
  const parts = raw.split(/[/-]/).map((p) => p.trim())
  if (parts.length < 2) return null
  const [aRaw, bRaw, yRaw] = parts
  const a = parseInt(aRaw, 10)
  const b = parseInt(bRaw, 10)
  if (!a || !b) return null
  let month = dateFormat === 'DMY' ? b : a
  let day = dateFormat === 'DMY' ? a : b
  // Swap when the assumed order is impossible but the reverse isn't — catches
  // statements that mix formats or where the guessed default is wrong for
  // this particular line.
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
  /** Defaults to 'MDY' (US). Use guessDateFormat() to infer per-statement. */
  dateFormat?: DateFormat
}

/**
 * Turns the reconstructed text lines of a statement into transactions.
 * This is a generic, format-agnostic parser: it looks for lines that start
 * with a date, then reads the trailing amount-like tokens after the
 * description:
 *
 *  - one amount: a plain charge/credit line (most credit card statements)
 *  - two amounts: [transaction amount, running balance] — sign comes from
 *    an explicit Dr/Cr marker if present, else from whether the balance
 *    increased or decreased since the previous transaction line
 *  - three amounts: [debit, credit, balance] — whichever of debit/credit
 *    is nonzero is the transaction
 *
 * Lines with no leading date, no trailing amount, or 4+ trailing amounts
 * (too ambiguous to guess at safely) are skipped.
 */
export function parseStatementText(
  pages: string[][],
  opts: ParseStatementOptions,
): Transaction[] {
  const transactions: Transaction[] = []
  const dateFormat = opts.dateFormat ?? 'MDY'
  let lastBalance: number | null = null

  for (const lines of pages) {
    for (const line of lines) {
      const dateMatch = line.match(DATE_RE)
      if (!dateMatch) continue

      const date = normalizeDate(dateMatch[1], opts.statementYear, dateFormat)
      if (!date) continue

      const { description, amounts } = splitTrailingAmounts(line.slice(dateMatch[0].length))
      if (!description || amounts.length === 0) continue

      let amount: number | null = null

      if (amounts.length === 1) {
        const forceCredit = amounts[0].marker === 'CR' || CREDIT_HINT_RE.test(description)
        amount = parseAmount(amounts[0].raw, forceCredit)
      } else if (amounts.length === 2) {
        const [txn, balanceToken] = amounts
        const balance = toNumber(balanceToken.raw)
        let forceCredit: boolean
        if (txn.marker) {
          forceCredit = txn.marker === 'CR'
        } else if (lastBalance !== null && !Number.isNaN(balance)) {
          forceCredit = balance > lastBalance
        } else {
          forceCredit = CREDIT_HINT_RE.test(description)
        }
        amount = parseAmount(txn.raw, forceCredit)
        if (!Number.isNaN(balance)) lastBalance = balance
      } else if (amounts.length === 3) {
        const debit = Math.abs(toNumber(amounts[0].raw))
        const credit = Math.abs(toNumber(amounts[1].raw))
        const balance = toNumber(amounts[2].raw)
        if (debit > 0) amount = -debit
        else if (credit > 0) amount = credit
        if (!Number.isNaN(balance)) lastBalance = balance
      }

      if (amount === null || Number.isNaN(amount) || amount === 0) continue

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
