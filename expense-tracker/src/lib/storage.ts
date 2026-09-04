import type { CategoryRule, Transaction } from './types'

const TRANSACTIONS_KEY = 'expense-tracker:transactions:v1'
const RULES_KEY = 'expense-tracker:rules:v1'

/**
 * All persistence in this app is local to the browser (localStorage) and
 * holds only parsed transaction records — never the original PDF bytes.
 */
function isTransaction(value: unknown): value is Transaction {
  if (typeof value !== 'object' || value === null) return false
  const t = value as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    typeof t.date === 'string' &&
    typeof t.description === 'string' &&
    typeof t.amount === 'number' &&
    Number.isFinite(t.amount) &&
    typeof t.category === 'string' &&
    typeof t.account === 'string' &&
    typeof t.sourceStatement === 'string'
  )
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    // Malformed or hand-edited storage must not crash the app on load.
    return Array.isArray(parsed) ? parsed.filter(isTransaction) : []
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

function isCategoryRule(value: unknown): value is CategoryRule {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Record<string, unknown>
  return (
    typeof r.category === 'string' &&
    Array.isArray(r.keywords) &&
    r.keywords.every((k) => typeof k === 'string')
  )
}

export function loadRules(): CategoryRule[] | null {
  try {
    const raw = localStorage.getItem(RULES_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    // Same rationale as loadTransactions: malformed storage must degrade
    // to defaults, not crash categorization at runtime.
    if (!Array.isArray(parsed)) return null
    const rules = parsed.filter(isCategoryRule)
    return rules.length > 0 ? rules : null
  } catch {
    return null
  }
}

export function saveRules(rules: CategoryRule[]): void {
  try {
    localStorage.setItem(RULES_KEY, JSON.stringify(rules))
  } catch {
    // Ignore storage failures — rules still work in-memory this session.
  }
}

export function clearAllData(): void {
  localStorage.removeItem(TRANSACTIONS_KEY)
  localStorage.removeItem(RULES_KEY)
}

function dedupeKey(t: Transaction): string {
  return `${t.date}|${t.description}|${t.amount}|${t.account}`
}

/**
 * Merges newly parsed transactions into an existing set, skipping any that
 * look like duplicates of a transaction already present (same date,
 * description, amount, and account) — this lets overlapping statement
 * periods be uploaded again without doubling entries.
 *
 * Duplicates are matched by occurrence count, not mere existence: if a
 * statement legitimately contains the same purchase twice on one day (two
 * identical coffees), both are kept, because only as many incoming copies
 * are dropped as already exist in the stored set.
 */
export function mergeTransactions(
  existing: Transaction[],
  incoming: Transaction[],
): { merged: Transaction[]; addedCount: number; duplicateCount: number } {
  const existingCounts = new Map<string, number>()
  for (const t of existing) {
    const key = dedupeKey(t)
    existingCounts.set(key, (existingCounts.get(key) ?? 0) + 1)
  }

  const consumed = new Map<string, number>()
  const merged = [...existing]
  let addedCount = 0
  let duplicateCount = 0

  for (const t of incoming) {
    const key = dedupeKey(t)
    const used = consumed.get(key) ?? 0
    consumed.set(key, used + 1)
    if (used < (existingCounts.get(key) ?? 0)) {
      duplicateCount++
      continue
    }
    merged.push(t)
    addedCount++
  }

  merged.sort((a, b) => a.date.localeCompare(b.date))
  return { merged, addedCount, duplicateCount }
}
