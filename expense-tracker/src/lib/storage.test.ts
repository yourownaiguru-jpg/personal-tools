import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_CURRENCY_SETTINGS,
  loadCurrencySettings,
  mergeTransactions,
  saveCurrencySettings,
} from './storage'
import type { Transaction } from './types'

/** Minimal in-memory stand-in — these tests run in vitest's node env. */
function stubLocalStorage(seed: Record<string, string> = {}) {
  const store = new Map(Object.entries(seed))
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  })
  return store
}

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

  it('keeps two genuinely identical purchases arriving in one upload', () => {
    const incoming = [tx({ id: 'a' }), tx({ id: 'b' })] // two identical coffees, same day
    const { merged, addedCount, duplicateCount } = mergeTransactions([], incoming)
    expect(merged).toHaveLength(2)
    expect(addedCount).toBe(2)
    expect(duplicateCount).toBe(0)
  })

  it('dedupes a re-uploaded statement containing legitimate same-day twins', () => {
    const first = mergeTransactions([], [tx({ id: 'a' }), tx({ id: 'b' })])
    const second = mergeTransactions(first.merged, [tx({ id: 'c' }), tx({ id: 'd' })])
    expect(second.merged).toHaveLength(2)
    expect(second.duplicateCount).toBe(2)
  })

  it('sorts the merged result chronologically', () => {
    const existing = [tx({ id: 'a', date: '2024-03-20' })]
    const incoming = [tx({ id: 'b', date: '2024-03-01', description: 'X' })]
    const { merged } = mergeTransactions(existing, incoming)
    expect(merged.map((t) => t.date)).toEqual(['2024-03-01', '2024-03-20'])
  })
})

describe('currency settings persistence', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('round-trips a saved setting', () => {
    stubLocalStorage()
    saveCurrencySettings({ choice: 'auto', detected: 'INR' })
    expect(loadCurrencySettings()).toEqual({ choice: 'auto', detected: 'INR' })
  })

  it('defaults when nothing has been stored', () => {
    stubLocalStorage()
    expect(loadCurrencySettings()).toEqual(DEFAULT_CURRENCY_SETTINGS)
  })

  it('falls back per field when storage holds junk', () => {
    // Hand-edited or corrupted storage must not blank out the dashboard.
    stubLocalStorage({
      'expense-tracker:currency:v1': JSON.stringify({ choice: 'BITCOIN', detected: 'INR' }),
    })
    expect(loadCurrencySettings()).toEqual({ choice: 'auto', detected: 'INR' })
  })

  it('survives unparseable storage', () => {
    stubLocalStorage({ 'expense-tracker:currency:v1': 'not json' })
    expect(loadCurrencySettings()).toEqual(DEFAULT_CURRENCY_SETTINGS)
  })

  it('degrades to defaults when localStorage is unreachable', () => {
    // Safari's "Block all cookies" throws on access rather than returning null.
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('SecurityError')
      },
      setItem() {
        throw new Error('SecurityError')
      },
    })
    expect(loadCurrencySettings()).toEqual(DEFAULT_CURRENCY_SETTINGS)
    expect(() => saveCurrencySettings({ choice: 'INR', detected: 'INR' })).not.toThrow()
  })
})
