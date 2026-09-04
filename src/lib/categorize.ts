import type { CategoryRule } from './types'

export const DEFAULT_RULES: CategoryRule[] = [
  {
    category: 'Groceries',
    keywords: ['grocery', 'supermarket', 'whole foods', 'trader joe', 'safeway', 'kroger', 'aldi', 'costco', 'publix'],
  },
  {
    category: 'Dining',
    keywords: ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'doordash', 'uber eats', 'grubhub', 'pizza', 'chipotle'],
  },
  {
    category: 'Transport',
    keywords: ['uber', 'lyft', 'shell', 'chevron', 'exxon', 'gas station', 'parking', 'transit', 'metro', 'toll'],
  },
  {
    category: 'Utilities',
    keywords: ['electric', 'water bill', 'gas bill', 'internet', 'comcast', 'verizon', 'at&t', 'utility', 'xfinity'],
  },
  {
    category: 'Subscriptions',
    keywords: ['netflix', 'spotify', 'hulu', 'disney+', 'amazon prime', 'subscription', 'icloud', 'youtube premium', 'patreon'],
  },
  {
    category: 'Shopping',
    keywords: ['amazon', 'target', 'walmart', 'best buy', 'ebay', 'etsy', 'ikea'],
  },
  {
    category: 'Health',
    keywords: ['pharmacy', 'cvs', 'walgreens', 'doctor', 'clinic', 'hospital', 'dental', 'urgent care'],
  },
  {
    category: 'Travel',
    keywords: ['airline', 'hotel', 'airbnb', 'expedia', 'delta', 'united airlines', 'marriott', 'booking.com'],
  },
  {
    category: 'Income',
    keywords: ['payroll', 'direct deposit', 'salary', 'employer'],
  },
  {
    category: 'Payment',
    keywords: ['payment received', 'payment thank you', 'autopay', 'online payment'],
  },
]

/**
 * Assigns a category by matching keywords against the transaction
 * description. Rules are checked in order; the first match wins, so more
 * specific rules should be placed before more general ones.
 */
export function categorize(description: string, rules: CategoryRule[] = DEFAULT_RULES): string {
  const lower = description.toLowerCase()
  for (const rule of rules) {
    if (rule.keywords.some((keyword) => lower.includes(keyword))) {
      return rule.category
    }
  }
  return 'Uncategorized'
}

export function categorizeAll<T extends { description: string; category: string }>(
  transactions: T[],
  rules: CategoryRule[] = DEFAULT_RULES,
): T[] {
  return transactions.map((t) => ({ ...t, category: categorize(t.description, rules) }))
}
