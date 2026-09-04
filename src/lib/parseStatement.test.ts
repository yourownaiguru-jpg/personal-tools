import { describe, expect, it } from 'vitest'
import { parseStatementText } from './parseStatement'

const opts = { account: 'Test Card', sourceStatement: 'test.pdf', statementYear: 2024 }

describe('parseStatementText', () => {
  it('parses a simple charge line as a negative amount', () => {
    const [tx] = parseStatementText([['03/14 STARBUCKS STORE #123 5.75']], opts)
    expect(tx.date).toBe('2024-03-14')
    expect(tx.description).toBe('STARBUCKS STORE #123')
    expect(tx.amount).toBe(-5.75)
  })

  it('parses a full mm/dd/yyyy date', () => {
    const [tx] = parseStatementText([['03/14/2023 AMAZON.COM 42.10']], opts)
    expect(tx.date).toBe('2023-03-14')
  })

  it('treats an explicit CR suffix as a credit (positive amount)', () => {
    const [tx] = parseStatementText([['03/15 PAYMENT RECEIVED - THANK YOU 200.00 CR']], opts)
    expect(tx.amount).toBe(200)
  })

  it('treats parenthesized amounts as credits', () => {
    const [tx] = parseStatementText([['03/16 REFUND ONLINE STORE (15.00)']], opts)
    expect(tx.amount).toBe(15)
  })

  it('treats a payment-hint description as a credit even without CR', () => {
    const [tx] = parseStatementText([['03/17 AUTOPAY PAYMENT THANK YOU 300.00']], opts)
    expect(tx.amount).toBe(300)
  })

  it('skips lines with no date or no amount', () => {
    const result = parseStatementText(
      [['Statement Period: 03/01/2024 - 03/31/2024', 'Page 1 of 3', 'Running balance']],
      opts,
    )
    expect(result).toHaveLength(0)
  })

  it('assigns unique ids per transaction', () => {
    const result = parseStatementText(
      [['03/14 COFFEE SHOP 4.50', '03/15 GROCERY STORE 62.10']],
      opts,
    )
    expect(new Set(result.map((t) => t.id)).size).toBe(2)
  })
})
