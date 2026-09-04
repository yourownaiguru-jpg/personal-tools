import type { Transaction } from './types'

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// Formula injection guard: transaction descriptions come from untrusted PDF
// content, and spreadsheet apps execute cells starting with = + - @ (or a
// stray tab/CR) as formulas when a CSV is opened. Text columns get a leading
// apostrophe in that case — the standard neutralization, rendered invisibly
// by Excel/Sheets. Never applied to the generated date/amount columns.
function guardFormulaInjection(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
}

export function transactionsToCsv(transactions: Transaction[]): string {
  const header = ['Date', 'Description', 'Category', 'Account', 'Amount']
  const rows = transactions.map((t) =>
    [
      t.date,
      escapeCsvField(guardFormulaInjection(t.description)),
      escapeCsvField(guardFormulaInjection(t.category)),
      escapeCsvField(guardFormulaInjection(t.account)),
      t.amount.toFixed(2),
    ],
  )
  return [header, ...rows].map((row) => row.join(',')).join('\n')
}

/** Triggers a browser download of the given text as a file — no network call. */
export function downloadTextFile(fileName: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
