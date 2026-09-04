import type { CategoryRule } from './types'

export const DEFAULT_RULES: CategoryRule[] = [
  {
    category: 'Groceries',
    keywords: [
      'grocery', 'supermarket', 'whole foods', 'trader joe', 'safeway', 'kroger', 'aldi', 'costco', 'publix',
      // India
      'bigbasket', 'dmart', 'reliance fresh', 'reliance smart', 'more supermarket', 'grofers', 'blinkit', 'zepto', 'nature basket',
    ],
  },
  {
    category: 'Dining',
    keywords: [
      'restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'doordash', 'uber eats', 'grubhub', 'pizza', 'chipotle',
      // India
      'swiggy', 'zomato', 'dominos', 'cafe coffee day', 'barbeque nation', 'haldiram',
    ],
  },
  {
    category: 'Transport',
    keywords: [
      'uber', 'lyft', 'shell', 'chevron', 'exxon', 'gas station', 'parking', 'transit', 'metro', 'toll',
      // India — "ola" alone would match "coca-cola", so it's qualified
      'ola cabs', 'olacabs', 'ola money', 'rapido', 'irctc', 'redbus', 'indian oil', 'bharat petroleum', 'hp petrol', 'fastag',
    ],
  },
  {
    category: 'Utilities',
    keywords: [
      // "internet" alone is deliberately excluded — it collides with
      // merchant legal names like "FLIPKART INTERNET PVT LTD".
      'electric', 'water bill', 'gas bill', 'internet bill', 'broadband', 'comcast', 'verizon', 'at&t', 'utility', 'xfinity', 'spectrum',
      // India
      // "jio" alone is deliberately excluded — Reliance Jio also runs
      // JioCinema (Subscriptions) and JioMart (Shopping) under the same brand.
      'airtel', 'jio recharge', 'jio prepaid', 'jio postpaid', 'jio fiber', 'vodafone idea', 'vi recharge', 'bses', 'tata power', 'adani electricity', 'mahanagar gas', 'act fibernet', 'hathway',
    ],
  },
  {
    category: 'Subscriptions',
    keywords: [
      'netflix', 'spotify', 'hulu', 'disney+', 'amazon prime', 'subscription', 'icloud', 'youtube premium', 'patreon',
      // India
      'hotstar', 'jiocinema', 'sonyliv', 'zee5',
    ],
  },
  {
    category: 'Shopping',
    keywords: [
      'amazon', 'target', 'walmart', 'best buy', 'ebay', 'etsy', 'ikea',
      // India
      'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa', 'croma', 'reliance digital',
    ],
  },
  {
    category: 'Health',
    keywords: [
      'pharmacy', 'cvs', 'walgreens', 'doctor', 'clinic', 'hospital', 'dental', 'urgent care',
      // India
      'apollo pharmacy', 'medplus', 'pharmeasy', '1mg', 'netmeds',
    ],
  },
  {
    category: 'Travel',
    keywords: [
      'airline', 'hotel', 'airbnb', 'expedia', 'delta', 'united airlines', 'marriott', 'booking.com',
      // India
      'indigo', 'air india', 'spicejet', 'makemytrip', 'goibibo', 'oyo',
    ],
  },
  {
    category: 'Income',
    keywords: ['payroll', 'direct deposit', 'salary', 'employer', 'salary credit'],
  },
  {
    category: 'Payment',
    keywords: [
      'payment received', 'payment thank you', 'autopay', 'online payment',
      // India — generic bank transfer rails, used for bill pay and P2P alike
      'neft', 'imps', 'rtgs', 'upi',
    ],
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
