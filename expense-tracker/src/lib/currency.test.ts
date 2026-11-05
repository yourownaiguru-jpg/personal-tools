import { describe, expect, it } from 'vitest'
import { formatCurrency, guessCurrency } from './currency'

describe('guessCurrency', () => {
  it('detects rupees from the ₹ symbol', () => {
    expect(guessCurrency([['05/03/2024 SWIGGY BANGALORE ₹450.00 Dr']])).toBe('INR')
  })

  it('detects rupees from "Rs." and "INR" written out', () => {
    expect(guessCurrency([['05/03/2024 BIGBASKET Rs.1,299.00']])).toBe('INR')
    expect(guessCurrency([['Closing balance INR 45,000.00']])).toBe('INR')
  })

  it('detects rupees from UPI/NEFT lines on a statement that prints no symbol', () => {
    // Many Indian bank PDFs give amounts as bare numbers in Debit/Credit
    // columns — the banking vocabulary is the only currency evidence there.
    expect(
      guessCurrency([['05-03-2024 UPI-SWIGGY INSTAMART-swiggy@icici 450.00 44,550.00']]),
    ).toBe('INR')
  })

  it('detects dollars, pounds, and euros from their symbols', () => {
    expect(guessCurrency([['03/14/2024 STARBUCKS $5.75']])).toBe('USD')
    expect(guessCurrency([['14/03/2024 TESCO £12.40']])).toBe('GBP')
    expect(guessCurrency([['14/03/2024 LIDL €12,40']])).toBe('EUR')
  })

  it('picks the most frequent symbol, not the first one seen', () => {
    // A rupee statement mentioning one USD forex charge stays in rupees.
    expect(
      guessCurrency([
        [
          '02/03/2024 INTL TXN USD 20.00 MARKUP',
          '05/03/2024 SWIGGY ₹450.00',
          '06/03/2024 BIGBASKET ₹1,299.00',
        ],
      ]),
    ).toBe('INR')
  })

  it('reads Dr/Cr amount markers as rupees when no symbol is printed', () => {
    // The India credit card sample statement is exactly this shape.
    expect(guessCurrency([['05/03/2024 SWIGGY BANGALORE 450.00 Dr']])).toBe('INR')
    expect(guessCurrency([['12/03/2024 PAYMENT RECEIVED 5,000.00 Cr']])).toBe('INR')
  })

  it('does not read a street address as a debit marker', () => {
    expect(guessCurrency([['03/14/2024 SHELL 123 MAIN DR 42.00']])).toBe('USD')
  })

  it('defaults to dollars with no evidence either way', () => {
    expect(guessCurrency([['03/14/2024 SOME MERCHANT 25.00']])).toBe('USD')
  })
})

describe('formatCurrency', () => {
  it('renders rupee amounts with the ₹ symbol and lakh grouping', () => {
    const formatted = formatCurrency(1234567, 'INR', { maximumFractionDigits: 0 })
    expect(formatted).toContain('₹')
    // 12,34,567 in the Indian system — not 1,234,567.
    expect(formatted).toContain('12,34,567')
  })

  it('renders dollar amounts with the $ symbol', () => {
    expect(formatCurrency(1234.5, 'USD')).toContain('$')
  })

  it('passes number-format options through', () => {
    expect(formatCurrency(1234.56, 'USD', { maximumFractionDigits: 0 })).not.toContain('.')
  })
})
