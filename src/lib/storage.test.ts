import { describe, expect, it } from 'vitest'
import { mergeTransactions } from './storage'
import type { Transaction } from './types'

const tx = (over: Partial<Transaction>): Transaction => ({
  id: Math.random().toString(),
  date: '2024-03-14',
  description: 'COFFEE SHOP',
  amount: -4.5,
  category: 'Dining',
  account: 'Test Card',
  sourceStatement: 'a.pdf',
  ...over,
})

describe('mergeTransactions', () => {
  it('adds new transactions and counts them', () => {
    const { merged, addedCount, duplicateCount } = mergeTransactions([], [tx({})])
    expect(merged).toHaveLength(1)
    expect(addedCount).toBe(1)
    expect(duplicateCount).toBe(0)
  })

  it('skips duplicates from an overlapping statement period', () => {
    const existing = [tx({ id: 'a' })]
    const incoming = [tx({ id: 'b' })] // same date/description/amount/account, different id
    const { merged, addedCount, duplicateCount } = mergeTransactions(existing, incoming)
    expect(merged).toHaveLength(1)
    expect(addedCount).toBe(0)
    expect(duplicateCount).toBe(1)
  })

  it('keeps distinct transactions on the same day', () => {
    const existing = [tx({ id: 'a' })]
    const incoming = [tx({ id: 'b', description: 'GROCERY STORE', amount: -30 })]
    const { merged } = mergeTransactions(existing, incoming)
    expect(merged).toHaveLength(2)
  })

  it('sorts the merged result chronologically', () => {
    const existing = [tx({ id: 'a', date: '2024-03-20' })]
    const incoming = [tx({ id: 'b', date: '2024-03-01', description: 'X' })]
    const { merged } = mergeTransactions(existing, incoming)
    expect(merged.map((t) => t.date)).toEqual(['2024-03-01', '2024-03-20'])
  })
})
