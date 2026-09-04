import { spendByCategory, summarize, totalsByMonth } from '../lib/aggregate'
import type { Transaction } from '../lib/types'
import { SummaryCards } from './SummaryCards'
import { CategoryChart } from './CategoryChart'
import { TrendChart } from './TrendChart'

export function Dashboard({ transactions }: { transactions: Transaction[] }) {
  const summary = summarize(transactions)
  const categoryTotals = spendByCategory(transactions)
  const monthTotals = totalsByMonth(transactions)

  return (
    <div className="space-y-4">
      <SummaryCards summary={summary} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryChart data={categoryTotals} />
        <TrendChart data={monthTotals} />
      </div>
    </div>
  )
}
