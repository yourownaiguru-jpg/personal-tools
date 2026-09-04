import type { Transaction } from './types'

export interface CategoryTotal {
  category: string
  total: number
}

export interface MonthTotal {
  month: string // yyyy-mm
  expenses: number
  income: number
}

export interface Summary {
  totalExpenses: number
  totalIncome: number
  net: number
  count: number
}

export function summarize(transactions: Transaction[]): Summary {
  let totalExpenses = 0
  let totalIncome = 0
  for (const t of transactions) {
    if (t.amount < 0) totalExpenses += -t.amount
    else totalIncome += t.amount
  }
  return {
    totalExpenses,
    totalIncome,
    net: totalIncome - totalExpenses,
    count: transactions.length,
  }
}

/** Spend by category, expenses only, sorted largest first. */
export function spendByCategory(transactions: Transaction[]): CategoryTotal[] {
  const totals = new Map<string, number>()
  for (const t of transactions) {
    if (t.amount >= 0) continue
    totals.set(t.category, (totals.get(t.category) ?? 0) + -t.amount)
  }
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

/** Income vs. expenses per calendar month, in chronological order. */
export function totalsByMonth(transactions: Transaction[]): MonthTotal[] {
  const totals = new Map<string, MonthTotal>()
  for (const t of transactions) {
    const month = t.date.slice(0, 7)
    const entry = totals.get(month) ?? { month, expenses: 0, income: 0 }
    if (t.amount < 0) entry.expenses += -t.amount
    else entry.income += t.amount
    totals.set(month, entry)
  }
  return [...totals.values()].sort((a, b) => a.month.localeCompare(b.month))
}
