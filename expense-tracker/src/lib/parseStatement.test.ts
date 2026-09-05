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

  it('recognizes an unambiguous dd/mm date and swaps it', () => {
    const [tx] = parseStatementText([['25/03 LOCAL SHOP 12.00']], opts)
    expect(tx.date).toBe('2024-03-25')
  })

  it('rejects impossible dates', () => {
    const result = parseStatementText([['45/03 BROKEN LINE 12.00']], opts)
    expect(result).toHaveLength(0)
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

  describe('India / international formats', () => {
    it('parses a dd/mm/yyyy date when dateFormat is DMY', () => {
      const [tx] = parseStatementText(
        [['05/03/2024 SWIGGY BANGALORE 450.00']],
        { ...opts, dateFormat: 'DMY' },
      )
      expect(tx.date).toBe('2024-03-05')
    })

    it('reads a ₹ amount and an explicit Dr suffix as an expense', () => {
      const [tx] = parseStatementText(
        [['05/03/2024 SWIGGY BANGALORE ₹450.00 Dr']],
        { ...opts, dateFormat: 'DMY' },
      )
      expect(tx.amount).toBe(-450)
      expect(tx.description).toBe('SWIGGY BANGALORE')
    })

    it('reads an explicit Cr suffix as income even with a generic description', () => {
      const [tx] = parseStatementText(
        [['12/03/2024 NEFT CR-ACME CORP-SALARY ₹55,000.00 Cr']],
        { ...opts, dateFormat: 'DMY' },
      )
      expect(tx.amount).toBe(55000)
    })

    it('handles a glued marker with no space ("500.00Dr")', () => {
      const [tx] = parseStatementText([['05/03/2024 ATM WDL 500.00Dr']], { ...opts, dateFormat: 'DMY' })
      expect(tx.amount).toBe(-500)
    })

    it('parses [amount, balance] using the Dr/Cr marker on the amount', () => {
      const [tx] = parseStatementText(
        [['01/03/2024 UPI-SWIGGY INSTAMART-swiggy@icici 450.00 Dr 45,230.00']],
        { ...opts, dateFormat: 'DMY' },
      )
      expect(tx.amount).toBe(-450)
      expect(tx.description).toBe('UPI-SWIGGY INSTAMART-swiggy@icici')
    })

    it('infers [amount, balance] sign from balance increasing when no marker is present', () => {
      const lines = [
        '01/03/2024 OPENING BALANCE 100.00 10000.00',
        '05/03/2024 UPI-SALARY CREDIT-XXXXXX 55000.00 65000.00',
      ]
      const result = parseStatementText([lines], { ...opts, dateFormat: 'DMY' })
      // First line establishes lastBalance=10000 with no prior balance to
      // compare against, so it falls back to the credit-hint heuristic
      // (no hint here -> treated as an expense, matching documented
      // best-effort behavior for the very first row of a statement).
      expect(result[0].amount).toBe(-100)
      // Second line: balance rose 10000 -> 65000, so despite no marker the
      // transaction is inferred as a credit.
      expect(result[1].amount).toBe(55000)
    })

    it('infers [amount, balance] sign from balance decreasing when no marker is present', () => {
      const lines = [
        '01/03/2024 OPENING BALANCE 100.00 10000.00',
        '05/03/2024 UPI-SWIGGY INSTAMART 450.00 9550.00',
      ]
      const result = parseStatementText([lines], { ...opts, dateFormat: 'DMY' })
      expect(result[1].amount).toBe(-450)
    })

    it('parses a [debit, credit, balance] row where debit is nonzero', () => {
      const [tx] = parseStatementText(
        [['01/03/2024 UPI-SWIGGY INSTAMART-swiggy@icici 450.00 0.00 45,230.00']],
        { ...opts, dateFormat: 'DMY' },
      )
      expect(tx.amount).toBe(-450)
      expect(tx.description).toBe('UPI-SWIGGY INSTAMART-swiggy@icici')
    })

    it('parses a [debit, credit, balance] row where credit is nonzero', () => {
      const [tx] = parseStatementText(
        [['05/03/2024 UPI-SALARY CREDIT-XXXXXX 0.00 55,000.00 100,230.00']],
        { ...opts, dateFormat: 'DMY' },
      )
      expect(tx.amount).toBe(55000)
    })

    it('skips a [debit, credit, balance] row where both debit and credit are zero', () => {
      const result = parseStatementText(
        [['10/03/2024 BALANCE RESTATED 0.00 0.00 45,230.00']],
        { ...opts, dateFormat: 'DMY' },
      )
      expect(result).toHaveLength(0)
    })
  })
})

describe('currency-prefixed amounts', () => {
  it('parses "Rs." glued to the number, as Indian statements print it', () => {
    const [t] = parseStatementText([['05/03/2024 SWIGGY BANGALORE Rs.450.00 Dr']], {
      ...opts,
      dateFormat: 'DMY',
    })
    expect(t.amount).toBe(-450)
    expect(t.description).toBe('SWIGGY BANGALORE')
  })

  it('parses an INR-prefixed credit', () => {
    const [t] = parseStatementText([['12/03/2024 PAYMENT RECEIVED INR5,000.00 Cr']], {
      ...opts,
      dateFormat: 'DMY',
    })
    expect(t.amount).toBe(5000)
  })

  it('still parses the ₹ and $ symbol forms', () => {
    const [rupees] = parseStatementText([['05/03/2024 SWIGGY ₹450.00']], {
      ...opts,
      dateFormat: 'DMY',
    })
    expect(rupees.amount).toBe(-450)
    const [dollars] = parseStatementText([['03/14/2024 STARBUCKS $5.75']], opts)
    expect(dollars.amount).toBe(-5.75)
  })
})
