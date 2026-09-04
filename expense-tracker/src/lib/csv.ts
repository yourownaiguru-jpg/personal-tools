import type { Transaction } from './types'

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function transactionsToCsv(transactions: Transaction[]): string {
  const header = ['Date', 'Description', 'Category', 'Account', 'Amount']
  const rows = transactions.map((t) =>
    [t.date, t.description, t.category, t.account, t.amount.toFixed(2)].map(escapeCsvField),
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
