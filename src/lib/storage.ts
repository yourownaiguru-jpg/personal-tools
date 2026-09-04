import type { Transaction } from './types'

const TRANSACTIONS_KEY = 'expense-tracker:transactions:v1'

/**
 * All persistence in this app is local to the browser (localStorage) and
 * holds only parsed transaction records — never the original PDF bytes.
 */
export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
  } catch {
    // Storage may be unavailable (private browsing, quota exceeded, etc.);
    // the app still works in-memory for the current session.
  }
}

export function clearAllData(): void {
  localStorage.removeItem(TRANSACTIONS_KEY)
}

function dedupeKey(t: Transaction): string {
  return `${t.date}|${t.description}|${t.amount}|${t.account}`
}

/**
 * Merges newly parsed transactions into an existing set, skipping any that
 * look like duplicates of a transaction already present (same date,
 * description, amount, and account) — this lets overlapping statement
 * periods be uploaded again without doubling entries.
 */
export function mergeTransactions(
  existing: Transaction[],
  incoming: Transaction[],
): { merged: Transaction[]; addedCount: number; duplicateCount: number } {
  const seen = new Set(existing.map(dedupeKey))
  const merged = [...existing]
  let addedCount = 0
  let duplicateCount = 0

  for (const t of incoming) {
    const key = dedupeKey(t)
    if (seen.has(key)) {
      duplicateCount++
      continue
    }
    seen.add(key)
    merged.push(t)
    addedCount++
  }

  merged.sort((a, b) => a.date.localeCompare(b.date))
  return { merged, addedCount, duplicateCount }
}
