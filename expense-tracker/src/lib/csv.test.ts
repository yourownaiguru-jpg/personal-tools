import { describe, expect, it } from 'vitest'
import { transactionsToCsv } from './csv'
import type { Transaction } from './types'

const tx = (over: Partial<Transaction>): Transaction => ({
  id: '1',
  date: '2024-03-14',
  description: 'COFFEE SHOP',
  amount: -4.5,
  category: 'Dining',
  account: 'Test Card',
  sourceStatement: 'a.pdf',
  ...over,
})

describe('transactionsToCsv', () => {
  it('includes a header row and formats amounts to 2 decimals', () => {
    const csv = transactionsToCsv([tx({})])
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Date,Description,Category,Account,Amount')
    expect(lines[1]).toBe('2024-03-14,COFFEE SHOP,Dining,Test Card,-4.50')
  })

  it('quotes and escapes fields containing commas or quotes', () => {
    const csv = transactionsToCsv([tx({ description: 'ACME, INC "downtown"' })])
    expect(csv).toContain('"ACME, INC ""downtown"""')
  })
})
