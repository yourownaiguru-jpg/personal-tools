import type { Summary } from '../lib/aggregate'
import { formatCurrency, type Currency } from '../lib/currency'
import { CHART_COLORS } from '../lib/palette'

export function SummaryCards({ summary, currency }: { summary: Summary; currency: Currency }) {
  const format = (value: number) => formatCurrency(value, currency, { maximumFractionDigits: 0 })
  const netColor = summary.net >= 0 ? CHART_COLORS.green : CHART_COLORS.red

  const tiles = [
    { label: 'Total spent', value: format(summary.totalExpenses) },
    { label: 'Total income', value: format(summary.totalIncome) },
    { label: 'Net', value: format(summary.net), color: netColor },
    { label: 'Transactions', value: summary.count.toLocaleString() },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
        >
          <p className="text-xs text-slate-500">{tile.label}</p>
          <p
            className="mt-1 text-xl font-semibold tabular-nums"
            style={{ color: tile.color ?? '#f8fafc' }}
          >
            {tile.value}
          </p>
        </div>
      ))}
    </div>
  )
}
