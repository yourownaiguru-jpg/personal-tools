export interface Transaction {
  id: string
  date: string // ISO yyyy-mm-dd
  description: string
  /** Negative = money out (expense), positive = money in (income/credit). */
  amount: number
  category: string
  account: string
  sourceStatement: string
}

export interface CategoryRule {
  category: string
  keywords: string[]
}
