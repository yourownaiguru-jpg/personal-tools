import { describe, expect, it } from 'vitest'
import { spendByCategory, summarize, totalsByMonth } from './aggregate'
import type { Transaction } from './types'

const tx = (over: Partial<Transaction>): Transaction => ({
  id: Math.random().toString(),
  date: '2024-03-14',
  description: 'x',
  amount: -10,
  category: 'Uncategorized',
  account: 'Test',
  sourceStatement: 'test.pdf',
  ...over,
})

describe('summarize', () => {
  it('splits income and expenses and computes net', () => {
    const result = summarize([tx({ amount: -50 }), tx({ amount: 200 })])
    expect(result.totalExpenses).toBe(50)
    expect(result.totalIncome).toBe(200)
    expect(result.net).toBe(150)
    expect(result.count).toBe(2)
  })
})

describe('spendByCategory', () => {
  it('sums expenses per category, ignores income, sorts descending', () => {
    const result = spendByCategory([
      tx({ amount: -10, category: 'Dining' }),
      tx({ amount: -40, category: 'Groceries' }),
      tx({ amount: -5, category: 'Dining' }),
      tx({ amount: 500, category: 'Income' }),
    ])
    expect(result).toEqual([
      { category: 'Groceries', total: 40 },
      { category: 'Dining', total: 15 },
    ])
  })
})

describe('totalsByMonth', () => {
  it('buckets by yyyy-mm and sorts chronologically', () => {
    const result = totalsByMonth([
      tx({ date: '2024-02-01', amount: -10 }),
      tx({ date: '2024-01-15', amount: -5 }),
      tx({ date: '2024-01-20', amount: 100 }),
    ])
    expect(result).toEqual([
      { month: '2024-01', expenses: 5, income: 100 },
      { month: '2024-02', expenses: 10, income: 0 },
    ])
  })
})
